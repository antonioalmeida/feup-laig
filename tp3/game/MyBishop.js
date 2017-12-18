function MyBishop(game, color, representation, initialPosition, file) {
    MyPiece.call(this, game, color, representation, initialPosition, file);

    this.primitive = new MyCylinder(game.scene, [2.5, 0.5, 1, 5, 10, 1, 1]);
}

MyBishop.prototype = Object.create(MyPiece.prototype);
MyBishop.prototype.constructor = MyBishop;
