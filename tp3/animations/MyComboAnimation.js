function MyComboAnimation(id, animations) {
    MyAnimation.call(this, id);

    this.animations = animations;
    this.numAnimations = this.animations.length;
    this.currAnimation = 0;
}

MyComboAnimation.prototype = Object.create(MyAnimation.prototype);
MyComboAnimation.prototype.constructor = MyComboAnimation;

/**
 * Calculates the animation time, which is the sum of all animation times from animations referenced
 */
MyComboAnimation.prototype.updateAnimationTime = function() {
    for(let i = 0; i < this.animations.length; ++i)
        this.animationTime += this.animations[i].animationTime;
}

/**
 * Updates this.currAnimation and returns time elapsed since start of animation referenced by it
 */
MyComboAnimation.prototype.updateAnimationIndex = function(delta) {
    let start = 0;
    let end = 0;
    for(let i = 0; i < this.animations.length; ++i){
        end += this.animations[i].animationTime;
        if(delta >= start && delta <= end){
            this.currAnimation = i;
            break;
        }
        start = end;
    }

    return delta - start;
}

MyComboAnimation.prototype.matrixAfter = function(delta) {
    let animationDelta = this.updateAnimationIndex(delta);
    return this.animations[this.currAnimation].matrixAfter(animationDelta);
}
