var DEGREE_TO_RAD = Math.PI / 180;

//What the fuck is this for?
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

  for (let i = 0; i < nodes.length; i++)
    nodeNames.push(nodes[i].nodeName);

  var error;

  // Processes each tag, in their natural order in the document, verifying errors.
  var index;
  var tagsArray = ["INITIALS", "ILLUMINATION", "LIGHTS", "TEXTURES", "MATERIALS", "NODES"];

  for (let arrIndex = 0; arrIndex < tagsArray.length; ++arrIndex) {
    if ((index = nodeNames.indexOf(tagsArray[arrIndex])) == -1)
      return "tag <" + tagsArray[arrIndex] + "> missing";
    else {
      if (index != arrIndex)
        this.onXMLMinorError("tag <" + tagsArray[arrIndex] + "> out of order");

      if ((error = this.parseTag(index, nodes[index])) != null)
        return error;
    }
  }
}

/**
 * Calls a specific parsing function according to the tag index received
 */
MySceneGraph.prototype.parseTag = function(index, element) {
  switch (index) {
    case 0:
      return this.parseInitials(element);
    case 1:
      return this.parseIllumination(element);
    case 2:
      return this.parseLights(element);
    case 3:
      return this.parseTextures(element);
    case 4:
      return this.parseMaterials(element);
    case 5:
      return null; //TODO Parse leafs?
    case 6:
      return this.parseNodes(element);
    default:
      return -1; // Unknown tag
  }
}

/**
 * Parses the <INITIALS> block.
 */
MySceneGraph.prototype.parseInitials = function(initialsNode) {

  var children = initialsNode.children;

  var nodeNames = [];

  for (let i = 0; i < children.length; i++)
    nodeNames.push(children[i].nodeName);

  // Frustum planes.
  this.near = 0.1;
  this.far = 500;
  var indexFrustum = nodeNames.indexOf("frustum");
  if (indexFrustum == -1)
    this.onXMLMinorError("frustum planes missing; assuming 'near = 0.1' and 'far = 500'");
  else {
    this.near = this.reader.getFloat(children[indexFrustum], 'near');
    this.far = this.reader.getFloat(children[indexFrustum], 'far');

    if (this.near == null) {
      this.near = 0.1;
      this.onXMLMinorError("unable to parse value for near plane; assuming 'near = 0.1'");
    } else if (this.far == null) {
      this.far = 500;
      this.onXMLMinorError("unable to parse value for far plane; assuming 'far = 500'");
    } else if (isNaN(this.near)) {
      this.near = 0.1;
      this.onXMLMinorError("non-numeric value found for near plane; assuming 'near = 0.1'");
    } else if (isNaN(this.far)) {
      this.far = 500;
      this.onXMLMinorError("non-numeric value found for far plane; assuming 'far = 500'");
    } else if (this.near <= 0) {
      this.near = 0.1;
      this.onXMLMinorError("'near' must be positive; assuming 'near = 0.1'");
    }

    if (this.near >= this.far)
      return "'near' must be smaller than 'far'";
  }

  // Checks if exacty one translation, three rotations, and one scaling are defined.
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


  // Checks if the transformation indices are valid and in the expected order.
  if (translationIndex > thirdRotationIndex || translationIndex > scalingIndex)
    return "initial translation out of order";

  if (scalingIndex < firstRotationIndex)
    return "initial scaling out of order";

  // Parses and checks each transformation's parameters
  // TRANSLATION.
  this.initialTransforms = mat4.create();
  mat4.identity(this.initialTransforms);
  var transFactors = [
    this.reader.getFloat(children[translationIndex], 'x'),
    this.reader.getFloat(children[translationIndex], 'y'),
    this.reader.getFloat(children[translationIndex], 'z')
  ];

  // Checks if all three translation values are valid, throwing an error otherwise
  var transFactorError = null;
  for (let transFactorIndex = 0; transFactorIndex < 3; ++transFactorIndex) {
    if ((transFactorError = this.checkInitialTransformationComponent(transFactors[transFactorIndex], "translation")) != null)
      return transFactorError;
  }

  mat4.translate(this.initialTransforms, this.initialTransforms, transFactors);

  // ROTATIONS.
  var initialRotations = [];
  initialRotations['x'] = 0;
  initialRotations['y'] = 0;
  initialRotations['z'] = 0;

  var rotationDefined = [];
  rotationDefined['x'] = false;
  rotationDefined['y'] = false;
  rotationDefined['z'] = false;

  var rotationOrder = [];

  var rotFactorError = null;

  // Parse rotation's angle values
  if ((rotFactorError = this.parseRotationAngle(children[thirdRotationIndex], initialRotations, rotationDefined, rotationOrder)) != null)
    return rotFactorError;
  if ((rotFactorError = this.parseRotationAngle(children[secondRotationIndex], initialRotations, rotationDefined, rotationOrder)) != null)
    return rotFactorError;
  if ((rotFactorError = this.parseRotationAngle(children[firstRotationIndex], initialRotations, rotationDefined, rotationOrder)) != null)
    return rotFactorError;

  // Guarantee one rotation per axis is defined
  for (let key in rotationDefined) {
    if (!rotationDefined[key])
      return "initial rotation along O" + key + " axis undefined";
  }

  // Updates transform matrix.
  for (var i = 0; i < rotationOrder.length; i++)
    mat4.rotate(this.initialTransforms, this.initialTransforms, DEGREE_TO_RAD * initialRotations[rotationOrder[i]], this.axisCoords[rotationOrder[i]]);

  // SCALING.
  var scaFactors = [
    this.reader.getFloat(children[scalingIndex], 'sx'),
    this.reader.getFloat(children[scalingIndex], 'sy'),
    this.reader.getFloat(children[scalingIndex], 'sz')
  ];

  // Checks if all three translation values are valid, throwing an error otherwise
  var scaFactorError = null;
  for (let scaFactorIndex = 0; scaFactorIndex < 3; ++scaFactorIndex) {
    if ((scaFactorError = this.checkInitialTransformationComponent(scaFactors[scaFactorIndex], "scaling")) != null)
      return scaFactorError;
  }

  // Update transform matrix.
  mat4.scale(this.initialTransforms, this.initialTransforms, scaFactors);

  // ----------
  // Reference length.
  this.referenceLength = 1;

  var indexReference = nodeNames.indexOf("reference");
  if (indexReference == -1)
    this.onXMLMinorError("reference length undefined; assuming 'length = 1'");
  else {
    // Reads the reference length.
    var length = this.reader.getFloat(children[indexReference], 'length');

    if (length != null) {
      if (isNaN(length))
        this.onXMLMinorError("found non-numeric value for reference length; assuming 'length = 1'");
      else if (length <= 0)
        this.onXMLMinorError("reference length must be a positive value; assuming 'length = 1'");
      else
        this.referenceLength = length;
    } else
      this.onXMLMinorError("unable to parse reference length; assuming 'length = 1'");

  }

  console.log("Parsed initials");

  return null;
}

/**
 * Checks the validity of the translation and scaling's components
 */
MySceneGraph.prototype.checkInitialTransformationComponent = function(component, transformationName) {
  if (component === null)
    return "failed to parse coordinates of initial " + transformationName;
  else if (isNaN(component))
    return "found non-numeric value in coordinates of initial " + transformationName;
}

/**
 * Parses a rotation's angle
 */
MySceneGraph.prototype.parseRotationAngle = function(rotElem, initialRotations, rotationDefined, rotationOrder) {
  var axis = this.reader.getItem(rotElem, 'axis', ['x', 'y', 'z']);
  if (axis != null) {
    var angle = this.reader.getFloat(rotElem, 'angle');
    if (angle != null && !isNaN(angle)) {
      initialRotations[axis] += angle;
      if (!rotationDefined[axis])
        rotationOrder.push(axis);
      rotationDefined[axis] = true;
      return null;
    }

    return "failed to parse initial rotation angle";
  }

  return "failed to parse initial rotation axis";
}

/**
 * Parses the <ILLUMINATION> block.
 */
MySceneGraph.prototype.parseIllumination = function(illuminationNode) {
  var children = illuminationNode.children;
  var nodeNames = [];
  for (var i = 0; i < children.length; i++)
    nodeNames.push(children[i].nodeName);

  // Read the doubleside option and, if not present, don't do anything in the WebGL scene
  var doublesideIndex = nodeNames.indexOf("doubleside");
  if(doublesideIndex != -1){
    var useDoubleside = this.reader.getFloat(children[doublesideIndex], "value");
    if (useDoubleside != null && !isNaN(useDoubleside) && (useDoubleside == 0 || useDoubleside == 1))
      console.log("Success reading doubleside!");
      //A call along these lines... this is the appropriate function, apparently, but not being recognised
      //this.scene.gl.lightModeli(this.scene.gl.GL_LIGHT_MODEL_TWO_SIDE, useDoubleside);
    else
      return "failed to parse valid value from doubleside tag";
  }
  else
    this.onXMLMinorError("doubleside feature undefined; using WebGL default value");

  var components = ['r','g','b','a'];

  // Retrieves the global ambient illumination.
  this.ambientIllumination = [0.1, 0.1, 0.1, 1];
  var ambientIndex = nodeNames.indexOf("ambient");
  if (ambientIndex != -1) {
    let ambientError = null;
    // Retrieve each component and throw error if failure occurs in any of the iterations
    for(let i = 0; i < components.length; ++i){
      if((ambientError = this.parseGlobalIlluminationComponent(children[ambientIndex], components[i], "ambientIllumination", i)) != null)
        return ambientError;
    }
  } else
    this.onXMLMinorError("global ambient illumination undefined; assuming Ia = (0.1, 0.1, 0.1, 1)");

  // Retrieves the background clear color.
  this.background = [0, 0, 0, 1];
  var backgroundIndex = nodeNames.indexOf("background");
  if (backgroundIndex != -1) {
    let backgroundError = null;
    // Retrieve each component and throw error if failure occurs in any of the iterations
    for(let i = 0; i < components.length; ++i){
      if((backgroundError = this.parseGlobalIlluminationComponent(children[backgroundIndex], components[i], "background", i)) != null)
        return backgroundError;
    }
  } else
    this.onXMLMinorError("background clear colour undefined; assuming (R, G, B, A) = (0, 0, 0, 1)");

  console.log("Parsed illumination");

  return null;
}

/**
  * Parse a specific component from the global illumination attributes
  */
MySceneGraph.prototype.parseGlobalIlluminationComponent = function(attribute, component, array, index){
  var comp = this.reader.getFloat(attribute, component);
  if (comp != null) {
    if (isNaN(comp))
      return array + component + " is a non numeric value on the ILLUMINATION block";
    if (comp < 0 || comp > 1)
      return array + component + " must be a value between 0 and 1 on the ILLUMINATION block";

    this[array][index] = comp;
    return null;
  }

  return "unable to parse "+component+" component of the " + array + " colour";
}

/**
 * Parses the <LIGHTS> node.
 */
MySceneGraph.prototype.parseLights = function(lightsNode) {

  var children = lightsNode.children;

  this.lights = [];
  var numLights = 0;

  var grandChildren = [];
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

    grandChildren = children[i].children;
    // Specifications for the current light.

    nodeNames = [];
    for (var j = 0; j < grandChildren.length; j++) {
      console.log(grandChildren[j].nodeName);
      nodeNames.push(grandChildren[j].nodeName);
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
      var aux = this.reader.getFloat(grandChildren[enableIndex], 'value');
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
    var positionLight = [];
    if (positionIndex != -1) {
      // x
      var x = this.reader.getFloat(grandChildren[positionIndex], 'x');
      if (x != null) {
        if (isNaN(x))
          return "'x' is a non numeric value on the LIGHTS block";
        else
          positionLight.push(x);
      } else
        return "unable to parse x-coordinate of the light position for ID = " + lightId;

      // y
      var y = this.reader.getFloat(grandChildren[positionIndex], 'y');
      if (y != null) {
        if (isNaN(y))
          return "'y' is a non numeric value on the LIGHTS block";
        else
          positionLight.push(y);
      } else
        return "unable to parse y-coordinate of the light position for ID = " + lightId;

      // z
      var z = this.reader.getFloat(grandChildren[positionIndex], 'z');
      if (z != null) {
        if (isNaN(z))
          return "'z' is a non numeric value on the LIGHTS block";
        else
          positionLight.push(z);
      } else
        return "unable to parse z-coordinate of the light position for ID = " + lightId;

      // w
      var w = this.reader.getFloat(grandChildren[positionIndex], 'w');
      if (w != null) {
        if (isNaN(w))
          return "'w' is a non numeric value on the LIGHTS block";
        else if (w < 0 || w > 1)
          return "'w' must be a value between 0 and 1 on the LIGHTS block"
        else
          positionLight.push(w);
      } else
        return "unable to parse w-coordinate of the light position for ID = " + lightId;
    } else
      return "light position undefined for ID = " + lightId;

    // Retrieves the ambient component.
    var ambientIllumination = [];
    if (ambientIndex != -1) {
      // R
      var r = this.reader.getFloat(grandChildren[ambientIndex], 'r');
      if (r != null) {
        if (isNaN(r))
          return "ambient 'r' is a non numeric value on the LIGHTS block";
        else if (r < 0 || r > 1)
          return "ambient 'r' must be a value between 0 and 1 on the LIGHTS block"
        else
          ambientIllumination.push(r);
      } else
        return "unable to parse R component of the ambient illumination for ID = " + lightId;

      // G
      var g = this.reader.getFloat(grandChildren[ambientIndex], 'g');
      if (g != null) {
        if (isNaN(g))
          return "ambient 'g' is a non numeric value on the LIGHTS block";
        else if (g < 0 || g > 1)
          return "ambient 'g' must be a value between 0 and 1 on the LIGHTS block"
        else
          ambientIllumination.push(g);
      } else
        return "unable to parse G component of the ambient illumination for ID = " + lightId;

      // B
      var b = this.reader.getFloat(grandChildren[ambientIndex], 'b');
      if (b != null) {
        if (isNaN(b))
          return "ambient 'b' is a non numeric value on the LIGHTS block";
        else if (b < 0 || b > 1)
          return "ambient 'b' must be a value between 0 and 1 on the LIGHTS block"
        else
          ambientIllumination.push(b);
      } else
        return "unable to parse B component of the ambient illumination for ID = " + lightId;

      // A
      var a = this.reader.getFloat(grandChildren[ambientIndex], 'a');
      if (a != null) {
        if (isNaN(a))
          return "ambient 'a' is a non numeric value on the LIGHTS block";
        else if (a < 0 || a > 1)
          return "ambient 'a' must be a value between 0 and 1 on the LIGHTS block"
        ambientIllumination.push(a);
      } else
        return "unable to parse A component of the ambient illumination for ID = " + lightId;
    } else
      return "ambient component undefined for ID = " + lightId;

    // Retrieves the diffuse component
    var diffuseIllumination = [];
    if (diffuseIndex != -1) {
      // R
      var r = this.reader.getFloat(grandChildren[diffuseIndex], 'r');
      if (r != null) {
        if (isNaN(r))
          return "diffuse 'r' is a non numeric value on the LIGHTS block";
        else if (r < 0 || r > 1)
          return "diffuse 'r' must be a value between 0 and 1 on the LIGHTS block"
        else
          diffuseIllumination.push(r);
      } else
        return "unable to parse R component of the diffuse illumination for ID = " + lightId;

      // G
      var g = this.reader.getFloat(grandChildren[diffuseIndex], 'g');
      if (g != null) {
        if (isNaN(g))
          return "diffuse 'g' is a non numeric value on the LIGHTS block";
        else if (g < 0 || g > 1)
          return "diffuse 'g' must be a value between 0 and 1 on the LIGHTS block"
        else
          diffuseIllumination.push(g);
      } else
        return "unable to parse G component of the diffuse illumination for ID = " + lightId;

      // B
      var b = this.reader.getFloat(grandChildren[diffuseIndex], 'b');
      if (b != null) {
        if (isNaN(b))
          return "diffuse 'b' is a non numeric value on the LIGHTS block";
        else if (b < 0 || b > 1)
          return "diffuse 'b' must be a value between 0 and 1 on the LIGHTS block"
        else
          diffuseIllumination.push(b);
      } else
        return "unable to parse B component of the diffuse illumination for ID = " + lightId;

      // A
      var a = this.reader.getFloat(grandChildren[diffuseIndex], 'a');
      if (a != null) {
        if (isNaN(a))
          return "diffuse 'a' is a non numeric value on the LIGHTS block";
        else if (a < 0 || a > 1)
          return "diffuse 'a' must be a value between 0 and 1 on the LIGHTS block"
        else
          diffuseIllumination.push(a);
      } else
        return "unable to parse A component of the diffuse illumination for ID = " + lightId;
    } else
      return "diffuse component undefined for ID = " + lightId;

    // Retrieves the specular component
    var specularIllumination = [];
    if (specularIndex != -1) {
      // R
      var r = this.reader.getFloat(grandChildren[specularIndex], 'r');
      if (r != null) {
        if (isNaN(r))
          return "specular 'r' is a non numeric value on the LIGHTS block";
        else if (r < 0 || r > 1)
          return "specular 'r' must be a value between 0 and 1 on the LIGHTS block"
        else
          specularIllumination.push(r);
      } else
        return "unable to parse R component of the specular illumination for ID = " + lightId;

      // G
      var g = this.reader.getFloat(grandChildren[specularIndex], 'g');
      if (g != null) {
        if (isNaN(g))
          return "specular 'g' is a non numeric value on the LIGHTS block";
        else if (g < 0 || g > 1)
          return "specular 'g' must be a value between 0 and 1 on the LIGHTS block"
        else
          specularIllumination.push(g);
      } else
        return "unable to parse G component of the specular illumination for ID = " + lightId;

      // B
      var b = this.reader.getFloat(grandChildren[specularIndex], 'b');
      if (b != null) {
        if (isNaN(b))
          return "specular 'b' is a non numeric value on the LIGHTS block";
        else if (b < 0 || b > 1)
          return "specular 'b' must be a value between 0 and 1 on the LIGHTS block"
        else
          specularIllumination.push(b);
      } else
        return "unable to parse B component of the specular illumination for ID = " + lightId;

      // A
      var a = this.reader.getFloat(grandChildren[specularIndex], 'a');
      if (a != null) {
        if (isNaN(a))
          return "specular 'a' is a non numeric value on the LIGHTS block";
        else if (a < 0 || a > 1)
          return "specular 'a' must be a value between 0 and 1 on the LIGHTS block"
        else
          specularIllumination.push(a);
      } else
        return "unable to parse A component of the specular illumination for ID = " + lightId;
    } else
      return "specular component undefined for ID = " + lightId;

    // Light global information.
    this.lights[lightId] = [enableLight, positionLight, ambientIllumination, diffuseIllumination, specularIllumination];
    numLights++;
  }

  if (numLights == 0)
    return "at least one light must be defined";
  else if (numLights > 8)
    this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

  console.log("Parsed lights");

  return null;
}

/**
 * Parses the <TEXTURES> block.
 */
MySceneGraph.prototype.parseTextures = function(texturesNode) {

  this.textures = [];

  var eachTexture = texturesNode.children;
  // Each texture.

  var oneTextureDefined = false;

  for (var i = 0; i < eachTexture.length; i++) {
    var nodeName = eachTexture[i].nodeName;
    if (nodeName == "TEXTURE") {
      // Retrieves texture ID.
      var textureID = this.reader.getString(eachTexture[i], 'id');
      if (textureID == null)
        return "failed to parse texture ID";
      // Checks if ID is valid.
      if (this.textures[textureID] != null)
        return "texture ID must unique (conflict with ID = " + textureID + ")";

      var texSpecs = eachTexture[i].children;
      var filepath = null;
      var amplifFactorS = null;
      var amplifFactorT = null;
      // Retrieves texture specifications.
      for (var j = 0; j < texSpecs.length; j++) {
        var name = texSpecs[j].nodeName;
        if (name == "file") {
          if (filepath != null)
            return "duplicate file paths in texture with ID = " + textureID;

          filepath = this.reader.getString(texSpecs[j], 'path');
          if (filepath == null)
            return "unable to parse texture file path for ID = " + textureID;
        } else if (name == "amplif_factor") {
          if (amplifFactorS != null || amplifFactorT != null)
            return "duplicate amplification factors in texture with ID = " + textureID;

          amplifFactorS = this.reader.getFloat(texSpecs[j], 's');
          amplifFactorT = this.reader.getFloat(texSpecs[j], 't');

          if (amplifFactorS == null || amplifFactorT == null)
            return "unable to parse texture amplification factors for ID = " + textureID;
          else if (isNaN(amplifFactorS))
            return "'amplifFactorS' is a non numeric value";
          else if (isNaN(amplifFactorT))
            return "'amplifFactorT' is a non numeric value";
          else if (amplifFactorS <= 0 || amplifFactorT <= 0)
            return "value for amplifFactor must be positive";
        } else
          this.onXMLMinorError("unknown tag name <" + name + ">");
      }

      if (filepath == null)
        return "file path undefined for texture with ID = " + textureID;
      else if (amplifFactorS == null)
        return "s amplification factor undefined for texture with ID = " + textureID;
      else if (amplifFactorT == null)
        return "t amplification factor undefined for texture with ID = " + textureID;

      var texture = new CGFtexture(this.scene, "./scenes/" + filepath);

      this.textures[textureID] = [texture, amplifFactorS, amplifFactorT];
      oneTextureDefined = true;
    } else
      this.onXMLMinorError("unknown tag name <" + nodeName + ">");
  }

  if (!oneTextureDefined)
    return "at least one texture must be defined in the TEXTURES block";

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
          var type = this.reader.getItem(descendants[j], 'type', ['rectangle', 'cylinder', 'sphere', 'triangle']);

          if (type != null)
            this.log("   Leaf: " + type);
          else
            this.warn("Error in leaf");

          //parse leaf
          this.nodes[nodeID].addLeaf(new MyGraphLeaf(this, descendants[j]));
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
  console.error("ERROR: " + message);
  this.loadedOk = false;
}

/**
 * Callback to be executed on any minor error, showing a warning on the console.
 */
MySceneGraph.prototype.onXMLMinorError = function(message) {
  console.warn("WARNING: " + message);
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
  this.textureStack = [];
  this.materialStack = [];

  if (this.nodes[this.idRoot].textureID != 'null' && this.nodes[this.idRoot].textureID !== null)
    this.textureStack.push(this.nodes[this.idRoot].textureID);
  console.log("Initial size: " + this.textureStack.length);
  this.materialStack.push(this.nodes[this.idRoot].materialID);
  this.nodes[this.idRoot].display();
}
