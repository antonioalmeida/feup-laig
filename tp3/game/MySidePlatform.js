function MySidePlatform(game, sideSign) {
    CGFobject.call(this,game.scene);
    this.game = game;
    this.scene = game.scene;
    this.sign = sideSign; //1 or -1 to put platform on one side of the board or the other

    this.platformTexture = new CGFappearance(this.scene);
    this.platformTexture.loadTexture('textures/platform.jpg');
    this.defaultTexture = new CGFappearance(this.scene);
    this.primitive = new MyQuad(this.scene, [-0.5, 0.5, 0.5, -0.5]); //TODO: Replace by MyPatch instance
}

MySidePlatform.prototype = Object.create(CGFobject.prototype);
MySidePlatform.prototype.constructor = MySidePlatform;

MySidePlatform.prototype.display = function() {
    this.scene.pushMatrix();

    this.scene.translate(15*this.sign, 0, 0);
    this.scene.scale(5, 1, 20);
    this.scene.rotate(Math.PI/2, -1, 0, 0); //TODO: Remove after platform is implemented via MyPatch

    this.platformTexture.apply();
    this.primitive.display();

    this.scene.popMatrix();
}
