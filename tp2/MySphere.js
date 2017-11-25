/**
 * MySphere
 * @constructor
 * @param scene - the scene where the sphere will be drawn on
 * @param {array} args - array containing the arguments of the sphere - [ radius , stacks, slices ]
 */
 function MySphere(scene, args) {
 	CGFobject.call(this,scene);

	this.radius = parseFloat(args[0]);
	this.stacks = parseFloat(args[1]);
	this.slices = parseFloat(args[2]);

 	this.initBuffers();
 };

MySphere.prototype = Object.create(CGFobject.prototype);
MySphere.prototype.constructor = MySphere;

MySphere.prototype.initBuffers = function() {
	this.vertices = [];
    this.normals = [];
    this.texCoords = [];
    this.indices = [];
    // Spherical coordinates, using theta as polar angle and phi as azimutal
    for (let lat = 0; lat <= this.stacks; lat++) {
      var theta = lat * Math.PI / this.stacks;
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);

      for (let long = 0; long <= this.slices; long++) {
        var phi = long * 2 * Math.PI / this.slices;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);

        var x = sinTheta*cosPhi;
        var y = sinTheta*sinPhi;
        var z = cosTheta;

        this.vertices.push(this.radius * x, this.radius * y, this.radius * z);
        this.normals.push(x, y, z);
        this.texCoords.push(long / this.slices, lat / this.stacks);
      }
    }

    for (let lat = 0; lat < this.stacks; lat++) {
      for (let long = 0; long < this.slices; long++) {
        var first = (lat * (this.slices + 1)) + long;
        var second = first + this.slices + 1;
        this.indices.push(first);
        this.indices.push(second);
        this.indices.push(first + 1);

        this.indices.push(second);
        this.indices.push(second + 1);
        this.indices.push(first + 1);
      }
    }

 	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
 };

 MySphere.prototype.updateTexCoords = function(afS, afT) {
     /* Amplification factors do not apply to spheres */
 }
