function MyLinearAnimation(id, velocity, controlPoints) {
    MyAnimation.call(this, id);

    this.velocity = velocity;
    this.controlPoints = [];

    //For each segment
    this.rotationAngles = [];
    this.velocities = [];

    //Calculate initial (constant) values: vx, vy and rotation angle (for each line segment)
    for(let i = 0; i < controlPoints.length; ++i){
        this.controlPoints.push(vec3.fromValues(controlPoints[i])); //If does not work use controlPoints[0], controlPoints[1], controlPoints[2]
        if(i > 0){
            let currAngle = -Math.atan2(this.controlPoints[i][2]- this.controlPoints[i-1][2], this.controlPoints[i][0] - this.controlPoints[i-1][0]); //Not sure if works
            this.rotationAngles.push(currAngle);
            this.velocities.push([velocity*Math.cos(currAngle), velocity*Math.sin(currAngle)]);
        }
    }
}

MyLinearAnimation.prototype = Object.create(MyAnimation.prototype);
MyLinearAnimation.prototype.constructor = MyLinearAnimation;
