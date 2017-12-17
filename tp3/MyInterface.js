 /**
 * MyInterface class, creating a GUI interface.
 * @constructor
 */
function MyInterface() {
    //call CGFinterface constructor
    CGFinterface.call(this);
}
;

MyInterface.prototype = Object.create(CGFinterface.prototype);
MyInterface.prototype.constructor = MyInterface;

/**
 * Initializes the interface.
 * @param {CGFapplication} application
 */
MyInterface.prototype.init = function(application) {
    // call CGFinterface init
    CGFinterface.prototype.init.call(this, application);

    // init GUI. For more information on the methods, check:
    //  http://workshop.chromeexperiments.com/examples/gui

    this.gui = new dat.GUI();

    // add a group of controls (and open/expand by defult)

    return true;
};

/**
 * Adds a folder containing the IDs of the lights passed as parameter.
 */
MyInterface.prototype.addLightsGroup = function(lights) {

    var group = this.gui.addFolder("Lights");
    group.open();

    // add two check boxes to the group. The identifiers must be members variables of the scene initialized in scene.init as boolean
    // e.g. this.option1=true; this.option2=false;

    for (var key in lights) {
        if (lights.hasOwnProperty(key)) {
            this.scene.lightValues[key] = lights[key][0];
            group.add(this.scene.lightValues, key);
        }
    }
}

MyInterface.prototype.addGameButtons = function(scene) {
    let customizationGroup = this.gui.addFolder("Game customization");
    customizationGroup.open();

    customizationGroup.add(scene, 'realisticPieces').name('Realistic Pieces');

    let optionsGroup = this.gui.addFolder("Game Properties");
    optionsGroup.open();

    optionsGroup.add(scene, 'turnTime', 30, 300).name('Turn Timeout');
    optionsGroup.add(scene, 'gameMode',{'Single Player': 0, 'Multiplayer': 1, 'AI vs AI': 2}).name('Game Mode');
    optionsGroup.add(scene, 'difficulty',{'Easy': 0, 'Medium': 1}).name('Difficulty');
    optionsGroup.add(scene, 'player',{'White': 0, 'Black': 1}).name('Player');
    optionsGroup.add(scene, 'startGame').name('Start Game');

}
