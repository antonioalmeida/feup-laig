/**
 * MyTile
 * @constructor
 * @param game - game where tile will be used
 * @param row - tile's row on the board
 * @param col - tile's column on the board
 */
function MyTile(game, row, col) {
    CGFobject.call(this,game.scene);
    this.game = game;
    this.scene = game.scene;

    this.row = row;
    this.col = col;
    //Equation used: 2.5*x-11.25
    //Obtained through a linear regression of all tiles' coordenates calculated manually
    this.coords = [2.5*this.row-11.25, 0.005, 2.5*this.col-11.25];
    this.highlighted = false;

    this.primitive = new MyQuad(this.scene, [-1.25, 1.25, 1.25, -1.25]);
    this.piece = null;
}

MyTile.prototype = Object.create(CGFobject.prototype);
MyTile.prototype.constructor = MyTile;

/**
 * Resets the tile's highlighted status
 */
MyTile.prototype.resetHighlighted = function() {
    this.highlighted = false;
}

/**
 * Resets the tile's status
 */
MyTile.prototype.resetStatus = function() {
    this.piece = null;
    this.highlighted = false;
}

/**
 * Displays the tile
 */
MyTile.prototype.display = function() {
    this.scene.pushMatrix();

    this.scene.translate(this.coords[0], this.coords[1], this.coords[2]);
    this.scene.rotate(-Math.PI/2, 1, 0, 0);

    this.scene.registerForPick(this.game.registerForPickID++, this);
    this.primitive.display();

    this.scene.popMatrix();
}
