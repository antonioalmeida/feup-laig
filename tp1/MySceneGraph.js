var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var INITIALS_INDEX = 0;
var ILLUMINATION_INDEX = 1;
var LIGHTS_INDEX = 2;
var TEXTURES_INDEX = 3;
var MATERIALS_INDEX = 4;
var NODES_INDEX = 6;

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
            if (index != indexes[i])
                this.onXMLMinorError("tag <" + tags[i] + "> out of order");

            if ((error = this.parseElement(index, nodes[index])) != null)
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

        if ((frustumError = this.checkNullAndNaN(this.near, "unable to parse value for near plane", "non-numeric value found for near plane")) != null)
            return frustumErrror;

        if ((frustumError = this.checkNullAndNaN(this.far, "unable to parse value for far plane", "non-numeric value found for far plane")) != null)
            return frustumErrror;

        if (this.near <= 0) {
            this.near = 0.1;
            this.onXMLMinorError("'near' plane must be positive; clamping to 0.1");
        }

        if (this.near >= this.far)
            return "'near' must be smaller than 'far'";
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

    if ((translationError = this.checkNullAndNaN(tx, 'unable to parse x-value of initial translation', 'x-value of initial translation is non-numeric')) != null)
        return translationError;

    if ((translationError = this.checkNullAndNaN(ty, 'unable to parse y-value of initial translation', 'y-value of initial translation is non-numeric')) != null)
        return translationError;

    if ((translationError = this.checkNullAndNaN(tz, 'unable to parse z-value of initial translation', 'z-value of initial translation is non-numeric')) != null)
        return translationError;

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
        return rotationError;

    // Second rotation.
    if ((rotationError = this.parseRotation(children[secondRotationIndex], initialRotations, rotationDefined, rotationOrder)) != null)
        return rotationError;

    // First rotation.
    if ((rotationError = this.parseRotation(children[firstRotationIndex], initialRotations, rotationDefined, rotationOrder)) != null)
        return rotationError;

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

    if ((scalingError = this.checkNullAndNaN(sx, 'unable to parse x-value of initial scale', 'x-value of initial scale is non-numeric')) != null)
        return scalingError;

    if ((scalingError = this.checkNullAndNaN(sy, 'unable to parse y-value of initial scale', 'y-value of initial scale is non-numeric')) != null)
        return scalingError;

    if ((scalingError = this.checkNullAndNaN(sz, 'unable to parse z-value of initial scale', 'z-value of initial scale is non-numeric')) != null)
        return scalingError;

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

        if ((lengthError = this.checkNullAndNaN(this.referenceLength, "unable to parse reference length value", "reference length value is non-numeric")) != null)
            return lengthError;

        if (length < 0)
            this.onXMLMinorError("reference length must be a non-negative value; clamping to 1");
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

    // Reads the ambient and background values.
    var children = illuminationNode.children;
    var nodeNames = [];
    for (var i = 0; i < children.length; i++)
        nodeNames.push(children[i].nodeName);

    // Retrieves the global ambient illumination.
    this.ambientIllumination = [];
    var ambientIndex = nodeNames.indexOf("ambient");
    if (ambientIndex != -1) {
        var ambientError = null;
        // R.
        if ((ambientError = this.parseRGBAvalue(children[ambientIndex], this.ambientIllumination, "ambient", 'r', "ILLUMINATION")) != null)
            return ambientError;
        // G.
        if ((ambientError = this.parseRGBAvalue(children[ambientIndex], this.ambientIllumination, "ambient", 'g', "ILLUMINATION")) != null)
            return ambientError;
        // B.
        if ((ambientError = this.parseRGBAvalue(children[ambientIndex], this.ambientIllumination, "ambient", 'b', "ILLUMINATION")) != null)
            return ambientError;
        // A.
        if ((ambientError = this.parseRGBAvalue(children[ambientIndex], this.ambientIllumination, "ambient", 'a', "ILLUMINATION")) != null)
            return ambientError;
    } else {
        this.ambientIllumination.push(0.1, 0.1, 0.1, 1);
        this.onXMLMinorError("global ambient illumination undefined; assuming Ia = (0.1, 0.1, 0., 1)");
    }

    // Retrieves the background clear color.
    this.background = [];
    var backgroundIndex = nodeNames.indexOf("background");
    if (backgroundIndex != -1) {
        var backgroundError = null;
        // R.
        if ((backgroundError = this.parseRGBAvalue(children[backgroundIndex], this.background, "background color", 'r', "ILLUMINATION")) != null)
            return backgroundError;
        // G.
        if ((backgroundError = this.parseRGBAvalue(children[backgroundIndex], this.background, "background color", 'g', "ILLUMINATION")) != null)
            return backgroundError;
        // B.
        if ((backgroundError = this.parseRGBAvalue(children[backgroundIndex], this.background, "background color", 'b', "ILLUMINATION")) != null)
            return backgroundError;
        // A.
        if ((backgroundError = this.parseRGBAvalue(children[backgroundIndex], this.background, "background color", 'a', "ILLUMINATION")) != null)
            return backgroundError;
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
                return "'enable value' is a non numeric value on the LIGHTS block";
            else if (aux != 0 && aux != 1)
                return "'enable value' must be 0 or 1 on the LIGHTS block"
            else
                enableLight = aux == 0 ? false : true;
        }

        // Retrieves the light position.
        var coords = ['x', 'y', 'z', 'w'];
        var positionLight = [];
        if (positionIndex == -1)
            return "light position undefined for ID = " + lightId;
        var coordinateError = null;
        for (let i = 0; i < coords.length; ++i) {
            let currentCoord = this.reader.getFloat(lightProperties[positionIndex], coords[i]);
            if ((coordinateError = this.checkNullAndNaN(currentCoord, "unable to parse " + coords[i] + "-coordinate of position for light with ID " + lightId, coords[i] + "-coordinate of position for light with ID " + lightId + " is non-numeric")) != null)
                return coordinateError;

            if (i == 3) { //Parsing 'w'
                if (currentCoord != 0 && currentCoord != 1)
                    return "w value of light position in light with ID " + lightId + " must be 0 or 1";
            }

            positionLight.push(currentCoord);
        }

        //Retrieve illumination aspects
        var vars = ['r', 'g', 'b', 'a'];

        // Retrieves the ambient component.
        var ambientIllumination = [];
        if (ambientIndex == -1)
            return "ambient component undefined for light with ID " + lightId;
        var ambientError = null;
        for (let i = 0; i < vars.length; ++i) {
            if ((ambientError = this.parseRGBAvalue(lightProperties[ambientIndex], ambientIllumination, "ambient", vars[i], "LIGHTS")) != null)
                return ambientError;
        }

        // Retrieves the diffuse component
        var diffuseIllumination = [];
        if (diffuseIndex == -1)
            return "diffuse component undefined for light with ID " + lightId;
        var diffuseError = null;
        for (let i = 0; i < vars.length; ++i) {
            if ((diffuseError = this.parseRGBAvalue(lightProperties[diffuseIndex], diffuseIllumination, "diffuse", vars[i], "LIGHTS")) != null)
                return diffuseError;
        }

        // Retrieves the specular component
        if (specularIndex == -1)
            return "specular component undefined for light with ID " + lightID;

        var specularIllumination = [];
        var specularError = null;
        for (let i = 0; i < vars.length; ++i) {
            if ((specularError = this.parseRGBAvalue(lightProperties[specularIndex], specularIllumination, "specular", vars[i], "LIGHTS")) != null)
                return specularError;
        }

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
        if(textureID === "null" || textureID == "clear")
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
            }
            else if (name == "amplif_factor") {
                if (amplifFactorS != null || amplifFactorT != null)
                    return "duplicate amplification factors in texture with ID " + textureID;

                amplifFactorS = this.reader.getFloat(texSpecs[j], 's');
                amplifFactorT = this.reader.getFloat(texSpecs[j], 't');

                if (amplifFactorS == null || amplifFactorT == null)
                    return "unable to parse texture amplification factors for ID " + textureID;
                else if (isNaN(amplifFactorS))
                    return "'amplifFactorS' is a non numeric value for texture with ID " + textureID;
                else if (isNaN(amplifFactorT))
                    return "'amplifFactorT' is a non numeric value for texture with ID " + textureID;
                else if (amplifFactorS <= 0 || amplifFactorT <= 0)
                    return "value for amplifFactors must be positive for texture with ID " + textureID;
            }
            else
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

    var children = materialsNode.children;
    // Each material.

    this.materials = [];

    var oneMaterialDefined = false;

    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeName != "MATERIAL") {
            this.onXMLMinorError("unknown tag name <" + children[i].nodeName + ">");
            continue;
        }

        var materialID = this.reader.getString(children[i], 'id');
        if (materialID == null)
            return "no ID defined for material";

        if (this.materials[materialID] != null)
            return "ID must be unique for each material (conflict: ID = " + materialID + ")";

        var materialSpecs = children[i].children;

        var nodeNames = [];

        for (var j = 0; j < materialSpecs.length; j++)
            nodeNames.push(materialSpecs[j].nodeName);

        // Determines the values for each field.
        // Shininess.
        var shininessIndex = nodeNames.indexOf("shininess");
        if (shininessIndex == -1)
            return "no shininess value defined for material with ID = " + materialID;
        var shininess = this.reader.getFloat(materialSpecs[shininessIndex], 'value');
        if (shininess == null)
            return "unable to parse shininess value for material with ID = " + materialID;
        else if (isNaN(shininess))
            return "'shininess' is a non numeric value";
        else if (shininess <= 0)
            return "'shininess' must be positive";

        // Specular component.
        var specularIndex = nodeNames.indexOf("specular");
        if (specularIndex == -1)
            return "no specular component defined for material with ID = " + materialID;
        var specularComponent = [];
        // R.
        var r = this.reader.getFloat(materialSpecs[specularIndex], 'r');
        if (r == null)
            return "unable to parse R component of specular reflection for material with ID = " + materialID;
        else if (isNaN(r))
            return "specular 'r' is a non numeric value on the MATERIALS block";
        else if (r < 0 || r > 1)
            return "specular 'r' must be a value between 0 and 1 on the MATERIALS block"
        specularComponent.push(r);
        // G.
        var g = this.reader.getFloat(materialSpecs[specularIndex], 'g');
        if (g == null)
            return "unable to parse G component of specular reflection for material with ID = " + materialID;
        else if (isNaN(g))
            return "specular 'g' is a non numeric value on the MATERIALS block";
        else if (g < 0 || g > 1)
            return "specular 'g' must be a value between 0 and 1 on the MATERIALS block";
        specularComponent.push(g);
        // B.
        var b = this.reader.getFloat(materialSpecs[specularIndex], 'b');
        if (b == null)
            return "unable to parse B component of specular reflection for material with ID = " + materialID;
        else if (isNaN(b))
            return "specular 'b' is a non numeric value on the MATERIALS block";
        else if (b < 0 || b > 1)
            return "specular 'b' must be a value between 0 and 1 on the MATERIALS block";
        specularComponent.push(b);
        // A.
        var a = this.reader.getFloat(materialSpecs[specularIndex], 'a');
        if (a == null)
            return "unable to parse A component of specular reflection for material with ID = " + materialID;
        else if (isNaN(a))
            return "specular 'a' is a non numeric value on the MATERIALS block";
        else if (a < 0 || a > 1)
            return "specular 'a' must be a value between 0 and 1 on the MATERIALS block";
        specularComponent.push(a);

        // Diffuse component.
        var diffuseIndex = nodeNames.indexOf("diffuse");
        if (diffuseIndex == -1)
            return "no diffuse component defined for material with ID = " + materialID;
        var diffuseComponent = [];
        // R.
        r = this.reader.getFloat(materialSpecs[diffuseIndex], 'r');
        if (r == null)
            return "unable to parse R component of diffuse reflection for material with ID = " + materialID;
        else if (isNaN(r))
            return "diffuse 'r' is a non numeric value on the MATERIALS block";
        else if (r < 0 || r > 1)
            return "diffuse 'r' must be a value between 0 and 1 on the MATERIALS block";
        diffuseComponent.push(r);
        // G.
        g = this.reader.getFloat(materialSpecs[diffuseIndex], 'g');
        if (g == null)
            return "unable to parse G component of diffuse reflection for material with ID = " + materialID;
        else if (isNaN(g))
            return "diffuse 'g' is a non numeric value on the MATERIALS block";
        else if (g < 0 || g > 1)
            return "diffuse 'g' must be a value between 0 and 1 on the MATERIALS block";
        diffuseComponent.push(g);
        // B.
        b = this.reader.getFloat(materialSpecs[diffuseIndex], 'b');
        if (b == null)
            return "unable to parse B component of diffuse reflection for material with ID = " + materialID;
        else if (isNaN(b))
            return "diffuse 'b' is a non numeric value on the MATERIALS block";
        else if (b < 0 || b > 1)
            return "diffuse 'b' must be a value between 0 and 1 on the MATERIALS block";
        diffuseComponent.push(b);
        // A.
        a = this.reader.getFloat(materialSpecs[diffuseIndex], 'a');
        if (a == null)
            return "unable to parse A component of diffuse reflection for material with ID = " + materialID;
        else if (isNaN(a))
            return "diffuse 'a' is a non numeric value on the MATERIALS block";
        else if (a < 0 || a > 1)
            return "diffuse 'a' must be a value between 0 and 1 on the MATERIALS block";
        diffuseComponent.push(a);

        // Ambient component.
        var ambientIndex = nodeNames.indexOf("ambient");
        if (ambientIndex == -1)
            return "no ambient component defined for material with ID = " + materialID;
        var ambientComponent = [];
        // R.
        r = this.reader.getFloat(materialSpecs[ambientIndex], 'r');
        if (r == null)
            return "unable to parse R component of ambient reflection for material with ID = " + materialID;
        else if (isNaN(r))
            return "ambient 'r' is a non numeric value on the MATERIALS block";
        else if (r < 0 || r > 1)
            return "ambient 'r' must be a value between 0 and 1 on the MATERIALS block";
        ambientComponent.push(r);
        // G.
        g = this.reader.getFloat(materialSpecs[ambientIndex], 'g');
        if (g == null)
            return "unable to parse G component of ambient reflection for material with ID = " + materialID;
        else if (isNaN(g))
            return "ambient 'g' is a non numeric value on the MATERIALS block";
        else if (g < 0 || g > 1)
            return "ambient 'g' must be a value between 0 and 1 on the MATERIALS block";
        ambientComponent.push(g);
        // B.
        b = this.reader.getFloat(materialSpecs[ambientIndex], 'b');
        if (b == null)
            return "unable to parse B component of ambient reflection for material with ID = " + materialID;
        else if (isNaN(b))
            return "ambient 'b' is a non numeric value on the MATERIALS block";
        else if (b < 0 || b > 1)
            return "ambient 'b' must be a value between 0 and 1 on the MATERIALS block";
        ambientComponent.push(b);
        // A.
        a = this.reader.getFloat(materialSpecs[ambientIndex], 'a');
        if (a == null)
            return "unable to parse A component of ambient reflection for material with ID = " + materialID;
        else if (isNaN(a))
            return "ambient 'a' is a non numeric value on the MATERIALS block";
        else if (a < 0 || a > 1)
            return "ambient 'a' must be a value between 0 and 1 on the MATERIALS block";
        ambientComponent.push(a);

        // Emission component.
        var emissionIndex = nodeNames.indexOf("emission");
        if (emissionIndex == -1)
            return "no emission component defined for material with ID = " + materialID;
        var emissionComponent = [];
        // R.
        r = this.reader.getFloat(materialSpecs[emissionIndex], 'r');
        if (r == null)
            return "unable to parse R component of emission for material with ID = " + materialID;
        else if (isNaN(r))
            return "emisson 'r' is a non numeric value on the MATERIALS block";
        else if (r < 0 || r > 1)
            return "emisson 'r' must be a value between 0 and 1 on the MATERIALS block";
        emissionComponent.push(r);
        // G.
        g = this.reader.getFloat(materialSpecs[emissionIndex], 'g');
        if (g == null)
            return "unable to parse G component of emission for material with ID = " + materialID;
        if (isNaN(g))
            return "emisson 'g' is a non numeric value on the MATERIALS block";
        else if (g < 0 || g > 1)
            return "emisson 'g' must be a value between 0 and 1 on the MATERIALS block";
        emissionComponent.push(g);
        // B.
        b = this.reader.getFloat(materialSpecs[emissionIndex], 'b');
        if (b == null)
            return "unable to parse B component of emission for material with ID = " + materialID;
        else if (isNaN(b))
            return "emisson 'b' is a non numeric value on the MATERIALS block";
        else if (b < 0 || b > 1)
            return "emisson 'b' must be a value between 0 and 1 on the MATERIALS block";
        emissionComponent.push(b);
        // A.
        a = this.reader.getFloat(materialSpecs[emissionIndex], 'a');
        if (a == null)
            return "unable to parse A component of emission for material with ID = " + materialID;
        else if (isNaN(a))
            return "emisson 'a' is a non numeric value on the MATERIALS block";
        else if (a < 0 || a > 1)
            return "emisson 'a' must be a value between 0 and 1 on the MATERIALS block";
        emissionComponent.push(a);

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

    // Generates a default material.
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
            else {
                var root = this.reader.getString(children[i], 'id');
                if (root == null)
                    return "failed to retrieve root node ID";
                this.idRoot = root;
            }
        } else if (nodeName == "NODE") {
            // Retrieves node ID.
            var nodeID = this.reader.getString(children[i], 'id');
            if (nodeID == null)
                return "failed to retrieve node ID";
            // Checks if ID is valid.
            if (this.nodes[nodeID] != null)
                return "node ID must be unique (conflict: ID = " + nodeID + ")";

            this.log("Processing node " + nodeID);

            // Creates node.
            this.nodes[nodeID] = new MyGraphNode(this, nodeID);

            // Gathers child nodes.
            var nodeSpecs = children[i].children;
            var specsNames = [];
            var possibleValues = ["MATERIAL", "TEXTURE", "TRANSLATION", "ROTATION", "SCALE", "DESCENDANTS"];
            for (var j = 0; j < nodeSpecs.length; j++) {
                var name = nodeSpecs[j].nodeName;
                specsNames.push(nodeSpecs[j].nodeName);

                // Warns against possible invalid tag names.
                if (possibleValues.indexOf(name) == -1)
                    this.onXMLMinorError("unknown tag <" + name + ">");
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

            // Retrieves possible transformations.
            for (var j = 0; j < nodeSpecs.length; j++) {
                switch (nodeSpecs[j].nodeName) {
                    case "TRANSLATION":
                        // Retrieves translation parameters.
                        var x = this.reader.getFloat(nodeSpecs[j], 'x');
                        if (x == null) {
                            this.onXMLMinorError("unable to parse x-coordinate of translation; discarding transform");
                            break;
                        } else if (isNaN(x))
                            return "non-numeric value for x-coordinate of translation (node ID = " + nodeID + ")";

                        var y = this.reader.getFloat(nodeSpecs[j], 'y');
                        if (y == null) {
                            this.onXMLMinorError("unable to parse y-coordinate of translation; discarding transform");
                            break;
                        } else if (isNaN(y))
                            return "non-numeric value for y-coordinate of translation (node ID = " + nodeID + ")";

                        var z = this.reader.getFloat(nodeSpecs[j], 'z');
                        if (z == null) {
                            this.onXMLMinorError("unable to parse z-coordinate of translation; discarding transform");
                            break;
                        } else if (isNaN(z))
                            return "non-numeric value for z-coordinate of translation (node ID = " + nodeID + ")";

                        mat4.translate(this.nodes[nodeID].transformMatrix, this.nodes[nodeID].transformMatrix, [x, y, z]);
                        break;
                    case "ROTATION":
                        // Retrieves rotation parameters.
                        var axis = this.reader.getItem(nodeSpecs[j], 'axis', ['x', 'y', 'z']);
                        if (axis == null) {
                            this.onXMLMinorError("unable to parse rotation axis; discarding transform");
                            break;
                        }
                        var angle = this.reader.getFloat(nodeSpecs[j], 'angle');
                        if (angle == null) {
                            this.onXMLMinorError("unable to parse rotation angle; discarding transform");
                            break;
                        } else if (isNaN(angle))
                            return "non-numeric value for rotation angle (node ID = " + nodeID + ")";

                        mat4.rotate(this.nodes[nodeID].transformMatrix, this.nodes[nodeID].transformMatrix, angle * DEGREE_TO_RAD, this.axisCoords[axis]);
                        break;
                    case "SCALE":
                        // Retrieves scale parameters.
                        var sx = this.reader.getFloat(nodeSpecs[j], 'sx');
                        if (sx == null) {
                            this.onXMLMinorError("unable to parse x component of scaling; discarding transform");
                            break;
                        } else if (isNaN(sx))
                            return "non-numeric value for x component of scaling (node ID = " + nodeID + ")";

                        var sy = this.reader.getFloat(nodeSpecs[j], 'sy');
                        if (sy == null) {
                            this.onXMLMinorError("unable to parse y component of scaling; discarding transform");
                            break;
                        } else if (isNaN(sy))
                            return "non-numeric value for y component of scaling (node ID = " + nodeID + ")";

                        var sz = this.reader.getFloat(nodeSpecs[j], 'sz');
                        if (sz == null) {
                            this.onXMLMinorError("unable to parse z component of scaling; discarding transform");
                            break;
                        } else if (isNaN(sz))
                            return "non-numeric value for z component of scaling (node ID = " + nodeID + ")";

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

                    this.log("   Descendant: " + curId);

                    if (curId == null)
                        this.onXMLMinorError("unable to parse descendant id");
                    else if (curId == nodeID)
                        return "a node may not be a child of its own";
                    else {
                        this.nodes[nodeID].addChild(curId);
                        sizeChildren++;
                    }
                } else
                if (descendants[j].nodeName == "LEAF") {
                    var type = this.reader.getItem(descendants[j], 'type', ['rectangle', 'cylinder', 'sphere', 'triangle', 'patch']);

                    if (type != null)
                        this.log("   Leaf: " + type);
                    else
                        this.warn("Error in leaf");

                    let controlPoints = [];
                    if (type == 'patch') {

                        let patchChildren = descendants[j].children;

                        for (let k = j; k < patchChildren.length; k++) { // for each CLINE
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

                        console.log(" CP LINES BEFORE : " + controlPoints);
                    }

                    //parse leaf
                    this.nodes[nodeID].addLeaf(new MyGraphLeaf(this, descendants[j], controlPoints));
                    sizeChildren++;
                } else
                    this.onXMLMinorError("unknown tag <" + descendants[j].nodeName + ">");

            }
            if (sizeChildren == 0)
                return "at least one descendant must be defined for each intermediate node";
        } else
            this.onXMLMinorError("unknown tag name <" + nodeName);
    }

    console.log("Parsed nodes");
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
    console.warn("Warning: " + message);
}

MySceneGraph.prototype.log = function(message) {
    console.log("   " + message);
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
