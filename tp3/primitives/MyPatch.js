/**
* MyPatch
* @constructor
* @param scene - the scene where the patch will be drawn on
* @param {array} args - array containing the arguments of the patch - [ uDivs, vDivs ]
* @param {array} controlPoints - array containing the patch's control points
*/
function MyPatch(scene, args, controlPoints) {
  this.scene = scene;
    this.degreeU = controlPoints.length - 1;
    this.degreeV = controlPoints[0].length - 1;

    //console.log("order U : " + this.degreeU + " order V : " + this.degreeV);

    this.uDivs = args[0];
    this.vDivs = args[1];

    //console.log("U : " + this.uDivs + " V : " + this.vDivs);
    this.controlPoints = controlPoints;

    var knots1 = this.getKnotsVector(this.degreeU);
    var knots2 = this.getKnotsVector(this.degreeV);

    var nurbsSurface = new CGFnurbsSurface(this.degreeU, this.degreeV, knots1, knots2, controlPoints);
    getSurfacePoint = function(u, v) {
        return nurbsSurface.getPoint(u, v);
    };

    this.patch = new CGFnurbsObject(scene, getSurfacePoint, this.uDivs, this.vDivs);
};

MyPatch.prototype = Object.create(CGFobject.prototype);
MyPatch.prototype.constructor = MyPatch;

MyPatch.prototype.getKnotsVector = function (degree) {
    let v = [];

    for (var i=0; i<=degree; i++)
        v.push(0);

    for (var i=0; i<=degree; i++)
        v.push(1);

    return v;
};

MyPatch.prototype.display = function () {
    this.scene.gl.disable(this.scene.gl.CULL_FACE);
    this.patch.display();
    this.scene.gl.enable(this.scene.gl.CULL_FACE);
};

MyPatch.prototype.updateTexCoords = function(afS, afT) {
    /* Amplification factors do not apply to patches */
}
