function MyQueen(game, color) {
    MyPiece.call(this, game, color);

    this.primitive = new MyCylinder(game.scene,[2.5, 1, 0.5, 5, 10, 1, 1]);
    this.selected = true;
}

MyQueen.prototype = Object.create(MyPiece.prototype);
MyQueen.prototype.constructor = MyQueen;

MyQueen.prototype.display = function () {
    this.scene.pushMatrix();
    if(this.selected)
        this.scene.setActiveShader(this.game.selectedShader);

    this.game.materials[this.color].apply();
    this.scene.rotate(-Math.PI/2, 1, 0, 0); //TODO: Only here while primitive is cylinder
    this.primitive.display();

    if(this.selected)
        this.scene.setActiveShader(this.game.defaultShader);
    this.scene.popMatrix();
}

MyQueen.prototype.setTile = function (tile) {
    this.tile = tile;
}
