function MyCircularAnimation(id, remainingInfo) {
    MyAnimation.call(this, id);

    let DEGREE_TO_RAD = Math.PI/180;
    this.velocity = remainingInfo.speed;
    this.center = vec3.fromValues(remainingInfo.centerx, remainingInfo.centery, remainingInfo.centerz);
    this.radius = remainingInfo.radius;
    this.angularVelocity = this.velocity/this.radius;
    this.initialAngle = DEGREE_TO_RAD*remainingInfo.startang;
    this.rotationAngle = DEGREE_TO_RAD*remainingInfo.rotang;
    this.animationTime = (this.rotationAngle*this.radius) / this.velocity;
}

MyCircularAnimation.prototype = Object.create(MyAnimation.prototype);
MyCircularAnimation.prototype.constructor = MyCircularAnimation;

MyCircularAnimation.prototype.update = function(currTime) {
    MyAnimation.prototype.update.call(this, currTime);
    this.delta %= this.animationTime; //To ensure animation loop, at least for now
    //if(this.delta >= this.animationTime) return;

    let angleDelta = this.initialAngle + this.angularVelocity*this.delta;
    mat4.identity(this.currentMatrix);
    mat4.translate(this.currentMatrix, this.currentMatrix, this.center);
    mat4.rotateY(this.currentMatrix, this.currentMatrix, angleDelta);
    mat4.translate(this.currentMatrix, this.currentMatrix, vec3.fromValues(this.radius, 0, 0));
    mat4.rotateY(this.currentMatrix, this.currentMatrix, Math.PI/2); //TODO: Ask teacher about this (how to check if indeed it needs to be done?)
}
