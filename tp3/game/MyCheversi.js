function MyCheversi(scene) {
    CGFobject.call(this,scene);
    this.scene = scene;

    this.board = new MyBoard(this);

    this.selectedShader = new CGFshader(scene.gl, "shaders/selectedVertexShader.glsl", "shaders/selectedFragmentShader.glsl");
    this.transparentShader = new CGFshader(scene.gl, "shaders/transparentVertexShader.glsl", "shaders/transparentFragmentShader.glsl");
    this.defaultShader = scene.defaultShader;

    let blackMaterial = new CGFappearance(scene);
    blackMaterial.setAmbient(0.05, 0.05, 0.05, 1);
    blackMaterial.setSpecular(0.9, 0.9, 0.9, 1);
    blackMaterial.setDiffuse(0.1, 0.1, 0.1, 1);

    let whiteMaterial = new CGFappearance(scene);
    whiteMaterial.setSpecular(0.9, 0.9, 0.9, 1);
    whiteMaterial.setDiffuse(1, 1, 1, 1);

    this.materials = {'black': blackMaterial, 'white': whiteMaterial};

    this.pieces = [new MyKing(this, 'white'), new MyQueen(this, 'white'), new MyRook(this, 'black'), new MyBishop(this, 'white'), new MyKnight(this, 'black')];

    this.registerForPickID = 0;
}

MyCheversi.prototype = Object.create(CGFobject.prototype);
MyCheversi.prototype.constructor = MyCheversi;

MyCheversi.prototype.pickPiece = function(piece) {
    //TODO: Shit mechanism, unecessary loop. Keep more variables in game class
    for(let id in this.pieces)
        this.pieces[id].selected = false;
    piece.selected = true;
}

MyCheversi.prototype.display = function() {
    this.registerForPickID = 0;

    this.scene.pushMatrix();

    this.board.display();
    this.scene.translate(1.25, 0, -1.25);
    for(let i = 0; i < this.pieces.length; ++i) {
        this.pieces[i].display();
        this.scene.translate(10, 0, 0);
    }

    this.scene.popMatrix();
}
