function MyComboAnimation(id, animations) {
    MyAnimation.call(this, id);

    this.animations = animations;
    this.numAnimations = this.animations.length;
    this.currAnimation = 0;
    for(let i = 0; i < this.animations.length; ++i)
        this.animationTime += this.animations[i].animationTime;
}

MyComboAnimation.prototype = Object.create(MyAnimation.prototype);
MyComboAnimation.prototype.constructor = MyComboAnimation;

MyComboAnimation.prototype.update = function(currTime) {
    MyAnimation.prototype.update.call(this, currTime);
    if(!this.animations[this.currAnimation].active) {
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
