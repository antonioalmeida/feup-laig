function MyMonkey(game, color, initialPosition, file) {
    MyPiece.call(this, game, color, initialPosition);

    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", file, false);
    xhttp.send();
    let buffer = this.loadObj(xhttp.responseText);

    this.vertices = [];
    this.normals = [];
    this.indices = [];

    for(let i = 0; i < buffer.length; i += 6) {
        this.vertices.push(buffer[i], buffer[i+1], buffer[i+2]);
        this.normals.push(buffer[i+3], buffer[i+4], buffer[i+5]);
    }
    for(let i = 0; i < this.vertices.length/3; i += 3)
        this.indices.push(i, i+1, i+2);

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
}

MyMonkey.prototype = Object.create(MyPiece.prototype);
MyMonkey.prototype.constructor = MyMonkey;

MyMonkey.prototype.display = function() {
    this.updateAnimationMatrix();
    this.scene.pushMatrix();
    if(this.selected)
        this.scene.setActiveShader(this.game.shaders.selected);

    this.game.materials[this.color].apply();
    this.scene.translate(this.initialPosition[0], this.initialPosition[1]+1, this.initialPosition[2]);
    this.scene.multMatrix(this.animationMatrix);
    this.scene.registerForPick(this.game.registerForPickID++, this);
    CGFobject.prototype.display.call(this);

    if(this.selected)
        this.scene.setActiveShader(this.game.shaders.default);
    this.scene.popMatrix();
}
