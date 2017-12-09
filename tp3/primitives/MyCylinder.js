/**
* MyCylinder
* @constructor
* @param scene - the scene where the cylinder will be drawn on
* @param {array} args - array containing the arguments of the cylinder - [ height, bottomRadius, topRapidus, stacks, slices , drawTop, drawBottom ]
*/
function MyCylinder(scene, args) {
    CGFobject.call(this,scene);

    this.height = parseFloat(args[0]);
    this.bottom = parseFloat(args[1]);
    this.top = parseFloat(args[2]);
    this.stacks = parseFloat(args[3]);
    this.slices = parseFloat(args[4]);
    this.drawTop = (parseFloat(args[5]) == 0 ? false: true);
    this.drawBottom = (parseFloat(args[6]) == 0 ? false : true);


    this.angle = 2 * Math.PI / this.slices;

    if(this.drawBottom)
        this.bottomCircle = new MyCircle(scene, this.bottom, this.slices);
    if(this.drawTop)
        this.topCircle = new MyCircle(scene, this.top, this.slices);

    this.initBuffers();
};

MyCylinder.prototype = Object.create(CGFobject.prototype);
MyCylinder.prototype.constructor = MyCylinder;

MyCylinder.prototype.initBuffers = function() {
    this.vertices = [];
    this.normals = [];
    this.indices = [];
    this.texCoords = [];

    var radiusIncrement = (this.top-this.bottom)/this.stacks;
    //Exterior part
    var i, j;
    for(j = 0; j <= this.stacks; j++) {
        for(i = 0; i <= this.slices; i++) {
            //Push current vertex
            this.vertices.push((this.bottom+j*radiusIncrement)*Math.cos(i*this.angle),(this.bottom+j*radiusIncrement)*Math.sin(i*this.angle),j*this.height/this.stacks);

            //Push current vertex's tex coordinates
            this.texCoords.push(i/this.slices, 1-j/this.stacks);

            //Push current vertex's normal vector
            this.normals.push(Math.cos(i*this.angle), Math.sin(i*this.angle),0);
        }
    }

    //Push indexes
    for(j = 0; j < this.stacks; j++) {
        for(i = 0; i <= this.slices; i++) {
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

    //Interior part (only need to draw if at least one of the cover circles isn't present)
    if (!this.drawTop || !this.drawBottom) {
        for (j = 0; j <= this.stacks; j++) {
            for (i = 0; i <= this.slices; i++) {
                //Push current vertex
                this.vertices.push((this.bottom + j * radiusIncrement) * Math.cos(i * this.angle), (this.bottom + j * radiusIncrement) * Math.sin(i * this.angle), j * this.height / this.stacks);

                //Push current vertex's tex coordinates
                this.texCoords.push(i/this.slices, 1-j/this.stacks);

                //Push current vertex's normal vector
                this.normals.push(-Math.cos(i * this.angle), -Math.sin(i * this.angle), 0);
            }
        }

        //Push indexes
        for (j = 0; j < this.stacks; j++) {
            for (i = 0; i <= this.slices; i++) {
                //First triangle
                this.indices.push((this.stacks + 1) * (this.slices + 1) + (this.slices + 1) * (j + 1) + i + 1 - (i < this.slices ? 0 : this.slices + 1)); //To ensure second-to-last vertex connects with the last vertex in the current face and not the first in the next one
                this.indices.push((this.stacks + 1) * (this.slices + 1) + (this.slices + 1) * j + i + 1 - (i < this.slices ? 0 : this.slices + 1)); //Same as above
                this.indices.push((this.stacks + 1) * (this.slices + 1) + (this.slices + 1) * j + i);
                //Second triangle
                this.indices.push((this.stacks + 1) * (this.slices + 1) + (this.slices + 1) * j + i);
                this.indices.push((this.stacks + 1) * (this.slices + 1) + (this.slices + 1) * (j + 1) + i);
                this.indices.push((this.stacks + 1) * (this.slices + 1) + (this.slices + 1) * (j + 1) + i + 1 - (i < this.slices ? 0 : this.slices + 1)); //Same as above
            }
        }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyCylinder.prototype.display = function () {
    CGFobject.prototype.display.call(this);
    this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 1, 0, 0);

        if(this.drawBottom)
            this.bottomCircle.display();

        if(this.drawTop) {
            this.scene.translate(0, 0, -this.height);
            this.scene.rotate(Math.PI, 1, 0, 0)
            this.scene.rotate(Math.PI, 0, 0, 1)
            this.topCircle.display();
        }

    this.scene.popMatrix();
}

MyCylinder.prototype.updateTexCoords = function(afS, afT) {
    /* Amplification factors do not apply to cylinders */
}
