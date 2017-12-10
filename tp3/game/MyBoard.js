function MyBoard(game) {
    CGFobject.call(this,game.scene);
    this.game = game;
    this.scene = game.scene;

    this.boardTexture = new CGFappearance(this.scene);
    this.boardTexture.loadTexture('textures/board2.png');
    this.defaultTexture = new CGFappearance(this.scene);
    this.nodesBoard = new MyQuad(this.scene, [-0.5, 0.5, 0.5, -0.5]); //TODO: Replace by MyPatch instance
    this.tiles = [];
    for(let i = 1; i <= 8; ++i)
        for(let j = 1; j <= 8; ++j)
            this.tiles.push(new MyTile(this.scene, i, j));
}

MyBoard.prototype = Object.create(CGFobject.prototype);
MyBoard.prototype.constructor = MyBoard;

MyBoard.prototype.display = function() {
    this.scene.pushMatrix();

    this.scene.setActiveShader(this.game.transparentShader);
    for(let id in this.tiles) {
        this.scene.registerForPick(id, this.tiles[id]);
        this.tiles[id].display();
    }
    this.scene.clearPickRegistration();
    this.scene.setActiveShader(this.game.defaultShader);

    this.scene.scale(20, 1, 20);
    this.scene.rotate(Math.PI/2, -1, 0, 0); //TODO: Remove after board is implemented via MyPatch

    this.boardTexture.apply();
    this.nodesBoard.display();

    this.scene.popMatrix();
}
