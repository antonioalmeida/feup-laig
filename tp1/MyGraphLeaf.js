/**
 * MyGraphLeaf class, representing a leaf in the scene graph.
 * @constructor
**/
function MyGraphLeaf(graph, xmlelem, controlPoints) {
    this.graph = graph;

    //Getting leaf type ('rectangle', 'cylinder', 'sphere', 'triangle', 'patch')
    this.type = graph.reader.getString(xmlelem, 'type');

    var argsStr = graph.reader.getString(xmlelem, 'args');
    var args = argsStr.match(/[+-]?\d+(\.\d+)?/g);

    var args2 = [];
    for(let i = 0; i < args.length; i++)
        args2[i] = parseFloat(args[i]);

    switch(this.type) {
        case 'rectangle':
            this.primitive = new MyQuad(graph.scene, args);
            break;
        case 'cylinder':
            this.primitive = new MyCylinder(graph.scene, args2);
            break;
        case 'triangle':
            this.primitive = new MyTriangle(graph.scene, args);
            break;
        case 'patch':
            this.primitive = new MyPatch(graph.scene, args2, controlPoints); // Not sure where those parameters are defined, keeping it 20, 20 for now
            break;
        case 'sphere':
            this.primitive = new MySphere(graph.scene, args2);
            break;
    }
}

MyGraphLeaf.prototype.constructor = MyGraphLeaf;

MyGraphLeaf.prototype.display = function() {
    this.primitive.display();
}
