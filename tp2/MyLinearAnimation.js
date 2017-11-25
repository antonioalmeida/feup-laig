function MyLinearAnimation(id, velocity, controlPoints) {
    MyAnimation.call(this, id);

    this.controlPoints = [];
    this.rotationAngles = []; //Orientation for each segment
    this.times = []; //Time for each segment
    this.numLines = 0; //Number of segments

    let totalLength = 0;
    for(let i = 0; i < controlPoints.length; ++i){
        this.controlPoints.push(vec3.fromValues(controlPoints[i][0], controlPoints[i][1], controlPoints[i][2]));
        if(i > 0){
            let currAngle = -Math.atan2(this.controlPoints[i][2]- this.controlPoints[i-1][2], this.controlPoints[i][0] - this.controlPoints[i-1][0]);
            this.rotationAngles.push(currAngle);
            let currentLength = vec3.dist(this.controlPoints[i], this.controlPoints[i-1]);
            this.times.push(currentLength / velocity);
            totalLength += currentLength;
            ++this.numLines;
        }
    }
    this.animationTime = totalLength / velocity;
};

MyLinearAnimation.prototype = Object.create(MyAnimation.prototype);
MyLinearAnimation.prototype.constructor = MyLinearAnimation;

MyLinearAnimation.prototype.getSegment = function(delta) {
    let segment = -1;
    let deltaCurrSegm = 0;
    for(let i = 0; i < this.numLines; ++i) {
        if(delta <= this.times[i]) {
            segment = i;
            deltaCurrSegm = delta;
            break;
        }

        delta -= this.times[i];
    }

    return [segment, deltaCurrSegm];
}

MyLinearAnimation.prototype.matrixAfter = function(delta) {
    let data = this.getSegment(delta);
    let segment = data[0];
    let segmDelta = data[1];
    let currentPoint = vec3.create();
    let result = mat4.create();
    if(segment != -1) {
        vec3.lerp(currentPoint, this.controlPoints[segment], this.controlPoints[segment+1], segmDelta / this.times[segment]);
        mat4.translate(result, result, currentPoint);
        mat4.rotateY(result, result, this.rotationAngles[segment]);
    }

    return result;
}
