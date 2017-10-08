/**
 * MyGraphLeaf class, representing a leaf in the scene graph.
 * @constructor
**/
function MyGraphLeaf(graph, xmlelem) {
    this.graph = graph;

    //Getting leaf type ('rectangle', 'cylinder', 'sphere', 'triangle', 'patch')
    this.type = graph.reader.getString(xmlelem, 'type');
    //console.log("TYPE : " + this.type);

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
            this.primitive = new MyPatch(graph.scene, [2,3], 20, 20, [// U = 0
						[ // V = 0..3;
							 [ -2.0, -2.0, 1.0, 1 ],
							 [ -2.0, -1.0, -2.0, 1 ],
							 [ -2.0, 1.0, 5.0, 1 ],
							 [ -2.0, 2.0, -1.0, 1 ]
						],
						// U = 1
						[ // V = 0..3
							 [ 0, -2.0, 0, 1 ],
							 [ 0, -1.0, -1.0, 1 ],
							 [ 0, 1.0, 1.5, 1 ],
							 [ 0, 2.0, 0, 1 ]
						],
						// U = 2
						[ // V = 0..3
							 [ 2.0, -2.0, -1.0, 1 ],
							 [ 2.0, -1.0, 2.0, 1 ],
							 [ 2.0, 1.0, -5.0, 1 ],
							 [ 2.0, 2.0, 1.0, 1 ]
						]
					]);
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
