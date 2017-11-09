function MyAnimation(id) {
    if (this.constructor === MyAnimation){
        throw new Error("Can't instantiate abstract class!");
    }

    this.id = id;
    this.startTime = -1;
    this.delta = 0;
    this.currentMatrix = mat4.create();
    this.animationTime = 0;
    this.active = false;
}

MyAnimation.prototype.constructor = MyAnimation;

MyAnimation.prototype.update = function(currTime) {
    if(this.startTime == -1)
        this.startTime = currTime;
    else
        this.delta = (currTime - this.startTime)/1000;
}
