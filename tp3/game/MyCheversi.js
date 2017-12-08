function MyCheversi(scene) {
    CGFobject.call(this,scene);
    this.scene = scene;

    this.board = new MyBoard(scene);

    this.selectedShader = new CGFshader(scene.gl, "shaders/selectedVertexShader.glsl", "shaders/selectedFragmentShader.glsl");
}

MyCheversi.prototype = Object.create(CGFobject.prototype);
MyCheversi.prototype.constructor = MyCheversi;

MyCheversi.prototype.display = function() {
    this.scene.pushMatrix();

    this.board.display();

    this.scene.popMatrix();
}
