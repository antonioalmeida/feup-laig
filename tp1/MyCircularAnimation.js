function MyCircularAnimation(id, remainingInfo) {
    MyAnimation.call(this, id);

    this.velocity = remainingInfo.velocity;
    this.center_x = remainingInfo.center_x;
    this.center_y = remainingInfo.center_y;
    this.center_z = remainingInfo.center_z;
    this.radius = remainingInfo.radius;
    this.angularVelocity = this.velocity/this.radius;
    this.initialAngle = remainingInfo.initialAngle;
    this.rotationAngle = remainingInfo.rotationAngle;
}

MyCircularAnimation.prototype = Object.create(MyAnimation.prototype);
MyCircularAnimation.prototype.constructor = MyCircularAnimation;

MyCircularAnimation.prototype.update = function(currTime) {
}

MyCircularAnimation.prototype.apply = function() {
}
