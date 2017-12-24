var DEGREE_TO_RAD = Math.PI/180;

MyCameraAnimation.perspective = {
    NEUTRAL: 0,
    BLACK: 1,
    WHITE: 2
};

MyCameraAnimation.values = [
    [-15, -60],
    [15, 60]
];

function MyCameraAnimation(scene, source, destination) {
    this.scene = scene;
    this.operations = [];
    this.limits = [];
    this.done = false;
    this.currOpIndex = 0;
    this.currOpAccLimit = 0;

    switch(source) {
        case MyCameraAnimation.perspective.NEUTRAL:
        console.log("entered neutral");
            this.operations.push('pan', 'orbit');
            this.limits.push(MyCameraAnimation.values[destination-1][0], MyCameraAnimation.values[destination-1][1]);
            break;
        case MyCameraAnimation.perspective.WHITE:
            this.operations.push('orbit', 'pan');
            this.limits.push(-MyCameraAnimation.values[1][1], -MyCameraAnimation.values[1][0]);
            if(destination == MyCameraAnimation.perspective.BLACK) {
                this.operations.push('pan', 'orbit');
                this.limits.push(MyCameraAnimation.values[0][0], MyCameraAnimation.values[0][1]);
            }
            break;
        case MyCameraAnimation.perspective.BLACK:
            this.operations.push('orbit', 'pan');
            this.limits.push(-MyCameraAnimation.values[0][1], -MyCameraAnimation.values[0][0]);
            if(destination == MyCameraAnimation.perspective.WHITE) {
                this.operations.push('pan', 'orbit');
                this.limits.push(MyCameraAnimation.values[1][0], MyCameraAnimation.values[1][1]);
            }
            break;
    }

    console.log(this.operations);
    console.log(this.limits);
}

MyCameraAnimation.prototype.constructor = MyCameraAnimation;

MyCameraAnimation.prototype.incrementAcc = function() {
    if(this.operations[this.currOpIndex] === 'orbit')
        ++this.currOpAccLimit;
    else //'pan'
        this.currOpAccLimit += 0.25;
}

MyCameraAnimation.prototype.update = function() {
    if(this.operations[this.currOpIndex] === 'orbit')
        this.scene.camera.orbit(CGFcameraAxis.Y, DEGREE_TO_RAD*Math.sign(this.limits[this.currOpIndex]));
    else//pan
        this.scene.camera.pan(vec2.fromValues(0.25*Math.sign(this.limits[this.currOpIndex]), 0));

    this.incrementAcc();
    if(this.currOpAccLimit >= Math.abs(this.limits[this.currOpIndex])) {
        this.currOpAccLimit = 0;
        if(++this.currOpIndex === this.operations.length) this.done = true;
    }
}
