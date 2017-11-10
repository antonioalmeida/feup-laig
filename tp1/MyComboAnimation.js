function MyComboAnimation(id, animations) {
    MyAnimation.call(this, id);

    this.animations = animations;
    this.numAnimations = this.animations.length;
    this.currAnimation = 0;
}

MyComboAnimation.prototype = Object.create(MyAnimation.prototype);
MyComboAnimation.prototype.constructor = MyComboAnimation;

MyComboAnimation.prototype.update = function(currTime) {
    MyAnimation.prototype.update.call(this, currTime);
    //this.animations[this.currAnimation].active = true; //Just to make sure
    //if(this.delta > this.animations[this.currAnimation].animationTime) {
    if(!this.animations[this.currAnimation].active) {
        //this.animations[this.currAnimation].active = false;
        //this.delta = 0;
        //this.startTime = currTime;

        //To ensure animation loop (at least for now)
        //this.currAnimation = (this.currAnimation + 1) % this.numAnimations;
        if(++this.currAnimation == this.numAnimations) {
            this.active = false;
            return;
        }
        this.animations[this.currAnimation].reset();
    }

    this.currentMatrix = this.animations[this.currAnimation].currentMatrix;
}

MyComboAnimation.prototype.reset = function() {
    MyAnimation.prototype.reset.call(this);
    this.currAnimation = 0;
    this.animations[this.currAnimation].reset();
}

MyComboAnimation.prototype.markActive = function() {
    MyAnimation.prototype.markActive.call(this);
    this.animations[this.currAnimation].reset();
}
