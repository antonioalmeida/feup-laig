function MyBoard(game) {
    CGFobject.call(this,game.scene);
    this.game = game;
    this.scene = game.scene;

    this.boardTexture = new CGFappearance(this.scene);
    this.boardTexture.loadTexture('textures/board.png');
    this.primitive = new MyPatch(this.scene, [20,20], [[[ 0.5, 0.0, -0.5, 1], [0.5, 0.0, 0.5, 1] ], [[-0.5, 0.0, -0.5, 1], [-0.5, 0.0, 0.5, 1]]]);
    this.tiles = [];
    for(let i = 1; i <= 8; ++i)
        for(let j = 1; j <= 8; ++j)
            this.tiles.push(new MyTile(game, i, j));
}

MyBoard.prototype = Object.create(CGFobject.prototype);
MyBoard.prototype.constructor = MyBoard;

MyBoard.prototype.highlightTiles = function (board) {
    for(let j = 0; j <= 7; j++) {
        for(let i = 0; i <= 7; i++) {
            // 8*i+j because tiles are added to array by column
            // should probably replace this with i and j of MyTile
            if(board[j][i] > 0 && this.tiles[8*i+j].piece === null) //See if position is valid and not already occupied
                this.tiles[8*i+j].highlighted = true;
            else
                this.tiles[8*i+j].highlighted = false;
        }
    }
}

MyBoard.prototype.resetHighlighted = function() {
    for(let id in this.tiles)
        this.tiles[id].resetHighlighted();
}

MyBoard.prototype.resetStatus = function() {
    for(let id in this.tiles)
        this.tiles[id].resetStatus();
}

MyBoard.prototype.display = function() {
    this.scene.pushMatrix();

    for(let id in this.tiles) {
        if(this.tiles[id].highlighted)
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
