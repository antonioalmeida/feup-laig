/**
 * MyRook
 * @constructor
 * @param game - game instance where rook will be used
 * @param {string} color - piece's color
 * @param representation - piece's internal representation for the server module
 * @param initialPosition - piece's initial position in the scene
 * @param file - file where piece object is stored (for realistic pieces)
 */
function MyRook(game, color, representation, initialPosition, file) {
    MyPiece.call(this, game, color, representation, initialPosition, file);

    this.primitiveComponents = [
        new MyCylinder(game.scene,[1, 1, 1, 5, 10, 1, 1]),
        new MyCylinder(game.scene,[1, 0.9, 0.55, 5, 10, 0, 0]),
        new MyCube(game.scene)
    ];
}

MyRook.prototype = Object.create(MyPiece.prototype);
MyRook.prototype.constructor = MyRook;

/**
 * Displays the rook using previously defined primitives
 */
MyRook.prototype.displayWithPrimitives = function() {
    this.scene.pushMatrix();

    //Base
    this.scene.pushMatrix();
    this.scene.rotate(-Math.PI/2, 1, 0, 0);
    this.scene.scale(1, 1, 0.5);
    this.primitiveComponents[0].display();
    this.scene.popMatrix();

    //Middle
    this.scene.pushMatrix();
    this.scene.rotate(-Math.PI/2, 1, 0, 0);
    this.scene.translate(0, 0, 0.25);
    this.scene.scale(1, 1, 1.5);
    this.primitiveComponents[1].display();
    this.scene.popMatrix();

    //Top
    this.scene.pushMatrix();
    this.scene.rotate(-Math.PI/2, 1, 0, 0);
    this.scene.translate(0, 0, 1.75);
    this.scene.scale(0.8, 0.8, 0.25);
    this.primitiveComponents[0].display();
    this.scene.popMatrix();

    //Little cubes on top
    for(let i = 0; i < 10; ++i) {
        let angle = i*Math.PI/5 + Math.PI/10;
        this.scene.pushMatrix();
        this.scene.translate(0.69*Math.cos(Math.PI/10)*Math.cos(angle), 2, 0.69*Math.cos(Math.PI/10)*Math.sin(angle));
        this.scene.rotate(-angle, 0, 1, 0);
        this.scene.scale(0.195, 0.5, 0.3);
        this.primitiveComponents[2].display();
        this.scene.popMatrix();
    }

    this.scene.popMatrix();
}
