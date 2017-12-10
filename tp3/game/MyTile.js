function MyTile(game, row, col) {
    CGFobject.call(this,game.scene);
    this.game = game;
    this.scene = game.scene;

    this.row = row;
    this.col = col;
    this.coords = [2.5*this.row-11.25, 0.03, 2.5*this.col-11.25];

    this.primitive = new MyQuad(this.scene, [-1.25, 1.25, 1.25, -1.25]);
    this.piece = null;
}

MyTile.prototype = Object.create(CGFobject.prototype);
MyTile.prototype.constructor = MyTile;

MyTile.prototype.display = function() {
    this.scene.pushMatrix();

    this.scene.translate(this.coords[0], this.coords[1], this.coords[2]);
    this.scene.rotate(-Math.PI/2, 1, 0, 0);

    this.scene.registerForPick(this.game.registerForPickID++, this);
    this.primitive.display();

    this.scene.popMatrix();
}
