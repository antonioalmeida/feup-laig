/**
* MyCylinder
* @constructor
*/
function MyCylinder(scene, args, minS = 0, maxS = 1, minT = 0, maxT = 1) {
    CGFobject.call(this,scene);

    this.height = args[0];
    this.top = args[1];
    this.bottom = args[2];
    this.stacks = args[3];
    this.slices = args[4];

    console.log("ARGS CYLINDER :" + this.height + ", " + this.top + ", " + this.bottom + ", " + this.stacks + ", " + this.slices);
    console.log("ARGS TYPE :" + typeof this.height);

    this.angle = 2 * Math.PI / this.slices;
    console.log("ANGLE : " + this.angle);

    this.minS = minS;
    this.maxS = maxS;
    this.minT = minT;
    this.maxT = maxT;

    this.dS = (this.maxS - this.minS) / this.slices;
    this.dT = (this.maxT - this.minT) / this.stacks;

    this.bottomCircle = new MyCircle(this.scene, this.base, this.slices);
    this.topCircle = new MyCircle(this.scene, this.top, this.slices);

    this.initBuffers();
};

/**
function MyCylinder(scene, slices, stacks, minS = 0, maxS = 1, minT = 0, maxT = 1) {
   CGFobject.call(this,scene);

   this.slices = slices;
   this.stacks = stacks;
 this.angle = 2 * Math.PI / this.slices;

 this.minS = minS;
 this.maxS = maxS;
 this.minT = minT;
 this.maxT = maxT;

 this.dS = (this.maxS - this.minS) / this.slices;
   this.dT = (this.maxT - this.minT) / this.stacks;

   this.initBuffers();
};*/

MyCylinder.prototype = Object.create(CGFobject.prototype);
MyCylinder.prototype.constructor = MyCylinder;

MyCylinder.prototype.initBuffers = function() {
    this.vertices = [];
    this.normals = [];
    this.indices = [];
    this.texCoords = [];

    //Exterior part
    var i, j;
    for(j = 0; j <= this.stacks; j++){
        for(i = 0; i <= this.slices; i++){
            //Push current vertex
            this.vertices.push(Math.cos(i*this.angle),Math.sin(i*this.angle),j*(this.height/this.stacks));

            //Push current vertex's tex coordinates
            this.texCoords.push(this.minS + i*this.dS, this.minT + j*this.dT);

            //Push current vertex's normal vector
            this.normals.push(Math.cos(i*this.angle), Math.sin(i*this.angle),0);
        }
    }

    //Push indexes
    for(j = 0; j < this.stacks; j++){
        for(i = 0; i <= this.slices; i++){
            //First triangle
            this.indices.push((this.slices+1)*j+i);
            this.indices.push((this.slices+1)*j+i+1-(i < this.slices ? 0 : this.slices+1)); //To ensure second-to-last vertex connects with the last vertex in the current face and not the first in the next one
            this.indices.push((this.slices+1)*(j+1)+i+1-(i < this.slices ? 0 : this.slices+1)); //Same as above
            //Second triangle
            this.indices.push((this.slices+1)*(j+1)+i+1-(i < this.slices ? 0 : this.slices+1)); //Same as above
            this.indices.push((this.slices+1)*(j+1)+i);
            this.indices.push((this.slices+1)*j+i);
        }
    }

    //Interior part
    var i, j;
    for(j = 0; j <= this.stacks; j++){
        for(i = 0; i <= this.slices; i++){
            //Push current vertex
            this.vertices.push(Math.cos(i*this.angle),Math.sin(i*this.angle),j/this.stacks);

            //Push current vertex's tex coordinates
            this.texCoords.push(this.minS + i*this.dS, this.minT + j*this.dT);

            //Push current vertex's normal vector
            this.normals.push(-Math.cos(i*this.angle), -Math.sin(i*this.angle),0);
        }
    }

    //Push indexes
    for(j = 0; j < this.stacks; j++){
        for(i = 0; i <= this.slices; i++){
            //First triangle
            this.indices.push((this.stacks+1)*(this.slices+1)+(this.slices+1)*(j+1)+i+1-(i < this.slices ? 0 : this.slices+1)); //To ensure second-to-last vertex connects with the last vertex in the current face and not the first in the next one
            this.indices.push((this.stacks+1)*(this.slices+1)+(this.slices+1)*j+i+1-(i < this.slices ? 0 : this.slices+1)); //Same as above
            this.indices.push((this.stacks+1)*(this.slices+1)+(this.slices+1)*j+i);
            //Second triangle
            this.indices.push((this.stacks+1)*(this.slices+1)+(this.slices+1)*j+i);
            this.indices.push((this.stacks+1)*(this.slices+1)+(this.slices+1)*(j+1)+i);
            this.indices.push((this.stacks+1)*(this.slices+1)+(this.slices+1)*(j+1)+i+1-(i < this.slices ? 0 : this.slices+1)); //Same as above
        }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyCylinder.prototype.display = function () {
    CGFobject.prototype.display.call(this);
    this.scene.pushMatrix();
    this.scene.rotate(Math.PI, 1, 0, 0)
    this.bottomCircle.display();
    this.scene.translate(0, 0, -this.height);
    this.scene.rotate(Math.PI, 1, 0, 0)
    this.scene.rotate(Math.PI, 0, 0, 1)
    this.topCircle.display();
    this.scene.popMatrix();
}
