function MyPiece(game, color, representation, initialPosition, file) {
    if (this.constructor === MyPiece){
        throw new Error("Can't instantiate abstract class!");
    }

    CGFobject.call(this,game.scene);
    this.game = game;
    this.scene = game.scene;
    this.representation = representation;
    this.initialPosition = initialPosition;
    this.primitiveComponents = [];
    this.tile = null; //Tile object where it is positioned (invisible cells to be placed on board)
    this.color = color;
    this.animation = null; //Animation for when piece is played
    this.animationMatrix = mat4.create();
    this.animationStartTime = 0;

    this.selected = false; //For when user clicks it (only when not played)

    // Loading obj file
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", file, false);
    xhttp.send();
    let buffer = this.loadObj(xhttp.responseText);

    this.vertices = [];
    this.normals = [];
    this.indices = [];

    for(let i = 0; i < buffer.length; i += 6) {
        this.vertices.push(buffer[i], buffer[i+1], buffer[i+2]);
        this.normals.push(buffer[i+3], buffer[i+4], buffer[i+5]);
    }
    for(let i = 0; i < this.vertices.length/3; i += 3)
        this.indices.push(i, i+1, i+2);

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
}

MyPiece.prototype = Object.create(CGFobject.prototype);
MyPiece.prototype.constructor = MyPiece;

MyPiece.prototype.resetStatus = function() {
    this.tile = null;
    this.animation = null;
    this.animationMatrix = mat4.create();
    this.animationStartTime = 0;
    this.selected = false;
}

MyPiece.prototype.retractPiece = function() {
    let oldTileCoords = this.tile.coords;
    this.tile.resetStatus();
    this.resetStatus();

    //Create movement animation
    let p1 = [oldTileCoords[0]-this.initialPosition[0], 0, oldTileCoords[2]-this.initialPosition[2]];
    //TODO: Check if current control points are generic enough to avoid collisions, etc
    this.animation = new MyBezierAnimation('bezier', 5, [
        p1,
        [p1[0],p1[1]+5,p1[2]],
        [p1[0]/4,p1[1]/4+5,p1[2]/4],
        [0,0,0]
    ]);

    this.animationStartTime = this.scene.currTime;
}

MyPiece.prototype.display = function () {
    this.updateAnimationMatrix();
    this.scene.pushMatrix();
    if(this.selected)
        this.scene.setActiveShader(this.game.shaders.selected);

    this.game.materials[this.color].apply();
    this.scene.translate(this.initialPosition[0], this.initialPosition[1], this.initialPosition[2]);
    this.scene.multMatrix(this.animationMatrix);
    this.scene.registerForPick(this.game.registerForPickID++, this);
    if(this.scene.realisticPieces) {
        this.scene.translate(0, 1, 0); //TODO: Check situation for king and queen for now, later try to see if models can be re-exported so this translation is not needed
        CGFobject.prototype.display.call(this);
    }
    else
        this.displayWithPrimitives();

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
   return vertices;
}
