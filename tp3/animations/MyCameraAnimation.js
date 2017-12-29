var DEGREE_TO_RAD = Math.PI/180;

MyCameraAnimation.perspective = {
    NEUTRAL: 0,
    BLACK: 1,
    WHITE: 2
};

/**
 * Values used for pan and orbit operations, respectively, assuming initial position is NEUTRAL, for black and white, respectively
 */
MyCameraAnimation.values = [
    [-15, -60],
    [15, 60]
];

var BLACK_VALUES = 0;
var WHITE_VALUES = 1;
var PAN_X = 0;
var ORBIT_ANGLE = 1;

/**
 * MyCameraAnimation
 * @constructor
 * @param scene - scene where the camera is on
 * @param {int} source - old perspective
 * @param {int} destination - new perspective
 */
function MyCameraAnimation(scene, source, destination) {
    this.scene = scene;
    //Operations to be applied
    this.operations = [];
    //Total amount for the respective operations
    this.limits = [];

    this.done = false;
    this.currOpIndex = 0;
    this.currOpAccLimit = 0;

    switch(source) {
        //If old perspective is neutral, just need to move to the new one
        case MyCameraAnimation.perspective.NEUTRAL:
            this.operations.push('pan', 'orbit');
            this.limits.push(MyCameraAnimation.values[destination-1][PAN_X], MyCameraAnimation.values[destination-1][ORBIT_ANGLE]);
            break;
        //If old perspective is white's, need to move to neutral first and then, if black is the new perspective, move from neutral to there
        case MyCameraAnimation.perspective.WHITE:
            this.operations.push('orbit', 'pan');
            this.limits.push(-MyCameraAnimation.values[WHITE_VALUES][ORBIT_ANGLE], -MyCameraAnimation.values[WHITE_VALUES][PAN_X]);
            if(destination == MyCameraAnimation.perspective.BLACK) {
                this.operations.push('pan', 'orbit');
                this.limits.push(MyCameraAnimation.values[BLACK_VALUES][PAN_X], MyCameraAnimation.values[BLACK_VALUES][ORBIT_ANGLE]);
            }
            break;
        //Same mechanism as white but starting point is black's perspective
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

/**
 * Increments the cumulative delta for the current operation
 */
MyCameraAnimation.prototype.incrementAcc = function() {
    if(this.operations[this.currOpIndex] === 'orbit')
        ++this.currOpAccLimit;
    else //'pan'
        this.currOpAccLimit += 0.25;
}

/**
 * Updates the camera animation
 */
MyCameraAnimation.prototype.update = function() {
    //Apply current operation with a small delta for a smooth transition
    if(this.operations[this.currOpIndex] === 'orbit')
        this.scene.camera.orbit(CGFcameraAxis.Y, DEGREE_TO_RAD*Math.sign(this.limits[this.currOpIndex]));
    else//pan
        this.scene.camera.pan(vec2.fromValues(0.25*Math.sign(this.limits[this.currOpIndex]), 0));

    //Transition to next operation or finish if it was the last one
    this.incrementAcc();
    if(this.currOpAccLimit >= Math.abs(this.limits[this.currOpIndex])) {
        this.currOpAccLimit = 0;
        if(++this.currOpIndex === this.operations.length) this.done = true;
    }
}
