function MyAnimation(id) {
    if (this.constructor === MyAnimation)
        throw new Error("Can't instantiate abstract class!");

    this.id = id;
    this.currentMatrix = mat4.create();
}

MyAnimation.prototype.constructor = MyAnimation;

MyAnimation.prototype.update = function(currTime) {
}

MyAnimation.prototype.apply = function() {
}
