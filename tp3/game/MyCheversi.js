MyCheversi.difficulty = {
    EASY: 0,
    MEDIUM: 1,
    HARD: 2,
};

MyCheversi.mode = {
    SINGLEPLAYER: 0,
    MULTIPLAYER: 1,
    NOPLAYER: 2,
};

MyCheversi.player = {
    WHITE: 0,
    BLACK: 1,
};

function MyCheversi(scene) {
    CGFobject.call(this,scene);
    this.scene = scene;
    this.match = null;

    this.client = new MyClient(8898);

    this.difficulty = null;
    this.mode = null;
    this.player = null;

    this.logic = null;

    this.board = new MyBoard(this);
    this.sidePlatforms = [new MySidePlatform(this, 1), new MySidePlatform(this, -1)];
    this.marker = new MyMarker(this);

    this.shaders = {
        selected: new CGFshader(scene.gl, "shaders/selectedVertexShader.glsl", "shaders/selectedFragmentShader.glsl"),
        transparent: new CGFshader(scene.gl, "shaders/transparentVertexShader.glsl", "shaders/transparentFragmentShader.glsl"),
        highlighted: new CGFshader(scene.gl, "shaders/highlightedVertexShader.glsl", "shaders/highlightedFragmentShader.glsl"),
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
        //new MyKnight(this, 'black', [-15, 0, 8.75]),
        new MyMonkey(this, 'white', [-15, 0, 8.75], 'objs/monkey.obj')
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

/**
 * Starts new match based on user input's data
 * @param mode
 * @param difficulty
 * @param player
 */
 MyCheversi.prototype.startGame = function(mode, player, difficulty) {
    let request = 'initGame(';
    console.log(mode);
    console.log(MyCheversi.mode.SINGLEPLAYER);
    console.log(player);
    console.log(difficulty);
    switch(mode) {
        case MyCheversi.mode.SINGLEPLAYER: 
            request+= 'singlePlayer,'; 
            break;
        case MyCheversi.mode.MULTIPLAYER: 
            request+= 'multiPlayer,'; 
            break;
        case MyCheversi.mode.NOPLAYER: 
            request+= 'noPlayer,'; 
            break;
        default:
            request+= 'cenas,'; 
            break;
    }

    switch(player) {
        case MyCheversi.player.WHITE: request+= 'white,'; break;
        case MyCheversi.player.BLACK: request+= 'black,'; break;
    }

    switch(difficulty) {
        case MyCheversi.difficulty.EASY: request+= 'easy)'; break;
        case MyCheversi.difficulty.MEDIUM: request+= 'medium)'; break;
        case MyCheversi.difficulty.HARD: request+= 'hard)'; break;
    }

    this.client.makeRequest(request, (data) => { //using arrow function to preserve 'this'
        console.log(data.target.response);
        let dataArr = JSON.parse(data.target.response);
        let game = {};

        game.board = dataArr[0];
        game.currentPlayer = dataArr[1];
        game.turnCounter = dataArr[2];

        // Not sure if we'll need these
        game.whiteAttacked = dataArr[3];
        game.blackAttacked = dataArr[4];

        // only useful for single player
        game.AIPlayer = dataArr[5]; 

        game.movesList = dataArr[6]; 

        // maybe use these to improve UX when user needs to choose queen?
        game.whiteNeedsQueen = dataArr[7];
        game.blackNeedsQueen = dataArr[8];

        game.isOver = dataArr[9];
        game.mode = dataArr[10];
        game.difficulty = dataArr[11];

        console.log(game);
        this.logic = game;
    });
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
