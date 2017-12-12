function MySidePlatform(game, sideSign) {
    CGFobject.call(this,game.scene);
    this.game = game;
    this.scene = game.scene;
    this.sign = sideSign; //1 or -1 to put platform on one side of the board or the other

    this.platformTexture = new CGFappearance(this.scene);
    this.platformTexture.loadTexture('textures/platform.jpg');
    this.defaultTexture = new CGFappearance(this.scene);
    this.primitive = new MyPatch(this.scene, [20,20], [[[ 0.5, 0.0, -0.5, 1], [0.5, 0.0, 0.5, 1] ], [[-0.5, 0.0, -0.5, 1], [-0.5, 0.0, 0.5, 1]]]);
}

MySidePlatform.prototype = Object.create(CGFobject.prototype);
MySidePlatform.prototype.constructor = MySidePlatform;

MySidePlatform.prototype.display = function() {
    this.scene.pushMatrix();

    this.scene.translate(15*this.sign, 0, 0);
    this.scene.scale(5, 1, 20);

    this.platformTexture.apply();
    this.primitive.display();

    this.scene.popMatrix();
}
