/**
 * MyBezierAnimation
 * @constructor
 * @param {string} id - animation identifier
 * @param {float} velocity - speed at which the animation should be executed, in 3D units/second
 * @param controlPoints - array containing the animation's 4 characteristic points
 */
function MyBezierAnimation(id, velocity, controlPoints) {
    MyAnimation.call(this, id);
    this.P1 = vec3.fromValues(controlPoints[0][0], controlPoints[0][1], controlPoints[0][2]);
    this.P2 = vec3.fromValues(controlPoints[1][0], controlPoints[1][1], controlPoints[1][2]);
    this.P3 = vec3.fromValues(controlPoints[2][0], controlPoints[2][1], controlPoints[2][2]);
    this.P4 = vec3.fromValues(controlPoints[3][0], controlPoints[3][1], controlPoints[3][2]);

    let curveLength = this.approximateCurveLength();
    this.animationTime = curveLength/velocity;

}

MyBezierAnimation.prototype = Object.create(MyAnimation.prototype);
MyBezierAnimation.prototype.constructor = MyBezierAnimation;

/**
 * Calculates the mean point of two given vectors
 * @param p1 - first point
 * @param p2 - second point
 * @return mean point of two given vectors
 */
MyBezierAnimation.prototype.getMeanPoint = function(p1, p2) {
    return vec3.fromValues(0.5*(p1[0]+p2[0]), 0.5*(p1[1]+p2[1]), 0.5*(p1[2]+p2[2]));
}


/**
 * Approximates the curve's length through its convex hulls resulting of the application id Casteljau's algorithm (depth = 1)
 * @return approximate curve length
 */
MyBezierAnimation.prototype.approximateCurveLength = function() {
    let p12 = this.getMeanPoint(this.P1, this.P2);
    let p23 = this.getMeanPoint(this.P2, this.P3);
    let p34 = this.getMeanPoint(this.P3, this.P4);
    let p123 = this.getMeanPoint(p12, p23);
    let p234 = this.getMeanPoint(p23, p34);
    let m = this.getMeanPoint(p123, p234);

    let firstConvexHullLength = vec3.dist(this.P1, p12) + vec3.dist(p12, p123) + vec3.dist(p123, m);
    let secondConvexHullLength = vec3.dist(m, p234) + vec3.dist(p234, p34) + vec3.dist(p34, this.P4);

    return firstConvexHullLength + secondConvexHullLength;
}

/**
 * Calculates the animation matrix to apply to an object after a specific time has passed
 * @param {float} delta - time elapsed since animation start
 * @return transformation matrix to apply
 */
MyBezierAnimation.prototype.matrixAfter = function(delta) {
    let s = delta/this.animationTime;
    this.currentQ = this.Q(s);

    let result = mat4.create();
    mat4.translate(result, result, vec3.fromValues(this.currentQ[0], this.currentQ[1], this.currentQ[2]));

    return result;
}

/**
 * Calculates the next point in the animation given a time fraction
 * @param s - time fraction
 * @return next animation point
 */
MyBezierAnimation.prototype.Q = function(s) {
  let blend_1 = (1-s)*(1-s)*(1-s);
	let blend_2 = 3*s*(1-s)*(1-s);
	let blend_3 = 3*s*s*(1-s);
	let blend_4 = s*s*s;

	return vec3.fromValues(
		blend_1*this.P1[0]+blend_2*this.P2[0]+blend_3*this.P3[0]+blend_4*this.P4[0],
		blend_1*this.P1[1]+blend_2*this.P2[1]+blend_3*this.P3[1]+blend_4*this.P4[1],
		blend_1*this.P1[2]+blend_2*this.P2[2]+blend_3*this.P3[2]+blend_4*this.P4[2]);
}
