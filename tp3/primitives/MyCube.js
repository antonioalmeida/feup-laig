/**
 * MyCube
 * @constructor
 * @param scene - the scene where the quad will be drawn on
 */
function MyCube(scene) {
    CGFobject.call(this,scene);

    this.primitive = new MyQuad(scene, [-0.5, 0.5, 0.5, -0.5]);
};

MyCube.prototype = Object.create(CGFobject.prototype);
MyCube.prototype.constructor=MyCube;

MyCube.prototype.display = function() {
    this.scene.pushMatrix();

    //+ZZ face
    this.scene.pushMatrix();
    this.scene.translate(0, 0, 0.5);
    this.primitive.display();
    this.scene.popMatrix();

    //-ZZ face
    this.scene.pushMatrix();
    this.scene.rotate(Math.PI, 0, 1, 0);
    this.scene.translate(0, 0, 0.5);
    this.primitive.display();
    this.scene.popMatrix();

    //+YY face
    this.scene.pushMatrix();
    this.scene.rotate(-Math.PI/2, 1, 0, 0);
    this.scene.translate(0, 0, 0.5);
    this.primitive.display();
    this.scene.popMatrix();

    //-YY face
    this.scene.pushMatrix();
    this.scene.rotate(Math.PI/2, 1, 0, 0);
    this.scene.translate(0, 0, 0.5);
    this.primitive.display();
    this.scene.popMatrix();

    //+XX face
    this.scene.pushMatrix();
    this.scene.rotate(Math.PI/2, 0, 1, 0);
    this.scene.translate(0, 0, 0.5);
    this.primitive.display();
    this.scene.popMatrix();

    //-XX face
    this.scene.pushMatrix();
    this.scene.rotate(-Math.PI/2, 0, 1, 0);
    this.scene.translate(0, 0, 0.5);
    this.primitive.display();
    this.scene.popMatrix();

    this.scene.popMatrix();
}
