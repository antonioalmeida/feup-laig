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

    this.removeFolder('Lights'); //Delete previous scenario's lights
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

/**
 * Removes a folder from the GUI, if it exists
 * Necessary when switching scenarios so Lights folder can be recreated
 * Taken from https://stackoverflow.com/questions/18085540/remove-folder-in-dat-gui
 */
MyInterface.prototype.removeFolder = function(name) {
    var folder = this.gui.__folders[name];
    if (!folder) {
        return;
    }
    folder.close();
    this.gui.__ul.removeChild(folder.domElement.parentNode);
    delete this.gui.__folders[name];
    this.gui.onResize();
}

MyInterface.prototype.addGameButtons = function(filenames) {
    let customizationGroup = this.gui.addFolder('Game Customization');
    customizationGroup.open();

    customizationGroup.add(this.scene, 'realisticPieces').name('Realistic Pieces');
    customizationGroup.add(this.scene, 'highlightTiles').name('Highlight Tiles');
    var self = this;
    let obj = {};
    for(let id in filenames)
        obj[filenames[id]] = id;
    customizationGroup.add(this.scene, 'graphIndex', obj).name('Scenario').onChange(function(v){self.scene.onGraphLoaded();});

    let optionsGroup = this.gui.addFolder("Game Properties");
    optionsGroup.open();

    optionsGroup.add(this.scene, 'turnTime', 30, 300).name('Turn Timeout');
    optionsGroup.add(this.scene, 'gameMode',{'Single Player': 0, 'Multiplayer': 1, 'AI vs AI': 2}).name('Game Mode');
    optionsGroup.add(this.scene, 'difficulty',{'Easy': 0, 'Medium': 1}).name('Difficulty');
    optionsGroup.add(this.scene, 'player',{'White': 0, 'Black': 1}).name('Player');

    let gameActionsGroup = this.gui.addFolder('Game Actions');
    gameActionsGroup.open();

    gameActionsGroup.add(this.scene, 'startGame').name('Start Game');
    gameActionsGroup.add(this.scene, 'undoMove').name('Undo Move');
    gameActionsGroup.add(this.scene, 'watchMovie').name('Watch Movie');
}
