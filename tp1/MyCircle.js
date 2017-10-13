/**
 * MyCircle
 * @constructor
 */
 function MyCircle(scene, radius, slices) {
 	CGFobject.call(this,scene);

	this.slices = slices;
	this.radius = radius;
 	this.initBuffers();
 };

MyCircle.prototype = Object.create(CGFobject.prototype);
MyCircle.prototype.constructor = MyCircle;

 MyCircle.prototype.initBuffers = function() {

	this.vertices = [0, 0, 0];
	this.normals = [0, 0, 1];
	this.indices = [];
	this.texCoords = [0.5, 0.5];

	var ang = Math.PI*2/this.slices;
 	var x, y;

	for(var i = 0; i <= this.slices; i++){
		x = Math.cos(i * ang);
		y = Math.sin(i * ang);

		this.vertices.push(this.radius * x, this.radius * y, 0);
		this.normals.push(0, 0, 1);
		this.texCoords.push(0.5*(1+x), 0.5*(1+y));
	}

	for(var i = 1; i <= this.slices; i++){
	    if(i == this.slices)
            this.indices.push(i, 1, 0);
 		else
            this.indices.push(i, i+1, 0);
 	}

 	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
 };

 MyCircle.prototype.updateTexCoords = function(afS, afT){
     /* Amplification factors do not apply to circles */
 }
