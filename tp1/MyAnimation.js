function MyAnimation(id, velocity) {
    if (this.constructor === MyAnimation)
        throw new Error("Can't instantiate abstract class!");

    this.id = id;
    this.velocity = velocity;
}

MyAnimation.prototype.constructor = MyAnimation;
