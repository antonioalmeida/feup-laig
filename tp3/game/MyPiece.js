function MyPiece(game, color, representation, initialPosition) {
    if (this.constructor === MyPiece){
        throw new Error("Can't instantiate abstract class!");
    }

    CGFobject.call(this,game.scene);
    this.game = game;
    this.scene = game.scene;
    this.representation = representation;
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
        this.scene.setActiveShader(this.game.shaders.selected);

    this.game.materials[this.color].apply();
    this.scene.translate(this.initialPosition[0], this.initialPosition[1], this.initialPosition[2]);
    this.scene.multMatrix(this.animationMatrix);
    this.scene.rotate(-Math.PI/2, 1, 0, 0); //TODO: Only here while primitive is cylinder
    this.scene.registerForPick(this.game.registerForPickID++, this);
    this.primitive.display();

    if(this.selected)
        this.scene.setActiveShader(this.game.shaders.default);
    this.scene.popMatrix();
}

MyPiece.prototype.updateAnimationMatrix = function() {
    if(this.animation === null)
        return;

    let delta = (this.scene.currTime - this.animationStartTime) / 1000;
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
    let p4 = [tile.coords[0]-this.initialPosition[0], 0, tile.coords[2]-this.initialPosition[2]];
    //TODO: Check if current control points are generic enough to avoid collisions, etc
    this.animation = new MyBezierAnimation('bezier', 5, [
        [0,0,0],
        [p4[0]/4,p4[1]/4+5,p4[2]/4],
        [p4[0],p4[1]+5,p4[2]],
        p4
    ]);

    this.animationStartTime = this.scene.currTime;
}

MyPiece.prototype.loadObj = function (file) {
    var lines = file.split("\n");
    console.log(lines);
   var positions = [];
   var normals = [];
   var vertices = [];

   for ( var i = 0 ; i < lines.length ; i++ ) {
     var parts = lines[i].trimRight().split(' ');
     if ( parts.length > 0 ) {
       switch(parts[0]) {
         case 'v':  positions.push(
           vec3.fromValues(
             parseFloat(parts[1]),
             parseFloat(parts[2]),
             parseFloat(parts[3])
           ));
           break;
         case 'vn':
           normals.push(
             vec3.fromValues(
               parseFloat(parts[1]),
               parseFloat(parts[2]),
               parseFloat(parts[3])
           ));
           break;
         case 'f': {
           var f1 = parts[1].split('/');
           var f2 = parts[2].split('/');
           var f3 = parts[3].split('/');
           Array.prototype.push.apply(
             vertices, positions[parseInt(f1[0]) - 1]
           );
           Array.prototype.push.apply(
             vertices, normals[parseInt(f1[2]) - 1]
           );
           Array.prototype.push.apply(
             vertices, positions[parseInt(f2[0]) - 1]
           );
           Array.prototype.push.apply(
             vertices, normals[parseInt(f2[2]) - 1]
           );
           Array.prototype.push.apply(
             vertices, positions[parseInt(f3[0]) - 1]
           );
           Array.prototype.push.apply(
             vertices, normals[parseInt(f3[2]) - 1]
           );
           break;
         }
       }
     }
   }
   var vertexCount = vertices.length / 6;
   console.log("Loaded mesh with " + vertexCount + " vertices");
   return vertices;
}
