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
function MyQuad(scene, args, minS = 0, maxS = 1, minT = 0, maxT = 1) {
    CGFobject.call(this,scene);

    //Top left corner
    this.x0 = args[0];
    this.y0 = args[1];
    //Bottom right corner
    this.x1 = args[2];
    this.y1 = args[3];

    this.minS = minS;
    this.maxS = maxS;
    this.minT = minT;
    this.maxT = maxT;
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

    this.texCoords = [
        this.minS, this.maxT,
        this.maxS, this.maxT,
        this.minS, this.minT,
        this.maxS, this.minT
    ];

    this.primitiveType=this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyQuad.prototype.updateTexCoords = function(afS, afT){
  for(let i = 0; i < this.texCoords.length; i += 2){
    this.texCoords[i] /= afS;
    this.texCoords[i+1] /= afT;
  }
}
