/**
 * MyGraphLeaf class, representing a leaf in the scene graph.
 * @constructor
 * @param graph - graph the leaf belongs to
 * @param leafInfo - object containg the leaf's attributes - type, arguments, control points
**/
function MyGraphLeaf(graph, leafInfo) {
    this.graph = graph;

    switch(leafInfo.type) {
        case 'rectangle':
            this.primitive = new MyQuad(graph.scene, leafInfo.args);
            break;
        case 'cylinder':
            this.primitive = new MyCylinder(graph.scene, leafInfo.args);
            break;
        case 'triangle':
            this.primitive = new MyTriangle(graph.scene, leafInfo.args);
            break;
        case 'patch':
            this.primitive = new MyPatch(graph.scene, leafInfo.args, leafInfo.controlPoints);
            break;
        case 'sphere':
            this.primitive = new MySphere(graph.scene, leafInfo.args);
            break;
        case 'obj':
            this.primitive = new MyObj(graph.scene, leafInfo.args);
            break;
    }
}

MyGraphLeaf.prototype.constructor = MyGraphLeaf;

MyGraphLeaf.prototype.display = function() {
    this.primitive.display();
}
