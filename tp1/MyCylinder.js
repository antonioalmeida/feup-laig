/**
 * MyCylinder
 * @constructor
 */
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
    this.dT = (this.maxT - this.minT) / this.slices;

    this.initBuffers();
};

MyCylinder.prototype = Object.create(CGFobject.prototype);
MyCylinder.prototype.constructor = MyCylinder;

MyCylinder.prototype.initBuffers = function() {


    this.vertices = [];
    this.normals = [];
    this.indices = [];
    this.texCoords = [];

    var i, j;
    for(j = 0; j <= this.stacks; j++){
        for(i = 0; i < this.slices; i++){
            //Push current vertex
            this.vertices.push(Math.cos(i*this.angle),Math.sin(i*this.angle),j/this.stacks);

            //Push current vertex's tex coordinates
            this.texCoords.push(this.minS + i*this.dS, this.minT + j*this.dT);

            //Push current vertex's normal vector
            this.normals.push(Math.cos(i*this.angle), Math.sin(i*this.angle),0);
        }
    }

    //Push indexes
    for(j = 0; j < this.stacks; j++){
        for(i = 0; i < this.slices; i++){
            //First triangle
            this.indices.push(this.slices*j+i);
            this.indices.push(this.slices*j+i+1-(i < this.slices-1 ? 0 : this.slices)); //To ensure second-to-last vertex connects with the last vertex in the current face and not the first in the next one
            this.indices.push(this.slices*(j+1)+i+1-(i < this.slices-1 ? 0 : this.slices)); //Same as above
            //Second triangle
            this.indices.push(this.slices*(j+1)+i+1-(i < this.slices-1 ? 0 : this.slices)); //Same as above
            this.indices.push(this.slices*(j+1)+i);
            this.indices.push(this.slices*j+i);
        }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
