function MyCircularAnimation(id, remainingInfo) {
    MyAnimation.call(this, id);

    let DEGREE_TO_RAD = Math.PI/180;
    let velocity = remainingInfo.speed;
    this.center = vec3.fromValues(remainingInfo.centerx, remainingInfo.centery, remainingInfo.centerz);
    this.radius = remainingInfo.radius;
    this.angularVelocity = velocity/this.radius;
    this.initialAngle = DEGREE_TO_RAD*remainingInfo.startang;
    let rotationAngle = DEGREE_TO_RAD*remainingInfo.rotang;
    this.animationTime = (rotationAngle*this.radius) / velocity;
}

MyCircularAnimation.prototype = Object.create(MyAnimation.prototype);
MyCircularAnimation.prototype.constructor = MyCircularAnimation;

MyCircularAnimation.prototype.matrixAfter = function(delta) {
    let result = mat4.create();
    let angleDelta = this.initialAngle + this.angularVelocity*delta;
    mat4.translate(result, result, this.center);
    mat4.rotateY(result, result, angleDelta);
    mat4.translate(result, result, vec3.fromValues(this.radius, 0, 0));
    mat4.rotateY(result, result, Math.PI/2); //Necessary as we assume the object's front is inicially faced towards +ZZ

    return result;
}
