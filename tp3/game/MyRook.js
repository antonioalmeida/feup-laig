function MyRook(game, color) {
    MyPiece.call(this, game, color);

    this.primitive = new MyCylinder(game.scene,[2.5, 1, 1, 5, 10, 1, 1]);
}

MyRook.prototype = Object.create(MyPiece.prototype);
MyRook.prototype.constructor = MyRook;

MyRook.prototype.display = function () {
    this.scene.pushMatrix();
    if(this.selected)
        this.scene.setActiveShader(this.game.selectedShader);

    this.game.materials[this.color].apply();
    this.scene.rotate(-Math.PI/2, 1, 0, 0); //TODO: Only here while primitive is cylinder
    this.scene.registerForPick(this.game.registerForPickID++, this);
    this.primitive.display();

    if(this.selected)
        this.scene.setActiveShader(this.game.defaultShader);
    this.scene.popMatrix();
}

MyRook.prototype.setTile = function (tile) {
    this.tile = tile;
}
