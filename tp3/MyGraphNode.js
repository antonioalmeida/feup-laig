/**
 * MyGraphNode class, representing an intermediate node in the scene graph.
 * @constructor
 * @param graph - graph the node belongs to
 * @param {int} nodeID - numeric value representing the node's ID
**/
function MyGraphNode(graph, nodeID) {
    this.graph = graph;

    this.nodeID = nodeID;

    // IDs of child nodes.
    this.children = [];

    // IDs of child nodes.
    this.leaves = [];

    // The material ID.
    this.materialID = null ;

    // The node numeric ID
    this.numericID = null;

    // The texture ID.
    this.textureID = null ;

    // The node's animations
    this.animations = [];

    // Animation stuff
    this.currentAnimation = -1;
    this.currentAnimationDelta = 0;
    this.animationMatrix = mat4.create();

    // Is this node selected? (initially false, if node marked as selectable attribute is updated in scene.display according to GUI input)
    this.selected = false;

    this.transformMatrix = mat4.create();

}

/**
 * Adds the reference (ID) of another node to this node's children array.
 */
MyGraphNode.prototype.addChild = function(nodeID) {
    this.children.push(nodeID);
}

/**
 * Adds a leaf to this node's leaves array.
 */
MyGraphNode.prototype.addLeaf = function(leaf) {
    this.leaves.push(leaf);
}

/**
 * Displays this node and its leaves and children recursively
 */
MyGraphNode.prototype.display = function(textureID, materialID) {
        this.updateAnimationMatrix();
        this.graph.scene.pushMatrix();
        this.graph.scene.multMatrix(this.transformMatrix);
        this.graph.scene.multMatrix(this.animationMatrix);

        var materialToPassOn = materialID;
        var textureToPassOn = textureID;
        if(this.materialID != "null" && this.materialID != null) {
          this.graph.materials[this.materialID].apply();
          materialToPassOn = this.materialID;
        }
        else
          this.graph.materials[materialID].apply();

        if(this.textureID == "clear") {
          if(textureID != null && textureID != "null")
            this.graph.textures[textureID][0].unbind();
          textureToPassOn = "null";
        }
        else if(this.textureID != null && this.textureID != "null") {
          this.graph.textures[this.textureID][0].bind();
          textureToPassOn = this.textureID;
        }
        else{
          if(textureID != null && textureID != "null")
            this.graph.textures[textureID][0].bind();
        }

        if(this.selected === true)
            this.graph.scene.setSelectableShader();

        this.displayLeaves(textureToPassOn);

        this.displayChildren(textureToPassOn, materialToPassOn);

        if(this.selected === true)
            this.graph.scene.setDefaultShader();

    this.graph.scene.popMatrix();
}

/**
 * Updates the animationMatrix to be applied to the node (and descendants)
 */
MyGraphNode.prototype.updateAnimationMatrix = function() {
    this.updateAnimationIndex();
    if(this.currentAnimation != -1)
        this.animationMatrix = this.graph.animations[this.animations[this.currentAnimation]].matrixAfter(this.currentAnimationDelta);
}

/**
 * Updates the current animation index according to total elapsed time since scene startup
 */
MyGraphNode.prototype.updateAnimationIndex = function() {
    if(this.currentAnimation != -1) {
        let start = 0;
        let end = 0;
        let elapsed = this.graph.scene.delta;
        for(let i = 0; i < this.animations.length; ++i){
            end += this.graph.animations[this.animations[i]].animationTime;
            if(elapsed >= start && elapsed < end){
                this.currentAnimation = i;
                break;
            }
            start = end;
        }

        if(elapsed > end) {
            this.currentAnimation = -1;
            this.currentAnimationDelta = 0;
            //Set matrix as last instant of last animation so object doesn't jump back suddenly to starting point
            //By doing it here, it avoids doing it every time (unecessarily) further on
            let lastAnimationID = this.animations[this.animations.length-1];
            let lastAnimationObj = this.graph.animations[lastAnimationID];
            this.animationMatrix = lastAnimationObj.matrixAfter(lastAnimationObj.animationTime);
        }
        else
            this.currentAnimationDelta = elapsed - start;
    }
}

/**
 * Displays this node's leaves
 */
MyGraphNode.prototype.displayLeaves = function(texture) {
    for(let leaveID in this.leaves) {
        if(texture != null && texture != "null") {
            let afS = this.graph.textures[texture][1];
            let afT = this.graph.textures[texture][2];
            this.leaves[leaveID].primitive.updateTexCoords(afS, afT);
        }
        this.leaves[leaveID].display();
    }
}

/**
 * Displays this nodes's children
 */
MyGraphNode.prototype.displayChildren = function(texture, material) {
    for(let childrenID in this.children)
        this.graph.nodes[this.children[childrenID]].display(texture, material);
}
