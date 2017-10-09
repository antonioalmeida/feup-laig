/**
* MyPatch
* @constructor
*/
function MyPatch(scene, args,  controlPoints) {
    this.orderU = controlPoints.length - 1;
    this.orderV = controlPoints[0].length - 1;

    console.log("order U : " + this.orderU + " order V : " + this.orderV);

    // Default values for now
    this.uDivs = args[0];
    this.vDivs = args[1];

    console.log("U : " + this.uDivs + " V : " + this.vDivs);
    this.controlPoints = controlPoints;

    var knots1 = this.getKnotsVector(this.orderU);
    var knots2 = this.getKnotsVector(this.orderV);

    var nurbsSurface = new CGFnurbsSurface(this.orderU, this.orderV, knots1, knots2, controlPoints);
    getSurfacePoint = function(u, v) {
        return nurbsSurface.getPoint(u, v);
    };

    this.patch = new CGFnurbsObject(scene, getSurfacePoint, this.uDivs, this.vDivs);
};

MyPatch.prototype = Object.create(CGFobject.prototype);
MyPatch.prototype.constructor = MyPatch;

MyPatch.prototype.getKnotsVector = function (degree) {
    var v = new Array();
    for (var i=0; i<=degree; i++) {
        v.push(0);
    }
    for (var i=0; i<=degree; i++) {
        v.push(1);
    }
    return v;
};

MyPatch.prototype.display = function () {
    this.patch.display();
};

MyPatch.prototype.updateTexCoords = function(afS, afT) { }
