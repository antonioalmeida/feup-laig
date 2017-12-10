function MyKnight(game, color) {
    MyPiece.call(this, game, color);

    this.primitive = new MyCylinder(game.scene, [2.5, 0, 1, 5, 10, 1, 1]);
}

MyKnight.prototype = Object.create(MyPiece.prototype);
MyKnight.prototype.constructor = MyKnight;

MyKnight.prototype.display = function () {
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

MyKnight.prototype.setTile = function (tile) {
    this.tile = tile;
}
