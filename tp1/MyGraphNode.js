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
        this.graph.scene.pushMatrix();
        this.graph.scene.multMatrix(this.transformMatrix);

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
        this.graph.nodes[this.children[childrenID]].display(texture, material);
    }
}
