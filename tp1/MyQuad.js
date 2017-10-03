/**
 * MyQuad
 * @constructor
 * @param scene
 * @param args - array containing the coordinates of each vertex
 * @param minS
 * @param maxS
 * @param minT
 * @param maxT
 */
function MyQuad(scene, args) {
    CGFobject.call(this,scene);

    //Top left corner
    this.x0 = args[0];
    this.y0 = args[1];
    //Bottom right corner
    this.x1 = args[2];
    this.y1 = args[3];

    this.initBuffers();
};

MyQuad.prototype = Object.create(CGFobject.prototype);
MyQuad.prototype.constructor=MyQuad;

MyQuad.prototype.initBuffers = function () {
    this.vertices = [
        this.x0, this.y1, 0, //Bottom left corner
        this.x1, this.y1, 0, //Bottom right corner
        this.x0, this.y0, 0, //Top left corner
        this.x1, this.y0, 0  //Top right corner
    ];

    this.indices = [
        0, 1, 2,
        3, 2, 1
    ];

    this.normals = [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
    ];

    this.dx = this.x1-this.x0;
    this.dy = this.y0-this.y1;
    this.texCoords = [
        0, 0,
        this.dx, 0,
        0, this.dy,
        this.dx, this.dy
    ];

    this.primitiveType=this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyQuad.prototype.updateTexCoords = function(afS, afT){
  let factS = 1/afS;
  let factT = 1/afT;
  
  this.texCoords = [
    0, 0,
    this.dx/factS, 0,
    0, this.dy/factT,
    this.dx/factS, this.dy/factT
  ];

  this.updateTexCoordsGLBuffers();
}
