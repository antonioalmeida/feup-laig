/**
 * MyTriangle
 * @constructor
 * @param scene
 * @param args - array containing the coordinates of each vertex
 * @param minS
 * @param maxS
 * @param minT
 * @param maxT
 */
function MyTriangle(scene, args, minS = 0, maxS = 1, minT = 0, maxT = 1) {
    CGFobject.call(this,scene);

    //TO DO: use a "prettier" coordinates saving method
    this.x0 = args[0];
    this.y0 = args[1];
    this.z0 = args[2];

    this.x1 = args[3];
    this.y1 = args[4];
    this.z1 = args[5];

    this.x2 = args[6];
    this.y2 = args[7];
    this.z2 = args[8];

    this.minS = minS;
    this.maxS = maxS;
    this.minT = minT;
    this.maxT = maxT;
    this.initBuffers();
};

MyTriangle.prototype = Object.create(CGFobject.prototype);
MyTriangle.prototype.constructor=MyTriangle;

MyTriangle.prototype.initBuffers = function () {
    this.vertices = [
        this.x0, this.y0, this.z0,
        this.x1, this.y1, this.z1,
        this.x2, this.y2, this.z2,
    ];
    console.log("Vertices: " + this.vertices);

    this.indices = [
        0, 1, 2
    ];

    this.normals = [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
    ];

    this.texCoords = [
        this.minS, this.maxT,
        this.maxS, this.maxT,
        this.minS, this.minT,
        this.maxS, this.minT
    ];

    this.primitiveType=this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
