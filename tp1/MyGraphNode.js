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
 * Displays this node and it's leaves and children recursively
 */
MyGraphNode.prototype.display = function() {
    this.graph.scene.pushMatrix();
        this.graph.scene.multMatrix(this.transformMatrix);
        this.displayLeaves();
        this.displayChildren();
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
