function MyBoard(game) {
    CGFobject.call(this,game.scene);
    this.game = game;
    this.scene = game.scene;

    this.boardTexture = new CGFappearance(this.scene);
    this.boardTexture.loadTexture('textures/board.png');
    this.defaultTexture = new CGFappearance(this.scene);
    this.primitive = new MyPatch(this.scene, [20,20], [[[ 0.5, 0.0, -0.5, 1], [0.5, 0.0, 0.5, 1] ], [[-0.5, 0.0, -0.5, 1], [-0.5, 0.0, 0.5, 1]]]);
    this.tiles = [];
    for(let i = 1; i <= 8; ++i)
        for(let j = 1; j <= 8; ++j)
            this.tiles.push(new MyTile(game, i, j));
}

MyBoard.prototype = Object.create(CGFobject.prototype);
MyBoard.prototype.constructor = MyBoard;

MyBoard.prototype.display = function() {
    this.scene.pushMatrix();

    this.scene.setActiveShader(this.game.shaders.transparent);

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

MyBoard.prototype.highlightTiles = function (board) {
    for(let j = 0; j <= 7; j++) {
        for(let i = 0; i <= 7; i++) {
            // 8*i+j because tiles are added to array by column
            // should probably replace this with i and j of MyTile
            if(board[j][i] > 0)
                this.tiles[8*i+j].highlighted = true;
            else 
                this.tiles[8*i+j].highlighted = false;
        }
    }
}
