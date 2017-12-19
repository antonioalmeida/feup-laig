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

MyCheversi.matchState = {
    NONE: 0,
    USER_TURN: 1,
    AI_TURN: 2,
    GAME_OVER: 3
}

function MyCheversi(scene) {
    CGFobject.call(this,scene);
    this.scene = scene;
    this.match = null;
    this.matchState = MyCheversi.matchState.NONE;

    this.client = new MyClient(5544);

    this.difficulty = null;
    this.mode = null;
    this.userPlayer = null;
    this.AIPlayer = null;

    this.parseGameObject = (data) => {
        let dataArr = JSON.parse(data.target.response);
        let obj = {};

        obj.raw = data.target.response;
        obj.board = dataArr[0];
        obj.currentPlayer = dataArr[1];
        obj.turnCounter = dataArr[2];

        // Not sure if we'll need these
        obj.whiteAttacked = dataArr[3];
        obj.blackAttacked = dataArr[4];

        // only useful for single player
        obj.AIPlayer = dataArr[5];

        obj.movesList = dataArr[6];

        // maybe use these to improve UX when user needs to choose queen?
        obj.whiteNeedsQueen = dataArr[7];
        obj.blackNeedsQueen = dataArr[8];

        obj.isOver = dataArr[9];
        obj.mode = dataArr[10];
        obj.difficulty = dataArr[11];

        this.marker.turnTime = this.scene.turnTime;

        console.log(obj);
        this.match = obj;
    }

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
    new MyKing(this, 'white', '1', [15, 0, -8.75], 'objs/king.obj'),
    new MyKing(this, 'black', '6', [-15, 0, -8.75], 'objs/king.obj'),
    new MyQueen(this, 'white', '2', [15, 0, -6.25], 'objs/queen.obj'),
    new MyQueen(this, 'black', '7', [-15, 0, -6.25], 'objs/queen.obj'),
    new MyRook(this, 'white', '3', [15, 0, -3.75], 'objs/rook.obj'),
    new MyRook(this, 'white', '3', [15, 0, -1.25], 'objs/rook.obj'),
    new MyRook(this, 'black', '8', [-15, 0, -3.75], 'objs/rook.obj'),
    new MyRook(this, 'black', '8', [-15, 0, -1.25], 'objs/rook.obj'),
    new MyBishop(this, 'white', '4', [15, 0, 1.25], 'objs/bishop.obj'),
    new MyBishop(this, 'white', '4', [15, 0, 3.75], 'objs/bishop.obj'),
    new MyBishop(this, 'black', '9', [-15, 0, 1.25], 'objs/bishop.obj'),
    new MyBishop(this, 'black', '9', [-15, 0, 3.75], 'objs/bishop.obj'),
    new MyKnight(this, 'white', '5', [15, 0, 6.25], 'objs/knight.obj'),
    new MyKnight(this, 'white', '5', [15, 0, 8.75], 'objs/knight.obj'),
    new MyKnight(this, 'black', '10', [-15, 0, 6.25], 'objs/knight.obj'),
    new MyKnight(this, 'black', '10', [-15, 0, 8.75], 'objs/knight.obj')
     ];
    this.selectedPiece = null;

    this.registerForPickID = 1;
}

MyCheversi.prototype = Object.create(CGFobject.prototype);
MyCheversi.prototype.constructor = MyCheversi;

MyCheversi.prototype.pickPiece = function(piece) {
    // not user's turn
    if(this.matchState != MyCheversi.matchState.USER_TURN)
        return;

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

    this.client.makeRequest(request, (data) => {
        this.parseGameObject(data);

        //at this point, match data is updated
        this.mode = mode;
        this.difficulty = difficulty;
        this.userPlayer = player;

        // cases where match states starts with AI playing
        if((this.mode == MyCheversi.mode.SINGLEPLAYER && this.userPlayer == MyCheversi.player.BLACK)
         || this.mode == MyCheversi.mode.NOPLAYER)
            this.matchState == MyCheversi.matchState.AI_TURN;
        else
            this.matchState == MyCheversi.matchState.USER_TURN;

        // TODO: add reset piece positions case a match was already running (reset match)
    });
}

/**
 * Checks if move is valid and executes it if true bu calling movePiece
 * @param tile
 */
MyCheversi.prototype.makeMove = function(tile) {
    if(this.selectedPiece === null) //No piece to make a move
        return;
    if(tile.piece !== null) //Tile already occupied
        return;

    let request = 'checkMove(' + this.match.raw + ',' + this.selectedPiece.representation + ',' + (tile.row-1) + ',' + (tile.col-1) + ')';

    this.client.makeRequest(request, (data) => {
        let validMove = JSON.parse(data.target.response);
        console.log(validMove);
        if(validMove)
           this.movePiece(tile);
    });
}

MyCheversi.prototype.movePiece = function(tile) {
    let request = 'makeMove(' + this.match.raw + ',' + this.selectedPiece.representation + ',' + (tile.row-1) + ',' + (tile.col-1) + ')';

    this.client.makeRequest(request, (data) => {
        this.parseGameObject(data);

        this.selectedPiece.selected = false;
        this.selectedPiece.setTile(tile);
        this.selectedPiece = null;

        this.marker.updateValuesAfterMove(this.match.whiteAttacked, this.match.blackAttacked);

        // Update highlighted tiles
        if(this.match.currentPlayer == MyCheversi.player.WHITE)
            this.board.highlightTiles(this.match.blackAttacked);
        else
            this.board.highlightTiles(this.match.whiteAttacked);
    });
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
