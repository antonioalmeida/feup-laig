var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var INITIALS_INDEX = 0;
var ILLUMINATION_INDEX = 1;
var LIGHTS_INDEX = 2;
var TEXTURES_INDEX = 3;
var MATERIALS_INDEX = 4;
var NODES_INDEX = 5;

var STOP = false;

/**
 * MySceneGraph class, representing the scene graph.
 * @constructor
 */
function MySceneGraph(filename, scene) {
    this.loadedOk = null;

    // Establish bidirectional references between scene and graph.
    this.scene = scene;
    scene.graph = this;

    this.nodes = [];
    this.idRoot = null; // The id of the root element.

    this.textureStack = [];
    this.materialStack = [];

    this.axisCoords = [];
    this.axisCoords['x'] = [1, 0, 0];
    this.axisCoords['y'] = [0, 1, 0];
    this.axisCoords['z'] = [0, 0, 1];

    // File reading
    this.reader = new CGFXMLreader();

    /*
     * Read the contents of the xml file, and refer to this class for loading and error handlers.
     * After the file is read, the reader calls onXMLReady on this object.
     * If any error occurs, the reader calls onXMLError on this object, with an error message
     */
    this.reader.open('scenes/' + filename, this);
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady = function() {
    console.log("XML Loading finished.");
    var rootElement = this.reader.xmlDoc.documentElement;

    // Here should go the calls for different functions to parse the various blocks
    var error = this.parseLSXFile(rootElement);

    if (error != null) {
        this.onXMLError(error);
        return;
    }

    this.loadedOk = true;

    // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
    this.scene.onGraphLoaded();
}

/**
 * Parses the LSX file, processing each block.
 */
MySceneGraph.prototype.parseLSXFile = function(rootElement) {
    if (rootElement.nodeName != "SCENE")
        return "root tag <SCENE> missing";

    var nodes = rootElement.children;

    // Reads the names of the nodes to an auxiliary buffer.
    var nodeNames = [];

    for (var i = 0; i < nodes.length; i++)
        nodeNames.push(nodes[i].nodeName);

    var error;

    // Processes each node, verifying errors.

    var tags = ["INITIALS", "ILLUMINATION", "LIGHTS", "TEXTURES", "MATERIALS", "NODES"];
    var indexes = [INITIALS_INDEX, ILLUMINATION_INDEX, LIGHTS_INDEX, TEXTURES_INDEX, MATERIALS_INDEX, NODES_INDEX];
    var index;

    for (let i = 0; i < tags.length; ++i) {
        if ((index = nodeNames.indexOf(tags[i])) == -1)
            return "tag <" + tags[i] + "> missing";
        else {
            var indexArg = index;
            if (index != indexes[i]){
                this.onXMLMinorError("tag <" + tags[i] + "> out of order");
                indexArg = indexes[i];
            }
            if ((error = this.parseElement(indexArg, nodes[index])) != null)
              return error;
        }
    }
}

MySceneGraph.prototype.parseElement = function(index, element) {
    switch (index) {
        case INITIALS_INDEX:
            return this.parseInitials(element);
        case ILLUMINATION_INDEX:
            return this.parseIllumination(element);
        case LIGHTS_INDEX:
            return this.parseLights(element);
        case TEXTURES_INDEX:
            return this.parseTextures(element);
        case MATERIALS_INDEX:
            return this.parseMaterials(element);
        case NODES_INDEX:
            return this.parseNodes(element);
    }
}

/**
 * Parses the <INITIALS> block.
 */
MySceneGraph.prototype.parseInitials = function(initialsNode) {

    var children = initialsNode.children;

    var nodeNames = [];

    for (var i = 0; i < children.length; i++)
        nodeNames.push(children[i].nodeName);

    // Frustum planes.
    this.near = 0.1;
    this.far = 500;
    var indexFrustum = nodeNames.indexOf("frustum");
    if (indexFrustum == -1) {
        this.onXMLMinorError("frustum planes missing. Assuming near=0.1 and far=500");
    } else {
        this.near = this.reader.getFloat(children[indexFrustum], 'near');
        this.far = this.reader.getFloat(children[indexFrustum], 'far');
        var frustumError = null;

        if ((frustumError = this.checkNullAndNaN(this.near, "unable to parse value for near plane", "non-numeric value found for near plane")) != null){
            this.onXMLMinorError(frustumError+"; defaulting to 0.1");
            this.near = 0.1;
        }

        if ((frustumError = this.checkNullAndNaN(this.far, "unable to parse value for far plane", "non-numeric value found for far plane")) != null){
            this.onXMLMinorError(frustumError+"; defaulting to 500");
            this.far = 500;
        }

        if (this.near < 0) {
            this.near = 0.1;
            this.onXMLMinorError("'near' plane must be positive; clamping to 0.1");
        }

        if (this.near >= this.far){
            this.onXMLMinorError("'near' must be smaller than 'far', maybe you accidentally switched them. Swapping values");
            let temp = this.near;
            this.near = this.far;
            this.far = temp;
        }
    }

    // Checks if at most one translation, three rotations, and one scaling are defined.
    if (initialsNode.getElementsByTagName('translation').length != 1)
        return "exactly one initial translation must be defined";

    if (initialsNode.getElementsByTagName('rotation').length != 3)
        return "exactly three initial rotations must be defined";

    if (initialsNode.getElementsByTagName('scale').length != 1)
        return "exactly one initial scaling must be defined";

    // Initial transforms.
    this.initialTranslate = [];
    this.initialScaling = [];
    this.initialRotations = [];

    // Gets indices of each element.
    var translationIndex = nodeNames.indexOf("translation");
    var thirdRotationIndex = nodeNames.indexOf("rotation");
    var secondRotationIndex = nodeNames.indexOf("rotation", thirdRotationIndex + 1);
    var firstRotationIndex = nodeNames.lastIndexOf("rotation");
    var scalingIndex = nodeNames.indexOf("scale");

    // Check initial transformations' order
    if (translationIndex > thirdRotationIndex || translationIndex > scalingIndex)
        this.onXMLMinorError("initial translation out of order; result may not be as expected");

    if (scalingIndex < firstRotationIndex)
        this.onXMLMinorError("initial scaling out of order; result may not be as expected");

    // Checks if the indices are valid and in the expected order.
    // Translation.
    this.initialTransforms = mat4.create();
    mat4.identity(this.initialTransforms);
    var tx = this.reader.getFloat(children[translationIndex], 'x');
    var ty = this.reader.getFloat(children[translationIndex], 'y');
    var tz = this.reader.getFloat(children[translationIndex], 'z');
    var translationError = null;

    if ((translationError = this.checkNullAndNaN(tx, 'unable to parse x-value of initial translation', 'x-value of initial translation is non-numeric')) != null){
        this.onXMLMinorError(translationError+"; defaulting to x = 0, therefore result may be different than expected");
        tx = 0;
    }

    if ((translationError = this.checkNullAndNaN(ty, 'unable to parse y-value of initial translation', 'y-value of initial translation is non-numeric')) != null){
        this.onXMLMinorError(translationError+"; defaulting to y = 0, therefore result may be different than expected");
        ty = 0;
    }

    if ((translationError = this.checkNullAndNaN(tz, 'unable to parse z-value of initial translation', 'z-value of initial translation is non-numeric')) != null){
        this.onXMLMinorError(translationError+"; defaulting to z = 0, therefore result may be different than expected");
        tz = 0;
    }

    mat4.translate(this.initialTransforms, this.initialTransforms, [tx, ty, tz]);

    // Rotations.
    var initialRotations = [];
    initialRotations['x'] = 0;
    initialRotations['y'] = 0;
    initialRotations['z'] = 0;

    var rotationDefined = [];
    rotationDefined['x'] = false;
    rotationDefined['y'] = false;
    rotationDefined['z'] = false;

    var axis;
    var rotationOrder = [];
    var rotationError = null;

    // Third rotation (first rotation defined).
    if ((rotationError = this.parseRotation(children[thirdRotationIndex], initialRotations, rotationDefined, rotationOrder)) != null)
        this.onXMLMinorError(rotationError+"; skipping");

    // Second rotation.
    if ((rotationError = this.parseRotation(children[secondRotationIndex], initialRotations, rotationDefined, rotationOrder)) != null)
        this.onXMLMinorError(rotationError+"; skipping");

    // First rotation.
    if ((rotationError = this.parseRotation(children[firstRotationIndex], initialRotations, rotationDefined, rotationOrder)) != null)
        this.onXMLMinorError(rotationError+"; skipping");

    // Checks for undefined rotations.
    if (!rotationDefined['x'])
        this.onXMLMinorError("rotation along the Ox axis undefined; assuming Rx = 0");
    else if (!rotationDefined['y'])
        this.onXMLMinorError("rotation along the Oy axis undefined; assuming Ry = 0");
    else if (!rotationDefined['z'])
        this.onXMLMinorError("rotation along the Oz axis undefined; assuming Rz = 0");

    // Updates transform matrix.
    for (var i = 0; i < rotationOrder.length; i++)
        mat4.rotate(this.initialTransforms, this.initialTransforms, DEGREE_TO_RAD * initialRotations[rotationOrder[i]], this.axisCoords[rotationOrder[i]]);

    // Scaling.
    var sx = this.reader.getFloat(children[scalingIndex], 'sx');
    var sy = this.reader.getFloat(children[scalingIndex], 'sy');
    var sz = this.reader.getFloat(children[scalingIndex], 'sz');
    var scalingError = null;

    if ((scalingError = this.checkNullAndNaN(sx, 'unable to parse x-value of initial scale', 'x-value of initial scale is non-numeric')) != null){
        this.onXMLMinorError(scalingError+"; defaulting to sx = 1, therefore result may be different than expected");
        sx = 1;
    }

    if ((scalingError = this.checkNullAndNaN(sy, 'unable to parse y-value of initial scale', 'y-value of initial scale is non-numeric')) != null){
        this.onXMLMinorError(scalingError+"; defaulting to sy = 1, therefore result may be different than expected");
        sy = 1;
    }

    if ((scalingError = this.checkNullAndNaN(sz, 'unable to parse z-value of initial scale', 'z-value of initial scale is non-numeric')) != null){
        this.onXMLMinorError(scalingError+"; defaulting to sz = 1, therefore result may be different than expected");
        sz = 1;
    }

    mat4.scale(this.initialTransforms, this.initialTransforms, [sx, sy, sz]);

    // ----------
    // Reference length.
    this.referenceLength = 1;

    var indexReference = nodeNames.indexOf("reference");
    if (indexReference == -1)
        this.onXMLMinorError("reference length undefined; assuming 'length = 1'");
    else {
        // Reads the reference length.
        this.referenceLength = this.reader.getFloat(children[indexReference], 'length');
        var lengthError = null;

        if ((lengthError = this.checkNullAndNaN(this.referenceLength, "unable to parse reference length value", "reference length value is non-numeric")) != null){
            this.onXMLMinorError(lengthError+"; defaulting to 1");
            this.referenceLength = 1;
        }

        if (length < 0)
            this.onXMLMinorError("reference length must be a non-negative value; defaulting to 1");
    }

    console.log("Parsed initials");
    return null;
}

MySceneGraph.prototype.checkNullAndNaN = function(valToCheck, nullError, nanError) {
    if (valToCheck == null)
        return nullError;
    if (isNaN(valToCheck))
        return nanError;
    return null;
}

MySceneGraph.prototype.parseRotation = function(elem, initialRotations, rotationDefined, rotationOrder) {
    var axis = this.reader.getItem(elem, 'axis', ['x', 'y', 'z']);
    if (axis != null) {
        var angle = this.reader.getFloat(elem, 'angle');
        if (angle != null && !isNaN(angle)) {
            initialRotations[axis] += angle;
            if (!rotationDefined[axis])
                rotationOrder.push(axis);
            rotationDefined[axis] = true;
            return null;
        } else return "failed to parse initial rotation angle";
    }
    return "failed to parse initial rotation axis";
}

MySceneGraph.prototype.parseRGBAvalue = function(element, arr, comp, rgba_comp, block) {
    var parsed = this.reader.getFloat(element, rgba_comp);
    if (parsed != null) {
        if (isNaN(parsed))
            return comp + " " + rgba_comp + " is a non numeric value on the " + block + " block";
        if (parsed < 0 || parsed > 1)
            return comp + " " + rgba_comp + " must be a value between 0 and 1 on the " + block + " block";
        arr.push(parsed);
        return null;
    } else
        return "unable to parse " + rgba_comp + " component of the " + comp + " illumination on the " + block + " block";
}

/**
 * Parses the <ILLUMINATION> block.
 */
MySceneGraph.prototype.parseIllumination = function(illuminationNode) {
    var vars = ['r', 'g', 'b', 'a'];

    // Reads the ambient and background values.
    var children = illuminationNode.children;
    var nodeNames = [];
    for (let i = 0; i < children.length; i++)
        nodeNames.push(children[i].nodeName);

    // Retrieves the global ambient illumination.
    this.ambientIllumination = [];
    var ambientIndex = nodeNames.indexOf("ambient");
    if (ambientIndex != -1) {
        var ambientError = null;
        for(let i = 0; i < vars.length; ++i){
            if ((ambientError = this.parseRGBAvalue(children[ambientIndex], this.ambientIllumination, "ambient", vars[i], "ILLUMINATION")) != null){
                if(i < 3){
                    this.onXMLMinorError(ambientError+"; defaulting to " + vars[i] + " = 0 therefore result may be different than expected");
                    this.ambientIllumination.push(0);
                }
                else{ //'A' component should default to 1 instead of 0
                    this.onXMLMinorError(ambientError+"; defaulting to " + vars[i] + " = 1 therefore result may be different than expected");
                    this.ambientIllumination.push(1);
                }
            }
        }
    } else {
        this.ambientIllumination.push(0.1, 0.1, 0.1, 1);
        this.onXMLMinorError("global ambient illumination undefined; assuming Ia = (0.1, 0.1, 0., 1)");
    }

    // Retrieves the background clear color.
    this.background = [];
    var backgroundIndex = nodeNames.indexOf("background");
    if (backgroundIndex != -1) {
        var backgroundError = null;
        for(let i = 0; i < vars.length; ++i){
        if ((backgroundError = this.parseRGBAvalue(children[backgroundIndex], this.background, "background color", vars[i], "ILLUMINATION")) != null)
            if(i < 3){
                this.onXMLMinorError(backgroundError+"; defaulting to " + vars[i] + " = 0 therefore result may be different than expected");
                this.background.push(0);
            }
            else{
                this.onXMLMinorError(backgroundError+"; defaulting to " + vars[i] + " = 1 therefore result may be different than expected");
                this.background.push(1);
            }
        }
    } else {
        this.background.push(0, 0, 0, 1);
        this.onXMLMinorError("background clear colour undefined; assuming (R, G, B, A) = (0, 0, 0, 1)");
    }

    console.log("Parsed illumination");

    return null;
}

/**
 * Parses the <LIGHTS> node.
 */
MySceneGraph.prototype.parseLights = function(lightsNode) {

    var children = lightsNode.children;

    this.lights = [];
    var numLights = 0;

    var lightProperties = [];
    var nodeNames = [];

    // Any number of lights.
    for (var i = 0; i < children.length; i++) {

        if (children[i].nodeName != "LIGHT") {
            this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
            continue;
        }

        // Get id of the current light.
        var lightId = this.reader.getString(children[i], 'id');
        if (lightId == null)
            return "no ID defined for light";

        // Checks for repeated IDs.
        if (this.lights[lightId] != null)
            return "ID must be unique for each light (conflict: ID = " + lightId + ")";

        lightProperties = children[i].children;
        // Specifications for the current light.

        nodeNames = [];
        for (var j = 0; j < lightProperties.length; j++) {
            console.log(lightProperties[j].nodeName);
            nodeNames.push(lightProperties[j].nodeName);
        }

        // Gets indices of each element.
        var enableIndex = nodeNames.indexOf("enable");
        var positionIndex = nodeNames.indexOf("position");
        var ambientIndex = nodeNames.indexOf("ambient");
        var diffuseIndex = nodeNames.indexOf("diffuse");
        var specularIndex = nodeNames.indexOf("specular");

        // Light enable/disable
        var enableLight = true;
        if (enableIndex == -1) {
           this.onXMLMinorError("enable value missing for ID = " + lightId + "; assuming 'value = 1'");
       } else {
           var aux = this.reader.getFloat(lightProperties[enableIndex], 'value');
           if (aux == null) {
               this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");
           } else if (isNaN(aux))
                this.onXMLMinorError("'enable value' is a non numeric value on the LIGHTS block; defaulting to true");
           else if (aux != 0 && aux != 1)
                this.onXMLMinorError("'enable value' must be 0 or 1 on the LIGHTS block; defaulting to true");
           else
               enableLight = aux == 0 ? false : true;
       }

        // Retrieves the light position.
        var coords = ['x', 'y', 'z', 'w'];
        var positionLight = [];
        if (positionIndex == -1){
            this.onXMLMinorError("light position undefined for ID = " + lightId+"; skipping light");
            continue;
        }
        var coordinateError = null;
        for (let i = 0; i < coords.length; ++i) {
            let currentCoord = this.reader.getFloat(lightProperties[positionIndex], coords[i]);
            if ((coordinateError = this.checkNullAndNaN(currentCoord, "unable to parse " + coords[i] + "-coordinate of position for light with ID " + lightId, coords[i] + "-coordinate of position for light with ID " + lightId + " is non-numeric")) != null){
                this.onXMLMinorError(coordinateError+"; skipping light");
                break;
            }

            if (i == 3) { //Parsing 'w'
                if (currentCoord != 0 && currentCoord != 1){
                    coordinateError = "w value of light position in light with ID " + lightId + " must be 0 or 1; skipping light";
                    this.onXMLMinorError(coordinateError);
                    break;
                }
            }

            positionLight.push(currentCoord);
        }

        if(coordinateError != null)
            continue;

        //Retrieve illumination aspects
        var vars = ['r', 'g', 'b', 'a'];

        // Retrieves the ambient component.
        var ambientIllumination = [];
        var ambientError = null;
        if (ambientIndex == -1){
            this.onXMLMinorError("ambient component undefined for light with ID " + lightId+"; defaulting to Ia = (0.1, 0.1, 0.1, 1)");
            ambientIllumination.push(0, 0, 0, 1);
        }else{
            for (let i = 0; i < vars.length; ++i) {
                if ((ambientError = this.parseRGBAvalue(lightProperties[ambientIndex], ambientIllumination, "ambient", vars[i], "LIGHTS")) != null){
                    this.onXMLMinorError(ambientError+"; skipping light");
                    break;
                }
            }
        }

        if(ambientError != null)
            continue;

        // Retrieves the diffuse component
        var diffuseIllumination = [];
        var diffuseError = null;
        if (diffuseIndex == -1) {
            this.onXMLMinorError("diffuse component undefined for light with ID " + lightId + "; defaulting to Id = (1, 1, 1, 1)");
            diffuseIllumination.push(1, 1, 1, 1);
        } else {
            for (let i = 0; i < vars.length; ++i) {
                if ((diffuseError = this.parseRGBAvalue(lightProperties[diffuseIndex], diffuseIllumination, "diffuse", vars[i], "LIGHTS")) != null) {
                    this.onXMLMinorError(diffuseError + "; skipping current light");
                    break;
                }
            }
        }

        if (diffuseError != null)
            continue;

        // Retrieves the specular component
        var specularIllumination = [];
        var specularError = null;
        if (specularIndex == -1){
            this.onXMLMinorError("specular component undefined for light with ID " + lightID+"; defaulting to Is = (1, 1, 1, 1)");
            specularIllumination.push(1, 1, 1, 1);
        }
        else{
            for (let i = 0; i < vars.length; ++i) {
                if ((specularError = this.parseRGBAvalue(lightProperties[specularIndex], specularIllumination, "specular", vars[i], "LIGHTS")) != null){
                    this.onXMLMinorError(specularError+"; skipping current light");
                    break;
                }
            }
        }

        if(specularError != null)
            continue;

        // Light global information.
        this.lights[lightId] = [enableLight, positionLight, ambientIllumination, diffuseIllumination, specularIllumination];
        numLights++;
    }

    if (numLights == 0)
        return "at least one light must be defined";
    else if (numLights > 8)
        this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights (some lights will be left out)");

    console.log("Parsed lights");

    return null;
}

/**
 * Parses the <TEXTURES> block.
 */
MySceneGraph.prototype.parseTextures = function(texturesNode) {
    this.textures = [];

    var textureArr = texturesNode.children;

    for (var i = 0; i < textureArr.length; i++) {
        var nodeName = textureArr[i].nodeName;
        if (nodeName != "TEXTURE") {
            this.onXMLMinorError("unknown tag name <" + nodeName + ">");
            continue;
        }
        // Retrieves texture ID and checks if it's unique and valid
        var textureID = this.reader.getString(textureArr[i], 'id');
        if (textureID == null)
            return "failed to parse texture ID";
        if (this.textures[textureID] != null)
            return "texture ID must unique (conflict with ID = " + textureID + ")";
        if (textureID === "null" || textureID == "clear")
            return "texture ID cannot be a keyword (null or clear)";

        var texSpecs = textureArr[i].children;
        var filepath = null;
        var amplifFactorS = null;
        var amplifFactorT = null;
        // Retrieves texture specifications.
        for (var j = 0; j < texSpecs.length; j++) {
            var name = texSpecs[j].nodeName;
            if (name == "file") {
                if (filepath != null)
                    return "duplicate file paths in texture with ID " + textureID;

                filepath = this.reader.getString(texSpecs[j], 'path');
                if (filepath == null)
                    return "unable to parse texture file path for ID = " + textureID;
            } else if (name == "amplif_factor") {
                if (amplifFactorS != null || amplifFactorT != null)
                    return "duplicate amplification factors in texture with ID " + textureID;

                amplifFactorS = this.reader.getFloat(texSpecs[j], 's');
                amplifFactorT = this.reader.getFloat(texSpecs[j], 't');

                if (amplifFactorS == null || amplifFactorT == null){
                    this.onXMLMinorError("unable to parse texture amplification factors for ID " + textureID + "; defaulting to as=at=1, results may be different than expected");
                    amplifFactorS = 1;
                    amplifFactorT = 1;
                }
                else if (isNaN(amplifFactorS)){
                    this.onXMLMinorError("'amplifFactorS' is a non numeric value for texture with ID " + textureID + "; defaulting to as=1, unexpected results may happen");
                    amplifFactorS = 1;
                }
                else if (isNaN(amplifFactorT)){
                    this.onXMLMinorError("'amplifFactorT' is a non numeric value for texture with ID " + textureID + "; defaulting to at=1, unexpected results may happen");
                    amplifFactorT = 1;
                }
                else if (amplifFactorS <= 0 || amplifFactorT <= 0){
                    this.onXMLMinorError("value for amplifFactors must be positive for texture with ID " + textureID + "; defaulting to as=at=1, results may be different than expected");
                    amplifFactorS = 1;
                    amplifFactorT = 1;
                }
            } else
                this.onXMLMinorError("unknown tag name <" + name + ">");
        }

        var texture = new CGFtexture(this.scene, "./scenes/" + filepath);
        this.textures[textureID] = [texture, amplifFactorS, amplifFactorT];
    }

    console.log("Parsed textures");
}

/**
 * Parses the <MATERIALS> node.
 */
MySceneGraph.prototype.parseMaterials = function(materialsNode) {

    var materialArr = materialsNode.children;
    this.materials = [];
    var oneMaterialDefined = false;

    for (var i = 0; i < materialArr.length; i++) {
        if (materialArr[i].nodeName != "MATERIAL") {
            this.onXMLMinorError("unknown tag name <" + materialArr[i].nodeName + ">");
            continue;
        }

        //Validate material ID
        var materialID = this.reader.getString(materialArr[i], 'id');
        if (materialID == null)
            return "no ID defined for material";
        if (this.materials[materialID] != null)
            return "ID must be unique for each material (conflict: ID = " + materialID + ")";
        if (materialID === "null")
            return "Material ID cannot be keyword null";

        var materialSpecs = materialArr[i].children;

        var nodeNames = [];

        for (var j = 0; j < materialSpecs.length; j++)
            nodeNames.push(materialSpecs[j].nodeName);

        // Determines the values for each field.
        var vars = ['r', 'g', 'b', 'a'];
        // Shininess.
        var shininessIndex = nodeNames.indexOf("shininess");
        if (shininessIndex == -1)
            return "no shininess value defined for material with ID = " + materialID;
        var shininess = this.reader.getFloat(materialSpecs[shininessIndex], 'value');
        var shininessError = null;
        if ((shininessError = this.checkNullAndNaN(shininess, "unable to parse shininess value for material with ID " + materialID, "shininess is a non numeric value")) != null)
            return shininessError;
        if (shininess <= 0)
            return "'shininess' must be positive for material with ID " + materialID;

        // Specular component.
        var specularIndex = nodeNames.indexOf("specular");
        if (specularIndex == -1)
            return "no specular component defined for material with ID = " + materialID;
        var specularComponent = [];
        var specularError = null;

        // Diffuse component.
        var diffuseIndex = nodeNames.indexOf("diffuse");
        if (diffuseIndex == -1)
            return "no diffuse component defined for material with ID = " + materialID;
        var diffuseComponent = [];
        var diffuseError = null;

        // Ambient component.
        var ambientIndex = nodeNames.indexOf("ambient");
        if (ambientIndex == -1)
            return "no ambient component defined for material with ID = " + materialID;
        var ambientComponent = [];
        var ambientError = null;

        // Emission component.
        var emissionIndex = nodeNames.indexOf("emission");
        if (emissionIndex == -1)
            return "no emission component defined for material with ID = " + materialID;
        var emissionComponent = [];
        var emissionError = null;

        for (let i = 0; i < vars.length; ++i) {
            if ((specularError = this.parseRGBAvalue(materialSpecs[specularIndex], specularComponent, "specular", vars[i], "MATERIALS")) != null)
                return specularError;
            if ((diffuseError = this.parseRGBAvalue(materialSpecs[diffuseIndex], diffuseComponent, "diffuse", vars[i], "MATERIALS")) != null)
                return specularError;
            if ((ambientError = this.parseRGBAvalue(materialSpecs[ambientIndex], ambientComponent, "ambient", vars[i], "MATERIALS")) != null)
                return specularError;
            if ((emissionError = this.parseRGBAvalue(materialSpecs[emissionIndex], emissionComponent, "emission", vars[i], "MATERIALS")) != null)
                return specularError;
        }

        // Creates material with the specified characteristics.
        var newMaterial = new CGFappearance(this.scene);
        newMaterial.setShininess(shininess);
        newMaterial.setAmbient(ambientComponent[0], ambientComponent[1], ambientComponent[2], ambientComponent[3]);
        newMaterial.setDiffuse(diffuseComponent[0], diffuseComponent[1], diffuseComponent[2], diffuseComponent[3]);
        newMaterial.setSpecular(specularComponent[0], specularComponent[1], specularComponent[2], specularComponent[3]);
        newMaterial.setEmission(emissionComponent[0], emissionComponent[1], emissionComponent[2], emissionComponent[3]);
        this.materials[materialID] = newMaterial;
        oneMaterialDefined = true;
    }

    if (!oneMaterialDefined)
        return "at least one material must be defined on the MATERIALS block";

    this.generateDefaultMaterial();

    console.log("Parsed materials");
}


/**
 * Parses the <NODES> block.
 */
MySceneGraph.prototype.parseNodes = function(nodesNode) {
    // Traverses nodes.
    var children = nodesNode.children;

    for (var i = 0; i < children.length; i++) {
        var nodeName;
        if ((nodeName = children[i].nodeName) == "ROOT") {
            // Retrieves root node.
            if (this.idRoot != null)
                return "there can only be one root node";
            var root = this.reader.getString(children[i], 'id');
            if (root == null)
                return "failed to retrieve root node ID";
            this.idRoot = root;
        }
        else if (nodeName == "NODE") {
            // Retrieves node ID.
            var nodeID = this.reader.getString(children[i], 'id');
            if (nodeID == null)
                return "failed to retrieve node ID";
            // Checks if ID is valid.
            if (this.nodes[nodeID] != null)
                return "node ID must be unique (conflict: ID = " + nodeID + ")";

            console.log("Processing node " + nodeID);

            // Creates node.
            this.nodes[nodeID] = new MyGraphNode(this, nodeID);

            // Gathers child nodes.
            var nodeSpecs = children[i].children;
            var specsNames = [];
            var possibleValues = ["MATERIAL", "TEXTURE", "TRANSLATION", "ROTATION", "SCALE", "DESCENDANTS"];
            for (let j = 0; j < nodeSpecs.length; ++j) {
                var name = nodeSpecs[j].nodeName;
                specsNames.push(name);

                // Warns against possible invalid tag names.
                if (possibleValues.indexOf(name) == -1)
                    this.onXMLMinorError("unknown tag <" + name + "> for node with ID " + nodeID);
            }

            // Retrieves material ID.
            var materialIndex = specsNames.indexOf("MATERIAL");
            if (materialIndex == -1)
                return "material must be defined (node ID = " + nodeID + ")";
            var materialID = this.reader.getString(nodeSpecs[materialIndex], 'id');
            if (materialID == null)
                return "unable to parse material ID (node ID = " + nodeID + ")";
            if (materialID != "null" && this.materials[materialID] == null)
                return "ID does not correspond to a valid material (node ID = " + nodeID + ")";

            this.nodes[nodeID].materialID = materialID;

            // Retrieves texture ID.
            var textureIndex = specsNames.indexOf("TEXTURE");
            if (textureIndex == -1)
                return "texture must be defined (node ID = " + nodeID + ")";
            var textureID = this.reader.getString(nodeSpecs[textureIndex], 'id');
            if (textureID == null)
                return "unable to parse texture ID (node ID = " + nodeID + ")";
            if (textureID != "null" && textureID != "clear" && this.textures[textureID] == null)
                return "ID does not correspond to a valid texture (node ID = " + nodeID + ")";

            this.nodes[nodeID].textureID = textureID;

            /*var nodeTransformations = nodeSpecs.filter(function(elem){
                return elem.nodeName == "TRANSLATION" || elem.nodeName == "SCALE" || elem.nodeName == "ROTATION";
            });
            */
            var nodeTransformations = nodeSpecs;

            // Retrieves possible transformations.
            for (let j = 0; j < nodeTransformations.length; ++j) {
                var dataError = null;
                switch (nodeTransformations[j].nodeName) {
                    case "TRANSLATION":
                        // Retrieves translation parameters.
                        var x = this.reader.getFloat(nodeTransformations[j], 'x');
                        if((dataError = this.checkNullAndNaN(x, "unable to parse x-coordinate for translation in node with ID " + nodeID, "non-numeric value for x-coordinate of translation in node with ID " + nodeID)) != null)
                            return dataError;

                        var y = this.reader.getFloat(nodeTransformations[j], 'y');
                        if((dataError = this.checkNullAndNaN(y, "unable to parse y-coordinate for translation in node with ID " + nodeID, "non-numeric value for y-coordinate of translation in node with ID " + nodeID)) != null)
                            return dataError;

                        var z = this.reader.getFloat(nodeTransformations[j], 'z');
                        if((dataError = this.checkNullAndNaN(z, "unable to parse z-coordinate for translation in node with ID " + nodeID, "non-numeric value for z-coordinate of translation in node with ID " + nodeID)) != null)
                            return dataError;

                        mat4.translate(this.nodes[nodeID].transformMatrix, this.nodes[nodeID].transformMatrix, [x, y, z]);
                        break;
                    case "ROTATION":
                        // Retrieves rotation parameters.
                        var axis = this.reader.getItem(nodeTransformations[j], 'axis', ['x', 'y', 'z']);
                        if (axis == null)
                            return "unable to parse rotation axis in node with ID " + nodeID;
                        var angle = this.reader.getFloat(nodeTransformations[j], 'angle');
                        if((dataError = this.checkNullAndNaN(angle, "unable to parse angle for rotation in node with ID " + nodeID, "non-numeric value for angle of rotation in node with ID " + nodeID)) != null)
                            return dataError;

                        mat4.rotate(this.nodes[nodeID].transformMatrix, this.nodes[nodeID].transformMatrix, angle * DEGREE_TO_RAD, this.axisCoords[axis]);
                        break;
                    case "SCALE":
                        // Retrieves scale parameters.
                        var sx = this.reader.getFloat(nodeTransformations[j], 'sx');
                        if((dataError = this.checkNullAndNaN(sx, "unable to parse x-coordinate for scale in node with ID " + nodeID, "non-numeric value for x-coordinate of scale in node with ID " + nodeID)) != null)
                            return dataError;

                        var sy = this.reader.getFloat(nodeTransformations[j], 'sy');
                        if((dataError = this.checkNullAndNaN(sy, "unable to parse x-coordinate for scale in node with ID " + nodeID, "non-numeric value for y-coordinate of scale in node with ID " + nodeID)) != null)
                            return dataError;

                        var sz = this.reader.getFloat(nodeTransformations[j], 'sz');
                        if((dataError = this.checkNullAndNaN(sz, "unable to parse x-coordinate for scale in node with ID " + nodeID, "non-numeric value for z-coordinate of scale in node with ID " + nodeID)) != null)
                            return dataError;

                        mat4.scale(this.nodes[nodeID].transformMatrix, this.nodes[nodeID].transformMatrix, [sx, sy, sz]);
                        break;
                    default:
                        break;
                }
            }

            // Retrieves information about children.
            var descendantsIndex = specsNames.indexOf("DESCENDANTS");
            if (descendantsIndex == -1)
                return "an intermediate node must have descendants";

            var descendants = nodeSpecs[descendantsIndex].children;

            var sizeChildren = 0;
            for (var j = 0; j < descendants.length; j++) {
                if (descendants[j].nodeName == "NODEREF") {
                    var curId = this.reader.getString(descendants[j], 'id');

                    console.log("   Descendant: " + curId);

                    if (curId == null)
                        this.onXMLMinorError("unable to parse descendant id for node with ID " + nodeID + "; skipping");
                    else if (curId == nodeID)
                        return "a node may not be a child of its own";
                    else {
                        this.nodes[nodeID].addChild(curId);
                        sizeChildren++;
                    }
                }
                else if (descendants[j].nodeName == "LEAF") {
                    var leafInfo = {};

                    var type = this.reader.getItem(descendants[j], 'type', ['rectangle', 'cylinder', 'sphere', 'triangle', 'patch']);
                    if (type == null){
                        this.onXMLMinorError("leaf type for node " + nodeID + " descendant unrecognised or couldn't be parsed; skipping");
                        continue;
                    }

                    leafInfo.type = type;
                    console.log("   Leaf: " + type);

                    var argsStr = this.reader.getString(descendants[j], 'args');
                    var args = argsStr.match(/[+-]?\d+(\.\d+)?/g); //Split numbers from string (integer or decimal) - returns values as strings
                    var argsFloat = [];
                    for(let m = 0; m < args.length; m++) // Parse args values to float
                        argsFloat[m] = parseFloat(args[m]);

                    var argsError = null;
                    if((argsError = this.checkLeafArgs(type, argsFloat)) != null){
                        console.log(argsError);
                        console.log("skipping primitive...");
                        continue;
                    }
                    leafInfo.args = argsFloat;

                    let controlPoints = [];
                    if (type == 'patch') {

                        let patchChildren = descendants[j].children;

                        for (let k = 0; k < patchChildren.length; k++) { // for each CLINE
                            let currentCPLine = [];

                            for (let index = 0; index < patchChildren[k].children.length; index++) { // for each CPOINT

                                let cPointXX = this.reader.getFloat(patchChildren[k].children[index], 'xx');
                                let cPointYY = this.reader.getFloat(patchChildren[k].children[index], 'yy');
                                let cPointZZ = this.reader.getFloat(patchChildren[k].children[index], 'zz');
                                let cPointWW = this.reader.getFloat(patchChildren[k].children[index], 'ww');

                                let currentCPoint = [cPointXX, cPointYY, cPointZZ, cPointWW];
                                currentCPLine[index] = currentCPoint;
                            }

                            controlPoints.push(currentCPLine);
                        }

                        if((argsError = this.checkControlPoints(controlPoints)) != null){
                            console.log(argsError);
                            continue;
                        }

                        console.log(" CP LINES BEFORE : " + controlPoints);
                        leafInfo.controlPoints = controlPoints;
                    }

                    this.nodes[nodeID].addLeaf(new MyGraphLeaf(this, leafInfo));
                    sizeChildren++;
                } else
                    this.onXMLMinorError("unknown tag <" + descendants[j].nodeName + ">");

            }
            if (sizeChildren == 0)
                return "at least one descendant must be defined for each intermediate node";
        }
        else
            this.onXMLMinorError("unknown tag name <" + nodeName);
    }

    console.log("Parsed nodes");
    return null;
}

MySceneGraph.prototype.checkLeafArgs = function(type, args) {
    switch(type){
        case 'rectangle':{
            if(args.length < 4) return "insufficient number of arguments for primitive rectangle";
            if(args.length > 4) this.onXMLMinorError("too many arguments for primitive rectangle");
            if(args[0] >= args[2] || args[1] <= args[3]) this.onXMLMinorError("unexpected vertices for primitive rectangle, expecting top left followed by bottom right");
            return null;
        }
        case 'cylinder':{
            if(args.length < 5) return "insufficient number of arguments for primitive cylinder";
            if(args.length > 7) this.onXMLMinorError("too many arguments for primitive cylinder");
            if(args.length == 6){ this.onXMLMinorError("missing top cover boolean arg: defaulting to 1"); args.push(1);}
            if(args.length == 5){ this.onXMLMinorError("missing cover boolean args: defaulting to 1 1"); args.push(1, 1);}
            if(args[0] <= 0) return "cylinder dimension args height must be a positive value";
            if(args.slice(1, 3).filter(function(a){return a>=0;}).length != 2) return "cylinder radius values must be non-negative";
            if(args.slice(3, 5).filter(function(a){return a > 0;}).length != 2) return "cylinder slices and stacks must be positive values";
            if(args.length > 5 && (args[5] < 0 || args[6] < 0)) return "cylinder cover args must be booleans (0 for false, positive for true)";
            return null;
        }
        case 'triangle':
            if(args.length < 9) return "insufficient number of arguments for primitive triangle";
            if(args.length > 9) this.onXMLMinorError("too many arguments for primitive triangle");
            return null;
        case 'patch':
            if(args.length < 2) return "insufficient number of arguments for primitive patch";
            if(args.length > 2) this.onXMLMinorError("too many arguments for primitive patch");
            if(args.filter(function(a){return a > 0;}).length < 2) return "patch's number of divisions on each axis must be a positive value";
            return null;
        case 'sphere':
            if(args.length < 3) return "insufficient number of arguments for primitive sphere";
            if(args.length > 3) this.onXMLMinorError("too many arguments for primitive sphere");
            if(args.filter(function(a){return a > 0;}).length < 3) return "sphere args must be positive values";
            return null;
    }
}

MySceneGraph.prototype.checkControlPoints = function(elem){
    let length = null;
    for(let i = 0; i < elem.length; ++i){
        if(i == 0) length = elem[i].length;
        else if(elem[i].length != length) return "all CPLINEs must have the same number of CPOINTs";
    }
    return null;
}

/*
 * Callback to be executed on any read error
 */
MySceneGraph.prototype.onXMLError = function(message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
}

/**
 * Callback to be executed on any minor error, showing a warning on the console.
 */
MySceneGraph.prototype.onXMLMinorError = function(message) {
    console.log("Warning: " + message);
}

/**
 * Generates a default material, with a random name. This material will be passed onto the root node, which
 * may override it.
 */
MySceneGraph.prototype.generateDefaultMaterial = function() {
    var materialDefault = new CGFappearance(this.scene);
    materialDefault.setShininess(1);
    materialDefault.setSpecular(0, 0, 0, 1);
    materialDefault.setDiffuse(0.5, 0.5, 0.5, 1);
    materialDefault.setAmbient(0, 0, 0, 1);
    materialDefault.setEmission(0, 0, 0, 1);

    // Generates random material ID not currently in use.
    this.defaultMaterialID = null;
    do this.defaultMaterialID = MySceneGraph.generateRandomString(5);
    while (this.materials[this.defaultMaterialID] != null);

    this.materials[this.defaultMaterialID] = materialDefault;
}

/**
 * Generates a random string of the specified length.
 */
MySceneGraph.generateRandomString = function(length) {
    // Generates an array of random integer ASCII codes of the specified length
    // and returns a string of the specified length.
    var numbers = [];
    for (var i = 0; i < length; i++)
        numbers.push(Math.floor(Math.random() * 256)); // Random ASCII code.

    return String.fromCharCode.apply(null, numbers);
}

/**
 * Displays the scene, processing each node, starting in the root node.
 */
MySceneGraph.prototype.displayScene = function() {
    // entry point for graph rendering
    this.nodes[this.idRoot].display('null', this.defaultMaterialID);
}
