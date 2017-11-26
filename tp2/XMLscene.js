var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 * @constructor
 */
function XMLscene(interface) {
    CGFscene.call(this);

    this.interface = interface;

    this.lightValues = {};

    this.startTime = -1;
    this.delta = 0;

    this.selectedNode = 'No selection';

    this.selectionColorR = 1.0;
    this.selectionColorG = 0.0;
    this.selectionColorB = 0.0;

    this.selectionSize = 0.1;
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

/**
 * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
 */
XMLscene.prototype.init = function(application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.enableTextures(true);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.axis = new CGFaxis(this);

    this.selectedShader = new CGFshader(this.gl, "shaders/myVertexShader.glsl", "shaders/myFragmentShader.glsl");
    this.updateSelectionColor();
    this.updateSelectionSize();
}

/**
 * Initializes the scene lights with the values read from the LSX file.
 */
XMLscene.prototype.initLights = function() {
    var i = 0;
    // Lights index.

    // Reads the lights from the scene graph.
    for (var key in this.graph.lights) {
        if (i >= 8)
            break;              // Only eight lights allowed by WebGL.

        if (this.graph.lights.hasOwnProperty(key)) {
            var light = this.graph.lights[key];

            this.lights[i].setPosition(light[1][0], light[1][1], light[1][2], light[1][3]);
            this.lights[i].setAmbient(light[2][0], light[2][1], light[2][2], light[2][3]);
            this.lights[i].setDiffuse(light[3][0], light[3][1], light[3][2], light[3][3]);
            this.lights[i].setSpecular(light[4][0], light[4][1], light[4][2], light[4][3]);

            this.lights[i].setVisible(true);
            if (light[0])
                this.lights[i].enable();
            else
                this.lights[i].disable();

            this.lights[i].update();

            i++;
        }
    }

}

/**
 * Initializes the scene cameras.
 */
XMLscene.prototype.initCameras = function() {
    this.camera = new CGFcamera(0.4,0.1,500,vec3.fromValues(15, 15, 15),vec3.fromValues(0, 0, 0));
}

/* Handler called when the graph is finally loaded.
 * As loading is asynchronous, this may be called already after the application has started the run loop
 */
XMLscene.prototype.onGraphLoaded = function()
{
    this.camera.near = this.graph.near;
    this.camera.far = this.graph.far;
    this.axis = new CGFaxis(this,this.graph.referenceLength);

    this.setGlobalAmbientLight(this.graph.ambientIllumination[0], this.graph.ambientIllumination[1],
    this.graph.ambientIllumination[2], this.graph.ambientIllumination[3]);

    this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

    this.initLights();

    // Adds lights group.
    this.interface.addLightsGroup(this.graph.lights);

    // Adds selectable nodes
    this.interface.addSelectableListBox(this.graph.selectableNodes);

    // Adds selection parametrization
    this.interface.addSelectionParametrization();

    //Set update period to 20ms
    this.setUpdatePeriod(20);
}

/**
 * Update scene (which is basically update animations)
 */
XMLscene.prototype.update = function(currTime) {
    if(this.startTime == -1)
        this.startTime = currTime;
    else
        this.delta = (currTime - this.startTime) / 1000;

    let factor = Math.abs(Math.sin(0.005*currTime));
    this.selectedShader.setUniformsValues({timeFactor: factor});
}

/**
 * Sets the selectable shader as the active shader
 */
XMLscene.prototype.setSelectableShader = function() {
    this.setActiveShader(this.selectedShader);
}

/**
 * Sets the default shader as the active shader
 */
XMLscene.prototype.setDefaultShader = function() {
    this.setActiveShader(this.defaultShader);
}

/**
 * Updates the selection color components in the selected shader
 */
XMLscene.prototype.updateSelectionColor = function() {
    this.selectedShader.setUniformsValues({r:this.selectionColorR, g:this.selectionColorG, b:this.selectionColorB});
}

/**
 * Updates the selection size offset component in the selected shader
 */
XMLscene.prototype.updateSelectionSize = function() {
    this.selectedShader.setUniformsValues({sizeFactor: this.selectionSize});
}

/**
 * Displays the scene.
 */
XMLscene.prototype.display = function() {
    // ---- BEGIN Background, camera and axis setup

    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();

    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    this.pushMatrix();

    if (this.graph.loadedOk)
    {
        //Reset selected status
        for(let i = 0; i < this.graph.selectableNodes.length; ++i)
            this.graph.nodes[this.graph.selectableNodes[i]].selected = false;

        //Active currently selected node
        if(this.selectedNode != 'No selection')
            this.graph.nodes[this.selectedNode].selected = true;

        // Applies initial transformations.
        this.multMatrix(this.graph.initialTransforms);

		// Draw axis
		this.axis.display();

        var i = 0;
        for (var key in this.lightValues) {
            if (this.lightValues.hasOwnProperty(key)) {
                if (this.lightValues[key]) {
                    this.lights[i].setVisible(true);
                    this.lights[i].enable();
                }
                else {
                    this.lights[i].setVisible(false);
                    this.lights[i].disable();
                }
                this.lights[i].update();
                i++;
            }
        }

        // Displays the scene.
        this.graph.displayScene();

    }
	else
	{
		// Draw axis
		this.axis.display();
	}


    this.popMatrix();

    // ---- END Background, camera and axis setup

}