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
    console.log("Updating combo");
    this.animations[this.currAnimation].active = true; //Just to make sure
    if(this.delta > this.animations[this.currAnimation].animationTime) {
        this.animations[this.currAnimation].active = false;
        this.delta = 0;
        this.startTime = currTime;

        //To ensure animation loop (at least for now)
        this.currAnimation = (this.currAnimation + 1) % this.numAnimations;
        this.animations[this.currAnimation].active = true;
        //Could group next statements in a reset() function (would solve having to use instanceof)
        //However, not sure if animations need to loop so for now it stays like this
        this.animations[this.currAnimation].startTime = -1;
        this.animations[this.currAnimation].delta = 0;
        if(this.animations[this.currAnimation] instanceof MyLinearAnimation)
            this.animations[this.currAnimation].currentSegment = 0;
    }

    this.currentMatrix = this.animations[this.currAnimation].currentMatrix;
}
