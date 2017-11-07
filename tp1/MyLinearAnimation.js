function MyLinearAnimation(id, velocity, controlPoints) {
    MyAnimation.call(this, id);
    this.velocity = velocity;
    this.controlPoints = [];

    //For each segment
    this.rotationAngles = [];
    this.velocities = [];

    let length = 0;
    //Calculate initial (constant) values: vx, vy and rotation angle (for each line segment)
    for(let i = 0; i < controlPoints.length; ++i){
        this.controlPoints.push(vec3.fromValues(controlPoints[i][0], controlPoints[i][1], controlPoints[i][2]));
        if(i > 0){
            let currAngle = -Math.atan2(this.controlPoints[i][2]- this.controlPoints[i-1][2], this.controlPoints[i][0] - this.controlPoints[i-1][0]); //Not sure if works
            this.rotationAngles.push(currAngle);
            this.velocities.push([velocity*Math.cos(currAngle), velocity*Math.sin(currAngle)]);
            length += vec3.dist(this.controlPoints[i], this.controlPoints[i-1]);
        }
    }

    this.animationTime = length / this.velocity;
    console.log("time: "+this.animationTime);
};

MyLinearAnimation.prototype = Object.create(MyAnimation.prototype);
MyLinearAnimation.prototype.constructor = MyLinearAnimation;

MyLinearAnimation.prototype.update = function(currTime) {
    MyAnimation.prototype.update.call(this, currTime);
    this.delta %= this.animationTime; //To ensure animation repetition (for now, at least)

    mat4.identity(this.currentMatrix);
    let currentPoint = vec3.create();
    vec3.lerp(currentPoint, this.controlPoints[0], this.controlPoints[1], this.delta / this.animationTime);
    //console.log("New Point: "+currentPoint[0]+" "+currentPoint[1]+" "+currentPoint[2]);
    mat4.translate(this.currentMatrix, this.currentMatrix, currentPoint);
    mat4.rotateY(this.currentMatrix, this.currentMatrix, this.rotationAngles[0]);
}
