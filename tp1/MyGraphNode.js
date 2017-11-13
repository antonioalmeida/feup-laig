/**
 * MyGraphNode class, representing an intermediate node in the scene graph.
 * @constructor
 * @param graph - graph the node belongs to
 * @param {int} nodeID - numeric value representing the node's ID
**/
function MyGraphNode(graph, nodeID) {
    this.graph = graph;

    this.nodeID = nodeID;

    // IDs of child nodes.
    this.children = [];

    // IDs of child nodes.
    this.leaves = [];

    // The material ID.
    this.materialID = null ;

    // The node numeric ID
    this.numericID = null;

    // The texture ID.
    this.textureID = null ;

    // The node's animations
    this.animations = [];

    // The active animation
    this.currentAnimation = -1;

    // Is this node selected? (updated in scene.display according to GUI input)
    this.selected = false;

    this.transformMatrix = mat4.create();
    mat4.identity(this.transformMatrix);
}

/**
 * Adds the reference (ID) of another node to this node's children array.
 */
MyGraphNode.prototype.addChild = function(nodeID) {
    this.children.push(nodeID);
}

/**
 * Adds a leaf to this node's leaves array.
 */
MyGraphNode.prototype.addLeaf = function(leaf) {
    this.leaves.push(leaf);
}

/**
 * Displays this node and its leaves and children recursively
 */
MyGraphNode.prototype.display = function(textureID, materialID) {
        if(this.selected)
            this.graph.scene.setSelectableShader();
        else
            this.graph.scene.setDefaultShader();
        this.graph.scene.pushMatrix();
        this.graph.scene.multMatrix(this.transformMatrix);
        if(this.currentAnimation != -1) {
            if(!this.graph.animations[this.animations[this.currentAnimation]].active) {
                //Change this to another if to test if length has been reached in case animation loop is not desired
                if(++this.currentAnimation == this.animations.length)
                    this.currentAnimation = -1;
                else
                    //this.currentAnimation = (this.currentAnimation + 1) % this.animations.length;
                    this.graph.animations[this.animations[this.currentAnimation]].reset();
            }
        }
        if(this.currentAnimation != -1) //Cannot join with previous if because value can be updated to -1 inside it but this wouldn't detect it
            this.graph.scene.multMatrix(this.graph.animations[this.animations[this.currentAnimation]].currentMatrix);

        var materialToPassOn = materialID;
        var textureToPassOn = textureID;
        if(this.materialID != "null" && this.materialID != null) {
          this.graph.materials[this.materialID].apply();
          materialToPassOn = this.materialID;
        }
        else
          this.graph.materials[materialID].apply();

        if(this.textureID == "clear") {
          if(textureID != null && textureID != "null")
            this.graph.textures[textureID][0].unbind();
          textureToPassOn = "null";
        }
        else if(this.textureID != null && this.textureID != "null") {
          this.graph.textures[this.textureID][0].bind();
          textureToPassOn = this.textureID;
        }
        else{
          if(textureID != null && textureID != "null")
            this.graph.textures[textureID][0].bind();
        }

        this.displayLeaves(textureToPassOn);

        this.displayChildren(textureToPassOn, materialToPassOn);

    this.graph.scene.popMatrix();
}

/**
 * Displays this node's leaves
 */
MyGraphNode.prototype.displayLeaves = function(texture) {
    for(let leaveID in this.leaves) {
        if(texture != null && texture != "null") {
            let afS = this.graph.textures[texture][1];
            let afT = this.graph.textures[texture][2];
            this.leaves[leaveID].primitive.updateTexCoords(afS, afT);
        }
        this.leaves[leaveID].display();
    }
}

/**
 * Displays this nodes's children
 */
MyGraphNode.prototype.displayChildren = function(texture, material) {
    for(let childrenID in this.children) {
        let previous = this.graph.nodes[this.children[childrenID]].selected;
        if(this.selected) this.graph.nodes[this.children[childrenID]].selected = true;
        this.graph.nodes[this.children[childrenID]].display(texture, material);
        this.graph.nodes[this.children[childrenID]].selected = previous;
    }
}
