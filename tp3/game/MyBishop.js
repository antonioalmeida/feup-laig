/**
 * MyBishop
 * @constructor
 * @param game - game instance where bishop will be used
 * @param {string} color - piece's color
 * @param representation - piece's internal representation for the server module
 * @param initialPosition - piece's initial position in the scene
 * @param file - file where piece object is stored (for realistic pieces)
 */
function MyBishop(game, color, representation, initialPosition, file) {
    MyPiece.call(this, game, color, representation, initialPosition, file);

    this.primitiveComponents = [
        new MyCylinder(game.scene,[1, 1, 1, 5, 10, 1, 1]),
        new MyCylinder(game.scene,[1, 0.7, 0.3, 5, 10, 0, 0]),
        new MySphere(game.scene, [1, 5, 10]),
        new MyCylinder(game.scene,[1, 1, 1, 5, 10, 0, 0]),
        new MyCylinder(game.scene,[1, 0.65, 1, 5, 10, 0, 0]),
        new MyCylinder(game.scene,[1, 1, 0.65, 5, 10, 0, 0]),
        new MyCylinder(game.scene,[1, 1, 0, 5, 10, 0, 0])
    ];
}

MyBishop.prototype = Object.create(MyPiece.prototype);
MyBishop.prototype.constructor = MyBishop;

/**
 * Displays the bishop using previously defined primitives
 */
MyBishop.prototype.displayWithPrimitives = function() {
    this.scene.pushMatrix();

    // base
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

    // inverted cone
    this.scene.pushMatrix();
    this.scene.rotate(-Math.PI/2, 1, 0, 0);
    this.scene.translate(0, 0, 1.90);
    this.scene.scale(0.51, 0.51, 0.45);
    this.primitiveComponents[4].display();
    this.scene.popMatrix();

    // normal cylinder
    this.scene.pushMatrix();
    this.scene.rotate(-Math.PI/2, 1, 0, 0);
    this.scene.translate(0, 0, 2.35);
    this.scene.scale(0.51, 0.51, 0.45);
    this.primitiveComponents[3].display();
    this.scene.popMatrix();

    // 3/4 height top cone
    this.scene.pushMatrix();
    this.scene.rotate(-Math.PI/2, 1, 0, 0);
    this.scene.translate(0, 0, 2.8);
    this.scene.scale(0.51, 0.51, 0.3);
    this.primitiveComponents[5].display();
    this.scene.popMatrix();

    // Top cone
    this.scene.pushMatrix();
    this.scene.rotate(-Math.PI/2, 1, 0, 0);
    this.scene.translate(0, 0, 3.1);
    this.scene.scale(0.335, 0.335, 0.42);
    this.primitiveComponents[6].display();
    this.scene.popMatrix();

    // Sphere at the top
    this.scene.pushMatrix();
    this.scene.translate(0, 3.535, 0);
    this.scene.scale(0.1, 0.1, 0.1);
    this.primitiveComponents[2].display();
    this.scene.popMatrix();

    this.scene.popMatrix();
}
