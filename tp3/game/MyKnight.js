function MyKnight(game, color, representation, initialPosition, file) {
    MyPiece.call(this, game, color, representation, initialPosition, file);

    this.primitive = new MyCylinder(game.scene, [2.5, 0, 1, 5, 10, 1, 1]);
}

MyKnight.prototype = Object.create(MyPiece.prototype);
MyKnight.prototype.constructor = MyKnight;
