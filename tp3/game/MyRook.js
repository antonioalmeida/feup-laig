function MyRook(game, color, representation, initialPosition) {
    MyPiece.call(this, game, color, representation, initialPosition);

    this.primitive = new MyCylinder(game.scene,[2.5, 1, 1, 5, 10, 1, 1]);
}

MyRook.prototype = Object.create(MyPiece.prototype);
MyRook.prototype.constructor = MyRook;
