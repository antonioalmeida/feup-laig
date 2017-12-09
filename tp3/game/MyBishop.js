function MyBishop(game, color) {
    MyPiece.call(this, game, color);

    this.primitive = new MyCylinder(game.scene, [2.5, 0.5, 1, 5, 10, 1, 1]);
}

MyBishop.prototype = Object.create(MyPiece.prototype);
MyBishop.prototype.constructor = MyBishop;

MyBishop.prototype.display = function () {
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

MyBishop.prototype.setTile = function (tile) {
    this.tile = tile;
}
