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
        console.log("TEXTURE : " + this.graph.textures[this.graph.textureStack[0]]);
        console.log("MATERIAL : " + this.graph.materials[this.graph.materialStack[0]]);
        let toRemove = true;
        let toRemoveMaterial = true;

        if(this.materialID == 'null' || this.materialID === null) {
            console.log("READ MATERIAL NULL");
            toRemoveMaterial = false;
        }
        else if(this.graph.materials[this.graph.materialStack[0]] !== undefined) {
            console.log("ADDED MATERIAL : " + this.graph.materials[this.graph.materialStack[0]]);
            this.graph.materialStack.unshift(this.materialID);
            this.graph.materials[this.graph.materialStack[0]].apply();
        }

        if(this.textureID == 'clear') {
            console.log("READ CLEAR");
            this.graph.textures[this.graph.textureStack[0]][0].unbind();
            toRemove = false;
        }
        else if(this.textureID == 'null' || this.textureID === null) {
            console.log("READ NULL");
            toRemove = false;
        }
        else if(this.graph.textures[this.graph.textureStack[0]] !== undefined) {
            console.log("ADDED : " + this.graph.textures[this.graph.textureStack[0]]);
            this.graph.textureStack.unshift(this.textureID);
            this.graph.textures[this.graph.textureStack[0]][0].bind();
        }


        this.displayLeaves();
        this.displayChildren();

        if(toRemove) {
            console.log("REMOVED : " + this.graph.textures[this.graph.textureStack[0]]);
            this.graph.textures[this.graph.textureStack[0]][0].unbind();
            this.graph.textureStack.shift();
        }
        if(toRemoveMaterial) {
            console.log("REMOVED MATERIAL : " + this.graph.materials[this.graph.materialStack[0]]);
            this.graph.materials[this.graph.defaultMaterialID].apply();
            this.graph.materialStack.shift();
        }
    this.graph.scene.popMatrix();
}

/**
 * Displays this node's leaves
 */
MyGraphNode.prototype.displayLeaves = function() {
    for(let leaveID in this.leaves)
        this.leaves[leaveID].display();
}

/**
 * Displays this nodes's children
 */
MyGraphNode.prototype.displayChildren = function() {
    for(let childrenID in this.children) {
        this.graph.nodes[this.children[childrenID]].display();
    }
}
