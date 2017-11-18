function MyAnimation(id) {
    if (this.constructor === MyAnimation){
        throw new Error("Can't instantiate abstract class!");
    }

    this.id = id;
    this.animationTime = 0;
}

MyAnimation.prototype.constructor = MyAnimation;
