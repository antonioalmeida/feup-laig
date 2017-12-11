function MyPiece(game, color, initialPosition) {
    if (this.constructor === MyPiece){
        throw new Error("Can't instantiate abstract class!");
    }

    CGFobject.call(this,game.scene);
    this.game = game;
    this.scene = game.scene;
    this.initialPosition = initialPosition;

    this.tile = null; //Tile object where it is positioned (invisible cells to be placed on board)
    this.color = color;
    this.animation = null; //Animation for when piece is played
    this.animationMatrix = mat4.create();
    this.animationStartTime = 0;

    this.selected = false; //For when user clicks it (only when not played)
}

MyPiece.prototype = Object.create(CGFobject.prototype);
MyPiece.prototype.constructor = MyPiece;

MyPiece.prototype.display = function () {
    this.updateAnimationMatrix();
    this.scene.pushMatrix();
    if(this.selected)
        this.scene.setActiveShader(this.game.selectedShader);

    this.game.materials[this.color].apply();
    this.scene.translate(this.initialPosition[0], this.initialPosition[1], this.initialPosition[2]);
    this.scene.rotate(-Math.PI/2, 1, 0, 0); //TODO: Only here while primitive is cylinder
    this.scene.multMatrix(this.animationMatrix);
    this.scene.registerForPick(this.game.registerForPickID++, this);
    this.primitive.display();

    if(this.selected)
        this.scene.setActiveShader(this.game.defaultShader);
    this.scene.popMatrix();
}

MyPiece.prototype.updateAnimationMatrix = function() {
    if(this.animation === null)
        return;

    let delta = (this.game.scene.currTime - this.animationStartTime) / 1000;
    if(delta > this.animation.animationTime) {
        this.animationMatrix = this.animation.matrixAfter(this.animation.animationTime);
        this.animation = null;
        return;
    }
    this.animationMatrix = this.animation.matrixAfter(delta);
}

MyPiece.prototype.setTile = function (tile) {
    //Bidirectional reference
    this.tile = tile;
    tile.piece = this;

    //Create movement animation
    let temp = [tile.coords[0]-this.initialPosition[0], 0, tile.coords[2]-this.initialPosition[2]];
    //TODO: Substitute linear for pretty bezier (figure out generic control point structure to avoid collisions, etc)
    /*this.animation = new MyBezierAnimation('bezier', 2.5, [
        [0,0,0],
        ,//TBD
        ,//TBD
        temp
    ]);
    */
    this.animation = new MyLinearAnimation('linear', 2.5, [[0,0,0], temp]);
    this.animationStartTime = this.game.scene.currTime;
}
