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

var BLACK_VALUES = 0;
var WHITE_VALUES = 1;
var PAN_X = 0;
var ORBIT_ANGLE = 1;

function MyCameraAnimation(scene, source, destination) {
    this.scene = scene;
    this.operations = [];
    this.limits = [];
    this.done = false;
    this.currOpIndex = 0;
    this.currOpAccLimit = 0;

    switch(source) {
        case MyCameraAnimation.perspective.NEUTRAL:
            this.operations.push('pan', 'orbit');
            this.limits.push(MyCameraAnimation.values[destination-1][PAN_X], MyCameraAnimation.values[destination-1][ORBIT_ANGLE]);
            break;
        case MyCameraAnimation.perspective.WHITE:
            this.operations.push('orbit', 'pan');
            this.limits.push(-MyCameraAnimation.values[WHITE_VALUES][ORBIT_ANGLE], -MyCameraAnimation.values[WHITE_VALUES][PAN_X]);
            if(destination == MyCameraAnimation.perspective.BLACK) {
                this.operations.push('pan', 'orbit');
                this.limits.push(MyCameraAnimation.values[BLACK_VALUES][PAN_X], MyCameraAnimation.values[BLACK_VALUES][ORBIT_ANGLE]);
            }
            break;
        case MyCameraAnimation.perspective.BLACK:
            this.operations.push('orbit', 'pan');
            this.limits.push(-MyCameraAnimation.values[BLACK_VALUES][ORBIT_ANGLE], -MyCameraAnimation.values[BLACK_VALUES][PAN_X]);
            if(destination == MyCameraAnimation.perspective.WHITE) {
                this.operations.push('pan', 'orbit');
                this.limits.push(MyCameraAnimation.values[WHITE_VALUES][PAN_X], MyCameraAnimation.values[WHITE_VALUES][ORBIT_ANGLE]);
            }
            break;
    }
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
