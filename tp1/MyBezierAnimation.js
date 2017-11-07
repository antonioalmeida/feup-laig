function MyBezierAnimation(id, velocity, controlPoints) {
    MyAnimation.call(this, id);

    this.velocity = velocity;
    this.P1 = vec3.fromValues(controlPoints[0]);
    this.P2 = vec3.fromValues(controlPoints[1]);
    this.P3 = vec3.fromValues(controlPoints[2]);
    this.P4 = vec3.fromValues(controlPoints[3]);

    //Calculate initial constant values
    this.curveLength = this.approximateCurveLength();
    this.totalTime = this.curveLength/velocity;
}

MyBezierAnimation.prototype = Object.create(MyAnimation.prototype);
MyBezierAnimation.prototype.constructor = MyBezierAnimation;

MyBezierAnimation.prototype.getMeanPoint = function(p1, p2) {
    return vec3.fromValues(0.5*(p1[0]+p2[0]), 0.5*(p1[1]+p2[1]), 0.5*(p1[2]+p2[2]));
}

MyBezierAnimation.prototype.approximateCurveLength = function() {
    let p12 = this.getMeanPoint(this.P1, this.P2);
    let p23 = this.getMeanPoint(this.P2, this.P3);
    let p34 = this.getMeanPoint(this.P3, this.P4);
    let p123 = this.getMeanPoint(p12, p23);
    let p234 = this.getMeanPoint(p23, p34);
    let m = this.getMeanPoint(p123, p234);

    let firstConvexHullLength = vec3.dist(this.P1, p12) + vec3.dist(p12, p123) + vec3.dist(p123, m);
    let secondConvexHullLength = vec3.dist(m, p234) + vec3.dist(p234, p34) + vec.dist(p34, this.P4);

    return firstConvexHullLength + secondConvexHullLength;
}
