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
        time: new CGFtexture(this.scene, 'textures/time.png'),
        player_score: new CGFtexture(this.scene, 'textures/player_score.png'),
    }

    this.primitive = new MyQuad(this.scene, [-0.5, 0.5, 0.5, -0.5]);
}

MyMarker.prototype = Object.create(CGFobject.prototype);
MyMarker.prototype.constructor = MyMarker;

MyMarker.prototype.display = function() {
    this.scene.pushMatrix();

    //Panel background TODO: Create texture for it later (with the captions basically)
    this.scene.pushMatrix();
    this.scene.translate(0, 8, -12.5);
    this.scene.scale(54, 10, 1);
    this.game.materials.black.apply();
    this.primitive.display();
    this.scene.popMatrix();

    //White player score
    this.scene.pushMatrix();
    this.scene.translate(-23, 8, -12.5);
    this.scene.scale(8, 8, 1);
    this.textures[0].bind();
    this.primitive.display();
    this.scene.popMatrix();

    //Black player score
    this.scene.pushMatrix();
    this.scene.translate(23, 8, -12.5);
    this.scene.scale(8, 8, 1);
    this.textures[1].bind();
    this.primitive.display();
    this.scene.popMatrix();

    //Time since last turn stoped
    //Minutes
    this.scene.pushMatrix();
    let minutes = Math.floor(this.elasped/60);
    this.scene.translate(-10, 8, -12.5);
    this.scene.scale(8, 8, 1);
    this.textures[2].bind();
    this.primitive.display();
    this.scene.popMatrix();

    //Colon
    this.scene.pushMatrix();
    this.scene.translate(-3.5, 8, -12.5);
    this.scene.scale(4, 8, 1);
    this.textures.colon.bind();
    this.primitive.display();
    this.scene.popMatrix();

    //Seconds
    let secondsDozen = Math.floor((this.elapsed % 60) / 10);
    let secondsUnits = (this.elapsed % 60) % 10;
    this.scene.pushMatrix();
    this.scene.translate(2, 8, -12.5);
    this.scene.scale(8, 8, 1);
    this.textures[3].bind();
    this.primitive.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(8, 8, -12.5);
    this.scene.scale(8, 8, 1);
    this.textures[4].bind();
    this.primitive.display();
    this.scene.popMatrix();

    this.scene.popMatrix();
}
