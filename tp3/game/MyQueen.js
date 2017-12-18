function MyQueen(game, color, representation, initialPosition, file) {
    MyPiece.call(this, game, color, representation, initialPosition, file);

    this.primitive = new MyCylinder(game.scene,[2.5, 1, 0.5, 5, 10, 1, 1]);
}

MyQueen.prototype = Object.create(MyPiece.prototype);
MyQueen.prototype.constructor = MyQueen;
