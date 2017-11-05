function MyCircularAnimation(id, velocity, remainingInfo) {
    MyAnimation.call(this, id, velocity);

    this.center_x = remainingInfo.center[0];
    this.center_y = remainingInfo.center[1];
    this.center_z = remainingInfo.center[2];
    this.radius = remainingInfo.radius;
    this.angularVelocity = velocity/this.radius;
    this.initialAngle = remainingInfo.initialAngle;
    this.rotationAngle = remainingInfo.rotationAngle;
}

MyCircularAnimation.prototype = Object.create(MyAnimation.prototype);
MyCircularAnimation.prototype.constructor = MyCircularAnimation;
