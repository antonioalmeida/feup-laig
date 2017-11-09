function MyLinearAnimation(id, velocity, controlPoints) {
    MyAnimation.call(this, id);
    this.velocity = velocity;
    this.controlPoints = [];

    this.rotationAngles = []; //Orientation for each segment
    this.times = []; //Time for each segment
    this.numLines = 0; //Number of segments
    this.currentSegment = 0; //Index of current segment

    let totalLength = 0;
    for(let i = 0; i < controlPoints.length; ++i){
        this.controlPoints.push(vec3.fromValues(controlPoints[i][0], controlPoints[i][1], controlPoints[i][2]));
        if(i > 0){
            let currAngle = -Math.atan2(this.controlPoints[i][2]- this.controlPoints[i-1][2], this.controlPoints[i][0] - this.controlPoints[i-1][0]); //Not sure if works
            this.rotationAngles.push(currAngle);
            let currentLength = vec3.dist(this.controlPoints[i], this.controlPoints[i-1]);
            this.times.push(currentLength / this.velocity);
            totalLength += currentLength;
            ++this.numLines;
        }
    }

    this.animationTime = totalLength / this.velocity; //Total animation time
};

MyLinearAnimation.prototype = Object.create(MyAnimation.prototype);
MyLinearAnimation.prototype.constructor = MyLinearAnimation;

MyLinearAnimation.prototype.update = function(currTime) {
    MyAnimation.prototype.update.call(this, currTime);
    console.log("Updating linear");
    if(this.delta > this.times[this.currentSegment]) {
        this.delta = 0;
        this.currentSegment = (this.currentSegment + 1) % this.numLines;
        this.startTime = currTime;
        /*if(this.currentSegment == this.numLines) {
            this.currentSegment = 0;
            return;
        }*/
    }

    mat4.identity(this.currentMatrix);
    let currentPoint = vec3.create();
    vec3.lerp(currentPoint, this.controlPoints[this.currentSegment], this.controlPoints[this.currentSegment+1], this.delta / this.times[this.currentSegment]);
    mat4.translate(this.currentMatrix, this.currentMatrix, currentPoint);
    mat4.rotateY(this.currentMatrix, this.currentMatrix, this.rotationAngles[this.currentSegment]);
}
