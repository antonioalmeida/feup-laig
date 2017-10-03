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
function MyTriangle(scene, args) {
    CGFobject.call(this,scene);

    let chars = ['x','y','z'];
    /* i%3 ensures chars array is looped x,y,z,x,y,z,... and i/3 ensures the sequence 0 0 0 1 1 1 2 2 2... so in the end we get all strings from x0 to z2 */
    for(let i = 0; i < 9; i++)
        this[chars[i%3]+Math.trunc(i/3)] = args[i];

    //Ugly way by antonioalmeida
    /*
    this.x0 = args[0];
    this.y0 = args[1];
    this.z0 = args[2];

    this.x1 = args[3];
    this.y1 = args[4];
    this.z1 = args[5];

    this.x2 = args[6];
    this.y2 = args[7];
    this.z2 = args[8];
    */

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

    let p0p1 = [this.x1-this.x0, this.y1-this.y0, this.z1-this.z0];
    let p0p2 = [this.x2-this.x0, this.y2-this.y0, this.z2-this.z0];
    let cross = [p0p1[1]*p0p2[2]-p0p1[2]*p0p1[2], p0p1[2]*p0p2[0]-p0p1[0]*p0p2[2], p0p1[0]*p0p2[1]-p0p1[1]*p0p2[0]];
    this.normals = [
        cross[0], cross[1], cross[2],
        cross[0], cross[1], cross[2],
        cross[0], cross[1], cross[2]
    ];

    let d_p0p1 = Math.sqrt(Math.pow(this.x0-this.x1, 2)+Math.pow(this.y0-this.y1, 2)+Math.pow(this.z0-this.z1, 2));
    let d_p0p2 = Math.sqrt(Math.pow(this.x0-this.x2, 2)+Math.pow(this.y0-this.y2, 2)+Math.pow(this.z0-this.z2, 2));
    let d_p1p2 = Math.sqrt(Math.pow(this.x1-this.x2, 2)+Math.pow(this.y1-this.y2, 2)+Math.pow(this.z1-this.z2, 2));
    let cos = ((this.x2-this.x0)*(this.x1-this.x0)+(this.y2-this.y0)*(this.y1-this.y0)+(this.z2-this.z0)*(this.z1-this.z0))/(d_p0p1*d_p0p2);
    let s_coord = cos*d_p0p2;
    this.texCoords = [
        0, 0,
        d_p0p1, 0,
        s_coord,-Math.sqrt(Math.pow(d_p0p2,2)-Math.pow(s_coord,2)),
    ];

    this.primitiveType=this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyTriangle.prototype.updateTexCoords = function(afS, afT){
  for(let i = 0; i < this.texCoords.length; i += 2){
    this.texCoords[i] /= afS;
    this.texCoords[i+1] /= afT;
  }
}
