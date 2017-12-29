/**
 * MyMarker
 * @constructor
 * @param game - game instance where marker will be used
 */
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

    this.material = new CGFappearance(this.scene);
    this.material.setShininess(128);
    this.material.setAmbient(0, 0, 0, 1);
    this.material.setDiffuse(0.3, 0.3, 0.3, 1);
    this.material.setSpecular(0.8, 0.8, 0.8, 1);
    this.material.setEmission(0, 0, 0, 1);

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
        colon: new CGFtexture(this.scene, 'textures/colon.png'),
        background: new CGFtexture(this.scene, 'textures/marker_background.png')
    }

    this.primitive = new MyQuad(this.scene, [-0.5, 0.5, 0.5, -0.5]);
}

MyMarker.prototype = Object.create(CGFobject.prototype);
MyMarker.prototype.constructor = MyMarker;

/**
 * Updates the turn time, if necessary
 * @param currTime time elapsed since application started to run
 */
MyMarker.prototype.update = function(currTime) {
    if(this.game.turnState !== MyCheversi.turnState.NONE && this.game.turnState !== MyCheversi.turnState.GAME_OVER) {
        let turnTimerDelta = (currTime - this.lastCurrTime) / 1000;
        this.elapsed = this.turnTime - turnTimerDelta;
        if(this.elapsed <= 0) {
            this.elapsed = 0;
            this.game.matchOver(true);
        }
    }
}

/**
 * Resets the turn time
 */
MyMarker.prototype.resetTurnTime = function() {
    this.turnTime = this.scene.turnTime;
    this.lastCurrTime = this.scene.currTime;
}

/**
 * Updates the players' scores according to auxiliar boards from the server module
 * @param white - auxiliar board used for calculating white's score
 * @param black - auxiliar board used for calculating black's score
 */
MyMarker.prototype.updateScore = function(white, black) {
    let add = function(a,b){return a+b;};
    let reduce = function(arr){return arr.reduce(add);};
    this.scores.white = white.map(reduce).reduce(add);
    this.scores.black = black.map(reduce).reduce(add);
    this.resetTurnTime();
}

/**
 * Resets the marker's status (scores and turn time)
 */
MyMarker.prototype.resetStatus = function() {
    this.scores.white = 0;
    this.scores.black = 0;
    this.resetTurnTime();
}

/**
 * Updates the marker's background texture. Called when scenarios are exchanged
 */
MyMarker.prototype.updateTexture = function(newTexture) {
    this.textures.background = newTexture;
}

/**
 * Displays the marker and its contents
 */
MyMarker.prototype.display = function() {
    this.scene.pushMatrix();

    this.material.apply();

    //Panel background
    this.scene.pushMatrix();
    this.scene.translate(0, 8, -12.5);
    this.scene.scale(30, 10, 1);
    this.textures.background.bind();
    this.primitive.display();
    this.scene.popMatrix();

    //White player score
    let whiteDozens = Math.floor(this.scores.white / 10);
    let whiteUnits = this.scores.white % 10;
    this.scene.pushMatrix();
    this.scene.translate(9, 8, -12.40);
    this.scene.scale(4, 4, 1);
    this.textures[whiteDozens].bind();
    this.primitive.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(12, 8, -12.40);
    this.scene.scale(4, 4, 1);
    this.textures[whiteUnits].bind();
    this.primitive.display();
    this.scene.popMatrix();

    //Black player score
    let blackDozens = Math.floor(this.scores.black / 10);
    let blackUnits = this.scores.black % 10;
    this.scene.pushMatrix();
    this.scene.translate(-12, 8, -12.40);
    this.scene.scale(4, 4, 1);
    this.textures[blackDozens].bind();
    this.primitive.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(-9, 8, -12.40);
    this.scene.scale(4, 4, 1);
    this.textures[blackUnits].bind();
    this.primitive.display();
    this.scene.popMatrix();

    //Time since last turn stoped
    //Minutes
    this.scene.pushMatrix();
    let minutes = Math.floor(this.elapsed/60);
    this.scene.translate(-2.75, 8, -12.40);
    this.scene.scale(3, 3, 1);
    this.textures[minutes].bind();
    this.primitive.display();
    this.scene.popMatrix();

    //Colon
    this.scene.pushMatrix();
    this.scene.translate(-1.25, 8, -12.40);
    this.scene.scale(1.375, 2.5, 1);
    this.textures.colon.bind();
    this.primitive.display();
    this.scene.popMatrix();

    //Seconds
    let secondsDozen = Math.floor((Math.floor(this.elapsed) % 60) / 10);
    let secondsUnits = (Math.floor(this.elapsed) % 60) % 10;
    this.scene.pushMatrix();
    this.scene.translate(0.25, 8, -12.40);
    this.scene.scale(3, 3, 1);
    this.textures[secondsDozen].bind();
    this.primitive.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(2.25, 8, -12.40);
    this.scene.scale(3, 3, 1);
    this.textures[secondsUnits].bind();
    this.primitive.display();
    this.scene.popMatrix();

    this.scene.popMatrix();
}
