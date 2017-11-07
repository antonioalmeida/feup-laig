function MyComboAnimation(id, animations) {
    MyAnimation.call(this, id);

    this.animations = animations;
}

MyComboAnimation.prototype = Object.create(MyAnimation.prototype);
MyComboAnimation.prototype.constructor = MyComboAnimation;
