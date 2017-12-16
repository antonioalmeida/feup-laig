function MyCheversi(scene) {
    CGFobject.call(this,scene);
    this.scene = scene;
    this.match = null;

    this.CheversiDifficulty = {
        EASY: '0',
        MEDIUM: '1',
        HARD: '2',
    };

    this.CheversiMode = {
        SINGLEPLAYER: '0',
        MULTIPLAYER: '1',
        NOPLAYER: '2',
    };

    this.CheversiPlayer = {
        WHITE: '0',
        BLACK: '1',
    };

    this.difficulty = null;
    this.mode = null;
    this.player = null;

    this.board = new MyBoard(this);
    this.sidePlatforms = [new MySidePlatform(this, 1), new MySidePlatform(this, -1)];
    this.marker = new MyMarker(this);

    this.shaders = {
        selected: new CGFshader(scene.gl, "shaders/selectedVertexShader.glsl", "shaders/selectedFragmentShader.glsl"),
        transparent: new CGFshader(scene.gl, "shaders/transparentVertexShader.glsl", "shaders/transparentFragmentShader.glsl"),
        default: scene.defaultShader
    };

    let blackMaterial = new CGFappearance(scene);
    blackMaterial.setAmbient(0.05, 0.05, 0.05, 1);
    blackMaterial.setSpecular(0.9, 0.9, 0.9, 1);
    blackMaterial.setDiffuse(0.1, 0.1, 0.1, 1);

    let whiteMaterial = new CGFappearance(scene);
    whiteMaterial.setAmbient(0.05, 0.05, 0.05, 1);
    whiteMaterial.setSpecular(0.3, 0.3, 0.3, 1);
    whiteMaterial.setDiffuse(0.8, 0.8, 0.8, 1);

    this.materials = {'black': blackMaterial, 'white': whiteMaterial};

    this.pieces = [
        new MyKing(this, 'white', [15, 0, -8.75]),
        new MyKing(this, 'black', [-15, 0, -8.75]),
        new MyQueen(this, 'white', [15, 0, -6.25]),
        new MyQueen(this, 'black', [-15, 0, -6.25]),
        new MyRook(this, 'white', [15, 0, -3.75]),
        new MyRook(this, 'white', [15, 0, -1.25]),
        new MyRook(this, 'black', [-15, 0, -3.75]),
        new MyRook(this, 'black', [-15, 0, -1.25]),
        new MyBishop(this, 'white', [15, 0, 1.25]),
        new MyBishop(this, 'white', [15, 0, 3.75]),
        new MyBishop(this, 'black', [-15, 0, 1.25]),
        new MyBishop(this, 'black', [-15, 0, 3.75]),
        new MyKnight(this, 'white', [15, 0, 6.25]),
        new MyKnight(this, 'white', [15, 0, 8.75]),
        new MyKnight(this, 'black', [-15, 0, 6.25]),
        new MyKnight(this, 'black', [-15, 0, 8.75])
    ];
    this.selectedPiece = null;

    this.registerForPickID = 1;
}

MyCheversi.prototype = Object.create(CGFobject.prototype);
MyCheversi.prototype.constructor = MyCheversi;

MyCheversi.prototype.pickPiece = function(piece) {
    //Piece already played
    if(piece.tile !== null)
        return;

    //Unselect previous piece, if necessary
    if(this.selectedPiece !== null)
        this.selectedPiece.selected = false;

    this.selectedPiece = piece;
    piece.selected = true;
}

MyCheversi.prototype.movePiece = function(tile) {
    if(this.selectedPiece === null) //No piece to make a move
        return;
    if(tile.piece !== null) //Tile already occupied
        return;

    this.selectedPiece.selected = false;
    this.selectedPiece.setTile(tile);
    this.selectedPiece = null;
    this.marker.resetTurnTime();
}

MyCheversi.prototype.display = function() {
    //Reset pick ID
    this.registerForPickID = 1;

    this.scene.pushMatrix();

    this.sidePlatforms[0].display();
    this.sidePlatforms[1].display();
    this.marker.display();
    this.board.display();
    for(let id in this.pieces)
        this.pieces[id].display();

    this.scene.popMatrix();
}
