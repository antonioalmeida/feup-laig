//From https://github.com/EvanHahn/ScriptInclude
include=function(){function f(){var a=this.readyState;(!a||/ded|te/.test(a))&&(c--,!c&&e&&d())}var a=arguments,b=document,c=a.length,d=a[c-1],e=d.call;e&&c--;for(var g,h=0;c>h;h++)g=b.createElement("script"),g.src=arguments[h],g.async=!0,g.onload=g.onerror=g.onreadystatechange=f,(b.head||b.getElementsByTagName("head")[0]).appendChild(g)};
serialInclude=function(a){var b=console,c=serialInclude.l;if(a.length>0)c.splice(0,0,a);else b.log("Done!");if(c.length>0){if(c[0].length>1){var d=c[0].splice(0,1);b.log("Loading "+d+"...");include(d,function(){serialInclude([]);});}else{var e=c[0][0];c.splice(0,1);e.call();};}else b.log("Finished.");};serialInclude.l=new Array();

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
    function(m,key,value) {
      vars[decodeURIComponent(key)] = decodeURIComponent(value);
    });
    return vars;
}

serialInclude(
['../lib/CGF.js',
'primitives/MyTriangle.js',
'primitives/MyPatch.js',
'primitives/MyQuad.js',
'primitives/MyCircle.js',
'primitives/MyCylinder.js',
'primitives/MySphere.js',
'primitives/MyCube.js',
'primitives/MyObj.js',
'XMLscene.js',
'MySceneGraph.js',
'MyGraphNode.js',
'MyGraphLeaf.js',
'MyInterface.js',
'MyClient.js',
'animations/MyAnimation.js',
'animations/MyCameraAnimation.js',
'animations/MyLinearAnimation.js',
'animations/MyCircularAnimation.js',
'animations/MyBezierAnimation.js',
'animations/MyComboAnimation.js',
'game/MyBoard.js',
'game/MyCheversi.js',
'game/MyPiece.js',
'game/MyKing.js',
'game/MyQueen.js',
'game/MyBishop.js',
'game/MyKnight.js',
'game/MyRook.js',
'game/MyTile.js',
'game/MyMarker.js',

main = function() {
	// Standard application, scene and interface setup
    var app = new CGFapplication(document.body);
    var myInterface = new MyInterface();
    var myScene = new XMLscene(myInterface);

    app.init();

    app.setScene(myScene);
    app.setInterface(myInterface);

    // Uncoment this to active mouse controlled camera
    //myInterface.setActiveCamera(myScene.camera);

	// Load scenarios
    myScene.loadGraphs(['demo','futuristic']);

	// start
    app.run();
}

]);
