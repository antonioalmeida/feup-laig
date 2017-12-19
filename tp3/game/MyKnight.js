function MyKnight(game, color, representation, initialPosition, file) {
    MyPiece.call(this, game, color, representation, initialPosition, file);

    this.primitiveComponents = [new MyCylinder(game.scene, [2.5, 0, 1, 5, 10, 1, 1])];
}

MyKnight.prototype = Object.create(MyPiece.prototype);
MyKnight.prototype.constructor = MyKnight;

MyKnight.prototype.displayWithPrimitives = function() {
    this.scene.pushMatrix();

    this.scene.rotate(-Math.PI/2, 1, 0, 0);
    this.primitiveComponents[0].display();

    this.scene.popMatrix();
}
