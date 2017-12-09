function MyPiece(game, color) {
    if (this.constructor === MyPiece){
        throw new Error("Can't instantiate abstract class!");
    }

    CGFobject.call(this,game.scene);
    this.game = game;
    this.scene = game.scene;

    this.tile = null; //Tile object where it is positioned (invisible cells to be placed on board)
    this.color = color;
    this.animation = null; //Animation for when piece is played
    this.timer = null; //Necessary for animation?

    this.selected = false; //For when user clicks it (only when not played)
}

MyPiece.prototype = Object.create(CGFobject.prototype);
MyPiece.prototype.constructor = MyPiece;

MyPiece.prototype.setTile = function (tile) {
    this.tile = tile;
}
