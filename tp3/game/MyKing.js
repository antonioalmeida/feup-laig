function MyKing(game, color, initialPosition) {
    MyPiece.call(this, game, color, initialPosition);

    this.primitive = new MyCylinder(game.scene, [2.5, 1, 0, 5, 10, 1, 1]);
}

MyKing.prototype = Object.create(MyPiece.prototype);
MyKing.prototype.constructor = MyKing;
