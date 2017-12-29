/**
 * MyKing
 * @constructor
 * @param game - game instance where king will be used
 * @param {string} color - piece's color
 * @param representation - piece's internal representation for the server module
 * @param initialPosition - piece's initial position in the scene
 * @param file - file where piece object is stored (for realistic pieces)
 */
function MyKing(game, color, representation, initialPosition, file) {
    MyPiece.call(this, game, color, representation, initialPosition, file);

    this.primitiveComponents = [
        new MyCylinder(game.scene,[1, 1, 1, 5, 10, 1, 1]),
        new MyCylinder(game.scene,[1, 0.7, 0.3, 5, 10, 0, 0]),
        new MyCylinder(game.scene,[1, 1, 1, 10, 10, 1, 1]),
		new MyCylinder(game.scene,[1, 0.3, 0.55, 5, 10, 1, 1]),
        new MyCube(game.scene)
    ];
}

MyKing.prototype = Object.create(MyPiece.prototype);
MyKing.prototype.constructor = MyKing;

/**
 * Displays the king using previously defined primitives
 */
MyKing.prototype.displayWithPrimitives = function() {
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
    this.scene.scale(0.3, 0.3, 0.8);
    this.primitiveComponents[0].display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.rotate(-Math.PI/2, 1, 0, 0);
    this.scene.translate(0, 0, 2.50);
    this.scene.scale(0.4, 0.4, 0.1);
    this.primitiveComponents[2].display();
    this.scene.popMatrix();

    // top inverted cylinder
    this.scene.pushMatrix();
    this.scene.rotate(-Math.PI/2, 1, 0, 0);
    this.scene.translate(0, 0, 2.55);
    this.scene.scale(1, 1, 0.8);
    this.primitiveComponents[3].display();
    this.scene.popMatrix();

    // cross at the top
    this.scene.pushMatrix();
   	this.scene.translate(0, 3.8, 0);
   	this.scene.scale(0.2, 0.2, 1.1);
    this.primitiveComponents[4].display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
   	this.scene.translate(0, 3.8, 0);
   	this.scene.scale(0.2, 0.9, 0.2);
    this.primitiveComponents[4].display();
    this.scene.popMatrix();

    this.scene.popMatrix();
}
