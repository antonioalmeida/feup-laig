function MyKnight(game, color, representation, initialPosition, file) {
    MyPiece.call(this, game, color, representation, initialPosition, file);

    this.primitiveComponents = [
    	new MyCylinder(game.scene,[1, 1, 1, 5, 10, 1, 1]),
        new MyCylinder(game.scene,[1, 0.7, 0.3, 5, 10, 0, 0]),
        new MyQuad(game.scene,[0,1, 1,0]),
        new MyQuad(game.scene,[1,1, 0,0]),

        new MyCylinder(game.scene, [1,1,1,3,10,1,1]),
        new MyCylinder(game.scene, [1,1,0.3,3,10,1,1]),
    ];
}

MyKnight.prototype = Object.create(MyPiece.prototype);
MyKnight.prototype.constructor = MyKnight;

MyKnight.prototype.displayWithPrimitives = function() {
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
    this.scene.translate(0, 2.25, -0.60);
    this.scene.scale(0.40,0.55,0.9);
    this.primitiveComponents[4].display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0, 2.25, 0.3);
    this.scene.scale(0.40,0.55, 0.8);
    this.primitiveComponents[5].display();
    this.scene.popMatrix();

	this.scene.pushMatrix();
	this.scene.rotate(-Math.PI/2, 0, 1, 0);
	this.scene.translate(-0.73, 1.9, 0);
    this.primitiveComponents[2].display();
    this.scene.popMatrix();

   	this.scene.pushMatrix();
	this.scene.rotate(-Math.PI/2, 0, 1, 0);
	this.scene.translate(-0.73, 1.9, 0);
    this.primitiveComponents[3].display();
    this.scene.popMatrix();

    this.scene.popMatrix();
}
