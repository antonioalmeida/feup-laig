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
    if(this.animations[this.currAnimation].constructor == MyLinearAnimation) console.log("Currently linear");
    else if(this.animations[this.currAnimation].constructor == MyCircularAnimation) console.log("Currently circular");
    else if(this.animations[this.currAnimation].constructor == MyBezierAnimation) console.log("Currently bezier");
    if(this.delta > this.animations[this.currAnimation].animationTime) {
        this.delta = 0;
        this.startTime = currTime;
        //To ensure animation loop (at least for now)
        this.currAnimation = (this.currAnimation + 1) % this.numAnimations;
        this.animations[this.currAnimation].startTime = -1;
        this.animations[this.currAnimation].delta = 0;
        mat4.identity(this.animations[this.currAnimation].currentMatrix);
    }

    this.animations[this.currAnimation].update(currTime);
    this.currentMatrix = this.animations[this.currAnimation].currentMatrix;
}
