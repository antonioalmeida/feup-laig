var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 * @constructor
 */
function XMLscene(interface) {
    CGFscene.call(this);

    this.interface = interface;

    this.lightValues = {};

    this.graphs = [];
    this.graphIndex = null;

    this.game = null;

    this.currTime = new Date().getTime();
    this.startTime = -1;
    this.delta = 0;

    //Auxiliar variables for camera
    this.oldPerspective = 0;
    this.cameraTransition = null;

    // Game options retrieved from GUI in their default values
    this.perspective = 0;
    this.difficulty = MyCheversi.difficulty.MEDIUM;
    this.gameMode = MyCheversi.mode.SINGLEPLAYER;
    this.player = MyCheversi.player.WHITE;
    this.turnTime = 30;
    this.realisticPieces = false;
    this.highlightTiles = true;
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
    this.gl.enable(this.gl.BLEND);
	this.gl.blendEquation(this.gl.FUNC_ADD);
	this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.axis = new CGFaxis(this);

    //Update period of 20ms
    this.setUpdatePeriod(20);

    //Enable object picking
    this.setPickEnabled(true);

    this.game = new MyCheversi(this);
}

/**
 * Initializes the scene lights with the values read from the LSX file.
 */
XMLscene.prototype.initLights = function() {
    if(this.graphIndex === null)
        return;

    //Reset lights so lights from previous scene do not interfere
    this.lightValues = {};
    for(let i = 0; i < 8; ++i) {
        this.lights[i].setVisible(false);
        this.lights[i].disable();
        this.lights[i].update();
    }

    var i = 0;
    // Lights index.

    // Reads the lights from the scene graph.
    for (var key in this.graphs[this.graphIndex].lights) {
        if (i >= 8)
            break;              // Only eight lights allowed by WebGL.

        if (this.graphs[this.graphIndex].lights.hasOwnProperty(key)) {
            var light = this.graphs[this.graphIndex].lights[key];

            this.lights[i].setPosition(light[1][0], light[1][1], light[1][2], light[1][3]);
            this.lights[i].setAmbient(light[2][0], light[2][1], light[2][2], light[2][3]);
            this.lights[i].setDiffuse(light[3][0], light[3][1], light[3][2], light[3][3]);
            this.lights[i].setSpecular(light[4][0], light[4][1], light[4][2], light[4][3]);

            this.lights[i].setVisible(false);
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
    this.camera = new CGFcamera(0.6,0.1,500,vec3.fromValues(20, 20, 20),vec3.fromValues(0, 7.5, 0));
    this.camera.zoom(20);
}

/* Handler called when the graph is finally loaded.
 * As loading is asynchronous, this may be called already after the application has started the run loop
 */
XMLscene.prototype.onGraphLoaded = function()
{
    if(this.graphIndex === null)
        return;

    this.camera.near = this.graphs[this.graphIndex].near;
    this.camera.far = this.graphs[this.graphIndex].far;
    this.axis = new CGFaxis(this,this.graphs[this.graphIndex].referenceLength);

    this.setGlobalAmbientLight(this.graphs[this.graphIndex].ambientIllumination[0], this.graphs[this.graphIndex].ambientIllumination[1],
    this.graphs[this.graphIndex].ambientIllumination[2], this.graphs[this.graphIndex].ambientIllumination[3]);

    this.gl.clearColor(this.graphs[this.graphIndex].background[0], this.graphs[this.graphIndex].background[1], this.graphs[this.graphIndex].background[2], this.graphs[this.graphIndex].background[3]);

    this.initLights();

    // Adds lights group.
    this.interface.addLightsGroup(this.graphs[this.graphIndex].lights);

    // Update game visuals' properties
    this.game.updateVisuals(this.graphs[this.graphIndex].gamevisuals);
}

/**
 * Update scene
 */
XMLscene.prototype.update = function(currTime) {
    //Update time gone since start of app
    this.currTime = currTime;
    if(this.startTime == -1)
        this.startTime = currTime;
    else
        this.delta = (currTime - this.startTime) / 1000;

    //Update selection shader and marker time
    let factor = Math.abs(Math.sin(0.005*currTime));
    if(this.game != null) {
        this.game.shaders.selected.setUniformsValues({timeFactor: factor});
        this.game.marker.update(currTime);
    }

    //Change camera perspective, if the case
    if(this.cameraTransition !== null) {
        this.cameraTransition.update();
        if(this.cameraTransition.done)
            this.cameraTransition = null;
    }
}

/**
 * Checks if user picked any object and acts accordingly
 */
XMLscene.prototype.logPicking = function() {
    if (this.pickMode == false) {
    	if (this.pickResults != null && this.pickResults.length > 0) {
    		for (var i=0; i< this.pickResults.length; i++) {
    			var obj = this.pickResults[i][0];
                  if(obj) {
                        if(!(obj instanceof MyTile))
                            this.game.pickPiece(obj);
                        else
                            this.game.makeMove(obj);
                        var customId = this.pickResults[i][1];
                        console.log("Picked object: " + obj + ", with pick id " + customId);
                  }
    		}
    		this.pickResults.splice(0,this.pickResults.length);
    	}
    }
}

XMLscene.prototype.changePerspective = function() {
    this.cameraTransition = new MyCameraAnimation(this, parseInt(this.oldPerspective), parseInt(this.perspective));
    this.oldPerspective = this.perspective;
}

XMLscene.prototype.startGame = function() {
    // values from dat.gui get casted to string
    let mode = parseInt(this.gameMode);
    let player = parseInt(this.player);
    let difficulty = parseInt(this.difficulty);

    this.game.startGame(mode, player, difficulty);
}

XMLscene.prototype.undoMove = function() {
    this.game.undoMove();
}

XMLscene.prototype.watchMovie = function() {
    this.game.watchMovie();
}

XMLscene.prototype.loadGraphs = function(filenames) {
    this.scenarioNames = filenames;
    for(let id in filenames)
        this.graphs.push(new MySceneGraph(filenames[id]+'.xml', this));

    this.graphIndex = 0;

    //Add game buttons
    this.interface.addGameButtons(filenames);
}

/**
 * Displays the scene.
 */
XMLscene.prototype.display = function() {
    this.logPicking();
    this.clearPickRegistration();
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

    if (this.graphIndex !== null && this.graphs[this.graphIndex].loadedOk) {
        // Applies initial transformations.
        this.multMatrix(this.graphs[this.graphIndex].initialTransforms);

        var i = 0;
        for (var key in this.lightValues) {
            if (this.lightValues.hasOwnProperty(key)) {
                if (this.lightValues[key])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();
                this.lights[i].update();
                i++;
            }
        }

        // Displays the scene.
        this.graphs[this.graphIndex].displayScene();
    }
	else // Draw axis
		this.axis.display();

    this.game.display();

    this.popMatrix();

    // ---- END Background, camera and axis setup

}
