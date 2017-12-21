function MyMarker(game) {
    CGFobject.call(this,game.scene);
    this.game = game;
    this.scene = game.scene;

    //Initial player scores
    this.scores = {
        white: 0,
        black: 0
    }

    this.elapsed = 0; //Time elapsed since last turn started
    this.lastCurrTime = this.scene.currTime; //Reference point to calculate turn time deltas

    this.turnTime = 0;

    this.textures = {
        0: new CGFtexture(this.scene, 'textures/0.png'),
        1: new CGFtexture(this.scene, 'textures/1.png'),
        2: new CGFtexture(this.scene, 'textures/2.png'),
        3: new CGFtexture(this.scene, 'textures/3.png'),
        4: new CGFtexture(this.scene, 'textures/4.png'),
        5: new CGFtexture(this.scene, 'textures/5.png'),
        6: new CGFtexture(this.scene, 'textures/6.png'),
        7: new CGFtexture(this.scene, 'textures/7.png'),
        8: new CGFtexture(this.scene, 'textures/8.png'),
        9: new CGFtexture(this.scene, 'textures/9.png'),
        colon: new CGFtexture(this.scene, 'textures/colon.png')
    }

    this.primitive = new MyQuad(this.scene, [-0.5, 0.5, 0.5, -0.5]);
}

MyMarker.prototype = Object.create(CGFobject.prototype);
MyMarker.prototype.constructor = MyMarker;

MyMarker.prototype.update = function(currTime) {
    if(this.game.turnState !== MyCheversi.turnState.NONE) {
        let turnTimerDelta = (currTime - this.lastCurrTime) / 1000;
        this.elapsed = this.turnTime - turnTimerDelta;
        if(this.elapsed <= 0) {
            this.elapsed = 0;
            this.game.matchOver(true);
        }
    }
}

MyMarker.prototype.resetTurnTime = function() {
    this.turnTime = this.scene.turnTime;
    this.lastCurrTime = this.scene.currTime;
}

MyMarker.prototype.updateScore = function(white, black) {
    let add = function(a,b){return a+b;};
    let reduce = function(arr){return arr.reduce(add);};
    this.scores.white = white.map(reduce).reduce(add);
    this.scores.black = black.map(reduce).reduce(add);
    this.resetTurnTime();
}

MyMarker.prototype.resetStatus = function() {
    this.scores.white = 0;
    this.scores.black = 0;
    this.resetTurnTime();
}

MyMarker.prototype.display = function() {
    this.scene.pushMatrix();

    //Panel background TODO: Create texture for it later (with the captions basically)
    this.scene.pushMatrix();
    this.scene.translate(0, 8, -12.5);
    this.scene.scale(70, 10, 1);
    this.game.materials.black.apply();
    this.primitive.display();
    this.scene.popMatrix();

    //White player score
    let whiteDozens = Math.floor(this.scores.white / 10);
    let whiteUnits = this.scores.white % 10;
    this.scene.pushMatrix();
    this.scene.translate(-30, 8, -12.45);
    this.scene.scale(8, 8, 1);
    this.textures[whiteDozens].bind();
    this.primitive.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(-23, 8, -12.45);
    this.scene.scale(8, 8, 1);
    this.textures[whiteUnits].bind();
    this.primitive.display();
    this.scene.popMatrix();

    //Black player score
    let blackDozens = Math.floor(this.scores.black / 10);
    let blackUnits = this.scores.black % 10;
    this.scene.pushMatrix();
    this.scene.translate(23, 8, -12.45);
    this.scene.scale(8, 8, 1);
    this.textures[blackDozens].bind();
    this.primitive.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(30, 8, -12.45);
    this.scene.scale(8, 8, 1);
    this.textures[blackUnits].bind();
    this.primitive.display();
    this.scene.popMatrix();

    //Time since last turn stoped
    //Minutes
    this.scene.pushMatrix();
    let minutes = Math.floor(this.elapsed/60);
    this.scene.translate(-10, 8, -12.45);
    this.scene.scale(8, 8, 1);
    this.textures[minutes].bind();
    this.primitive.display();
    this.scene.popMatrix();

    //Colon
    this.scene.pushMatrix();
    this.scene.translate(-3.5, 8, -12.45);
    this.scene.scale(4, 8, 1);
    this.textures.colon.bind();
    this.primitive.display();
    this.scene.popMatrix();

    //Seconds
    let secondsDozen = Math.floor((Math.floor(this.elapsed) % 60) / 10);
    let secondsUnits = (Math.floor(this.elapsed) % 60) % 10;
    this.scene.pushMatrix();
    this.scene.translate(2, 8, -12.45);
    this.scene.scale(8, 8, 1);
    this.textures[secondsDozen].bind();
    this.primitive.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(8, 8, -12.45);
    this.scene.scale(8, 8, 1);
    this.textures[secondsUnits].bind();
    this.primitive.display();
    this.scene.popMatrix();

    this.scene.popMatrix();
}
