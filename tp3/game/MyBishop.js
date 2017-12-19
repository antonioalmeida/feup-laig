function MyBishop(game, color, representation, initialPosition, file) {
    MyPiece.call(this, game, color, representation, initialPosition, file);

    this.primitiveComponents = [
        new MyCylinder(game.scene,[1, 1, 1, 5, 10, 1, 1]),
        new MyCylinder(game.scene,[1, 0.7, 0.3, 5, 10, 0, 0]),
        //PATCH HERE
        new MySphere(game.scene, [1, 5, 10])
    ];
}

MyBishop.prototype = Object.create(MyPiece.prototype);
MyBishop.prototype.constructor = MyBishop;

MyBishop.prototype.displayWithPrimitives = function() {
    this.scene.pushMatrix();

    this.scene.pushMatrix();
    this.scene.rotate(-Math.PI/2, 1, 0, 0);
    this.scene.scale(1, 1, 0.5);
    this.primitiveComponents[0].display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.rotate(-Math.PI/2, 1, 0, 0);
    this.scene.translate(0, 0, 0.25);
    this.scene.scale(1, 1, 1.5);
    this.primitiveComponents[1].display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.rotate(-Math.PI/2, 1, 0, 0);
    this.scene.translate(0, 0, 1.75);
    this.scene.scale(0.3, 0.3, 0.5);
    this.primitiveComponents[0].display();
    this.scene.popMatrix();

    //DRAW PATCH HERE

    this.scene.pushMatrix();
    this.scene.translate(0, 2.35, 0);
    this.scene.scale(0.1, 0.1, 0.1);
    this.primitiveComponents[2].display(); //TODO: When patch is created, update index to 3
    this.scene.popMatrix();

    this.scene.popMatrix();
}
