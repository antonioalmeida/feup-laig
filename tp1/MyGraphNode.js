/**
 * MyGraphNode class, representing an intermediate node in the scene graph.
 * @constructor
**/

function MyGraphNode(graph, nodeID) {
    this.graph = graph;
    this.visited = false;

    this.nodeID = nodeID;

    // IDs of child nodes.
    this.children = [];

    // IDs of child nodes.
    this.leaves = [];

    // The material ID.
    this.materialID = null ;

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
MyGraphNode.prototype.display = function() {
    this.graph.scene.pushMatrix();
        this.graph.scene.multMatrix(this.transformMatrix);

        let toRemoveMaterial = this.applyMaterial();
        let toRemoveTexture = this.applyTexture();

        this.displayLeaves();
        this.displayChildren();

        if(toRemoveTexture)
            this.removeTexture();

        if(toRemoveMaterial)
            this.removeMaterial();
    this.graph.scene.popMatrix();
}

MyGraphNode.prototype.applyMaterial = function() {
    let toRemove = true;

    if(this.materialID == 'null' || this.materialID === null)
        toRemove = false;
    else if(this.graph.materials[this.graph.materialStack[0]] !== undefined) {
        this.graph.materialStack.unshift(this.materialID);
        this.graph.materials[this.graph.materialStack[0]].apply();
    }

    return toRemove;
}

MyGraphNode.prototype.applyTexture = function() {
    let toRemove = true;

    if(this.textureID == 'clear') {
        if(this.graph.textureStack.length)
          this.graph.textures[this.graph.textureStack[0]][0].unbind();
        toRemove = false;
    }
    else if(this.textureID == 'null' || this.textureID === null)
        toRemove = false;
    else {
        this.graph.textureStack.unshift(this.textureID);
        this.graph.textures[this.graph.textureStack[0]][0].bind();
    }

    return toRemove;
}

MyGraphNode.prototype.removeMaterial = function() {
    this.graph.materials[this.graph.defaultMaterialID].apply();
    this.graph.materialStack.shift();
}

MyGraphNode.prototype.removeTexture = function() {
    this.graph.textures[this.graph.textureStack[0]][0].unbind();
    this.graph.textureStack.shift();
}

/**
 * Displays this node's leaves
 */
MyGraphNode.prototype.displayLeaves = function() {
    for(let leaveID in this.leaves){
        if(this.textureID != 'clear' && this.graph.textureStack.length){
            let afS = this.graph.textures[this.graph.textureStack[0]][1];
            let afT = this.graph.textures[this.graph.textureStack[0]][2];
            this.leaves[leaveID].primitive.updateTexCoords(afS, afT);
        }
        this.leaves[leaveID].display();
    }
}

/**
 * Displays this nodes's children
 */
MyGraphNode.prototype.displayChildren = function() {
    for(let childrenID in this.children) {
        this.graph.nodes[this.children[childrenID]].display();
    }
}
