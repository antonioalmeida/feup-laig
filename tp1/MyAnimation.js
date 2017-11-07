function MyAnimation(id) {
    if (this.constructor === MyAnimation)
        throw new Error("Can't instantiate abstract class!");

    this.id = id;
}

MyAnimation.prototype.constructor = MyAnimation;
