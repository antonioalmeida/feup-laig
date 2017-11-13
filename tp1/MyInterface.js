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

/**
 * Adds a list that will hold the IDs of the selectable nodes
 */
MyInterface.prototype.addSelectableListBox = function(nodes) {
    let nodesObj = {'none': null};
    for(let i = 0; i < nodes.length; ++i)
        nodesObj[nodes[i]] = nodes[i];

    this.gui.add(this.scene, 'selectedNode', nodesObj).name('Selected Node');
}

/**
 * Adds selection color parametrization sliders
 */
MyInterface.prototype.addSelectionColorParametrization = function() {
    var group = this.gui.addFolder("Selection Color");
    group.open();

    var obj = this;
    group.add(this.scene, 'selectionColorR', 0, 1).name('R').onChange(function(v){obj.scene.updateSelectionColor();});
    group.add(this.scene, 'selectionColorG', 0, 1).name('G').onChange(function(v){obj.scene.updateSelectionColor();});
    group.add(this.scene, 'selectionColorB', 0, 1).name('B').onChange(function(v){obj.scene.updateSelectionColor();});
}
