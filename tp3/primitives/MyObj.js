/**
 * MyObj
 * @constructor
 * @param scene - the scene where the sphere will be drawn on
 * @param {array} args - array containing the arguments of the sphere - [ radius , stacks, slices ]
 */
function MyObj(scene, args) {
  CGFobject.call(this,scene);
  console.log('OBJ: ' + args);

  this.fileName = args;

  this.initBuffers();

  // Loading obj file
  let xhttp = new XMLHttpRequest();
  xhttp.open("GET", this.fileName, false);
  xhttp.send();
  let buffer = this.loadObj(xhttp.responseText);

  for(let i = 0; i < buffer.length; i += 6) {
    this.vertices.push(buffer[i], buffer[i+1], buffer[i+2]);
    this.normals.push(buffer[i+3], buffer[i+4], buffer[i+5]);
  }
  for(let i = 0; i < this.vertices.length/3; i += 3)
    this.indices.push(i, i+1, i+2);

  this.primitiveType = this.scene.gl.TRIANGLES;
  this.initGLBuffers();
};

MyObj.prototype = Object.create(CGFobject.prototype);
MyObj.prototype.constructor = MyObj;

MyObj.prototype.initBuffers = function() {
	this.vertices = [];
  this.normals = [];
  this.texCoords = [];
  this.indices = [];
};

MyObj.prototype.updateTexCoords = function(afS, afT) { }

MyObj.prototype.loadObj = function (file) {
   var lines = file.split("\n");
   var positions = [];
   var normals = [];
   var vertices = [];

   for ( var i = 0 ; i < lines.length ; i++ ) {
     var parts = lines[i].trimRight().split(' ');
     if ( parts.length > 0 ) {
       switch(parts[0]) {
         case 'v':  positions.push(
           vec3.fromValues(
             parseFloat(parts[1]),
             parseFloat(parts[2]),
             parseFloat(parts[3])
           ));
           break;
         case 'vn':
           normals.push(
             vec3.fromValues(
               parseFloat(parts[1]),
               parseFloat(parts[2]),
               parseFloat(parts[3])
           ));
           break;
         case 'f': {
           var f1 = parts[1].split('/');
           var f2 = parts[2].split('/');
           var f3 = parts[3].split('/');
           Array.prototype.push.apply(
             vertices, positions[parseInt(f1[0]) - 1]
           );
           Array.prototype.push.apply(
             vertices, normals[parseInt(f1[2]) - 1]
           );
           Array.prototype.push.apply(
             vertices, positions[parseInt(f2[0]) - 1]
           );
           Array.prototype.push.apply(
             vertices, normals[parseInt(f2[2]) - 1]
           );
           Array.prototype.push.apply(
             vertices, positions[parseInt(f3[0]) - 1]
           );
           Array.prototype.push.apply(
             vertices, normals[parseInt(f3[2]) - 1]
           );
           break;
         }
       }
     }
   }
   var vertexCount = vertices.length / 6;
   return vertices;
}
