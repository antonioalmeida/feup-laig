/**
 * MyBoard
 * @constructor
 * @param game - game instance where board will be used
 */
function MyBoard(game) {
    CGFobject.call(this,game.scene);
    this.game = game;
    this.scene = game.scene;

    this.boardTexture = new CGFappearance(this.scene);
    this.boardTexture.setShininess(128);
    this.boardTexture.setAmbient(0, 0, 0, 1);
    this.boardTexture.setDiffuse(0.3, 0.3, 0.3, 1);
    this.boardTexture.setSpecular(0.8, 0.8, 0.8, 1);
    this.boardTexture.setEmission(0, 0, 0, 1);
    this.boardTexture.loadTexture(this.scene, 'textures/board.png');
    this.primitive = new MyPatch(this.scene, [20,20], [[[ 0.5, 0.0, -0.5, 1], [0.5, 0.0, 0.5, 1] ], [[-0.5, 0.0, -0.5, 1], [-0.5, 0.0, 0.5, 1]]]);
    this.tiles = [];
    for(let i = 1; i <= 8; ++i)
        for(let j = 1; j <= 8; ++j)
            this.tiles.push(new MyTile(game, i, j));
}

MyBoard.prototype = Object.create(CGFobject.prototype);
MyBoard.prototype.constructor = MyBoard;

/**
 * Highlights valid playing positions (tiles) through an auxiliar board provided by the Prolog module
 * @param board - auxiliar board to help determine if position is to be highlighted
 */
MyBoard.prototype.highlightTiles = function (board) {
    for(let j = 0; j <= 7; j++) {
        for(let i = 0; i <= 7; i++) {
            // 8*i+j because tiles are added to array by column
            if(board[j][i] > 0 && this.tiles[8*i+j].piece === null) //See if position is valid and not already occupied
                this.tiles[8*i+j].highlighted = true;
            else
                this.tiles[8*i+j].highlighted = false;
        }
    }
}

/**
 * Resets the highlight status for all tiles
 */
MyBoard.prototype.resetHighlighted = function() {
    for(let id in this.tiles)
        this.tiles[id].resetHighlighted();
}

/**
 * Resets the board's status
 */
MyBoard.prototype.resetStatus = function() {
    for(let id in this.tiles)
        this.tiles[id].resetStatus();
}

/**
 * Updates the board's texture. Called when scenario is switched
 * @param newTexture - new board texture
 */
MyBoard.prototype.updateTexture = function(newTexture) {
    this.boardTexture.setTexture(newTexture);
}

/**
 * Display the board and its tiles
 */
MyBoard.prototype.display = function() {
    this.scene.pushMatrix();

    for(let id in this.tiles) {
        if(this.tiles[id].highlighted && this.game.scene.highlightTiles)
           this.scene.setActiveShader(this.game.shaders.highlighted);
        else
            this.scene.setActiveShader(this.game.shaders.transparent);
        this.tiles[id].display();
    }

    this.scene.setActiveShader(this.game.shaders.default);
    this.scene.clearPickRegistration();

    this.scene.scale(20, 1, 20);

    this.boardTexture.apply();
    this.primitive.display();

    this.scene.popMatrix();
}
