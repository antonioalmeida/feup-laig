function MyAnimation(id) {
    if (this.constructor === MyAnimation)
        throw new Error("Can't instantiate abstract class!");

    this.id = id;
    this.currentMatrix = mat4.create();
}

MyAnimation.prototype.constructor = MyAnimation;

MyAnimation.prototype.update = function(currTime) {
  throw new Error("Can't instantiate abstract method"); //If fucks up, comment
}

MyAnimation.prototype.apply = function() {
  throw new Error("Can't instantiate abstract method"); //If fucks up, comment
}
