function MyBoard(scene) {
    CGFobject.call(this,scene);
    this.scene = scene;

    this.boardTexture = new CGFappearance(scene);
    this.boardTexture.loadTexture('textures/board.jpg');
    this.defaultTexture = new CGFappearance(scene);
    this.nodesBoard = new MyQuad(this.scene, [-0.5, 0.5, 0.5, -0.5]); //TODO: Replace by MyPatch instance
}

MyBoard.prototype = Object.create(CGFobject.prototype);
MyBoard.prototype.constructor = MyBoard;

MyBoard.prototype.display = function() {
    this.scene.pushMatrix();

    this.scene.scale(20, 1, 20);
    this.scene.rotate(Math.PI/2, -1, 0, 0); //TODO: Remove after board is implemented via MyPatch

    this.boardTexture.apply();
    this.nodesBoard.display();

    this.scene.popMatrix();
}
