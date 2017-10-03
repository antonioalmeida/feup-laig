/**
 * MyCircle
 * @constructor
 */
 function MyCircle(scene, radius, slices) {
 	CGFobject.call(this,scene);

	this.slices = slices;
	this.radius = radius;
	this.radius = radius;
 	this.initBuffers();
 };

MyCircle.prototype = Object.create(CGFobject.prototype);
MyCircle.prototype.constructor = MyCircle;

 MyCircle.prototype.initBuffers = function() {

	this.vertices = [0, 0, 0,];
	this.normals = [0, 0, 1,];
	this.indices = [];
	this.texCoords = [0.5, 0.5,];

	var ang = Math.PI*2/this.slices;
 	var x, y;

	for(var i = 0; i <= this.slices; i++){
		//posição x e y dos dois vértices de uma mesma face
		x = Math.cos(i * ang);
		y = Math.sin(i * ang);

		this.vertices.push(this.radius * x, this.radius * y, 0);
		this.normals.push(x, y, 0);
		this.texCoords.push(x/2 +0.5,y/2 + 0.5);
	}

	for(var i = 1; i <= this.slices; i++){
	    if(i == this.slices){this.indices.push(i, 1, 0)}
 			else this.indices.push(i, i+1, 0);
 	}


 	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
 };

 MyCircle.prototype.updateTexCoords = function(afS, afT){
   for(let i = 0; i < this.texCoords.length; i += 2){
     this.texCoords[i] /= afS;
     this.texCoords[i+1] /= afT;
   }
 }