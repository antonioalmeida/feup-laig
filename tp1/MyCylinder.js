/**
 * MyCylinder
 * @constructor
 */
 function MyCylinder(scene, args) {
 	CGFobject.call(this,scene);

    this.height = args[0];
    this.top = args[1];
    this.base = args[2];
    this.stacks = args[3];
    this.slices = args[4];

	this.bottomCircle = new MyCircle(this.scene, this.base, this.slices);
	this.topCircle = new MyCircle(this.scene, this.top, this.slices);

 	this.initBuffers();
 };

MyCylinder.prototype = Object.create(CGFobject.prototype);
MyCylinder.prototype.constructor = MyCylinder;

 MyCylinder.prototype.initBuffers = function() {

	this.vertices = [];
	this.normals = [];
	this.indices = [];
	this.texCoords = [];
 	var ang = Math.PI*2/this.slices;
 	var radiusInc = (this.top - this.base)/this.stacks;
 	var x, y;
 	var counter = 0;

	for(var i = 0; i <= this.stacks; i++){

		for(var j = 0; j <= this.slices; j++){
			//posição x e y dos dois vértices de uma mesma face
			x = (this.base + i * radiusInc)*Math.cos(j * ang);
			y = (this.base + i * radiusInc)*Math.sin(j * ang);

			this.vertices.push(x, y, this.height*i/this.stacks);
			this.normals.push(x, y, 0);
			this.texCoords.push(j / this.slices, i / this.stacks);
			counter++;
		}
	}

	for(var i = 1; i <= this.stacks; i++){
 		for(var j = 1; j <= this.slices; j++) {
			var stack1 = (this.slices+1) * (i - 1) + (this.slices - j);
			var stack2 = (this.slices+1) * i + (this.slices - j);

			this.indices.push(stack1, stack1 + 1, stack2+1);
			this.indices.push(stack2+1, stack2, stack1);
 		}
	}
 	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
 };

 MyCylinder.prototype.display = function() {
    CGFobject.prototype.display.call(this);
    this.scene.pushMatrix();
    this.scene.rotate(Math.PI, 1, 0, 0)
    this.bottomCircle.display();
    this.scene.translate(0, 0, -this.height);
    this.scene.rotate(Math.PI, 1, 0, 0)
    this.scene.rotate(Math.PI, 0, 0, 1)
    this.topCircle.display();
    this.scene.popMatrix();
};

MyCylinder.prototype.updateTexCoords = function (length_s, length_t){}
