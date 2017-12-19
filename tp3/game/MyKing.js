function MyKing(game, color, representation, initialPosition, file) {
    MyPiece.call(this, game, color, representation, initialPosition, file);

    this.primitiveComponents = [new MyCylinder(game.scene, [2.5, 1, 0, 5, 10, 1, 1])];
}

MyKing.prototype = Object.create(MyPiece.prototype);
MyKing.prototype.constructor = MyKing;

MyKing.prototype.displayWithPrimitives = function() {
    this.scene.pushMatrix();

    this.scene.rotate(-Math.PI/2, 1, 0, 0);
    this.primitiveComponents[0].display();

    this.scene.popMatrix();
}
