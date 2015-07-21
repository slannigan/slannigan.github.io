// FUNCTIONS
function init() {
    // CharacterDemo();
    // LevelDemo();
    var canvasContainer = document.getElementById("canvas-container");

    // SCENE
    var scene = new THREE.Scene();
    // scene.position.set(startX,0,0);

    var nodeManager = new NodeManager();
    var modelManager = new ModelManager(nodeManager, scene);
 
    // CAMERA
    var SCREEN_WIDTH = 850;
    var SCREEN_HEIGHT = 400;
    var VIEW_ANGLE = 45,
                ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
                NEAR = 0.1, FAR = 1000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT,
                                                 NEAR, FAR);
    scene.add(camera);
    // camera.position.set(startX,0,30);
    var sceneX = 21;
    var sceneY = -3;
    camera.position.set(sceneX, sceneY, 20);
    scene.position.set(sceneX, sceneY, 0);
    camera.lookAt(scene.position);
 
    // RENDERER
    renderer = new THREE.WebGLRenderer({
        antialias:true,
        alpha: true
    });
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.setClearColor(0xb5b2c5);
    canvasContainer.appendChild( renderer.domElement );

    // Create light
    var light = new THREE.PointLight(0xffffff, 1.0);
    // We want it to be very close to our character
    light.position.set(60,30,30);
    // light.position.set(100,10,-50);
    scene.add(light);
    var ambience = new THREE.AmbientLight(0x999999);
    scene.add(ambience);

    var game = new Logic(nodeManager, modelManager, scene, camera, light, character);
    modelManager.SetGame(game);
    var levelMap = "HHHHLLLLLLHHHH";
    var level = modelManager.CreateLevel(levelMap);
    var character = modelManager.CreateMeatBoy();

    clock = new THREE.Clock();
    clock.start();

    var characterBound = {
        minY: sceneY + game.characterHeight - 1,
        maxY: sceneY + game.characterHeight,
        minX: sceneX + 1.5 + game.characterWidth,
        maxX: sceneX + 1.5 + game.characterWidth
    }

    character.translate(sceneX + 0.5, sceneY - 6 + 0.5, 0);

    var transX = 1;
    var transY = 0.5;
    var deltaX = deltaY = 0;

    document.addEventListener('keydown', function(e) {
        // http://www.javascriptkit.com/javatutors/javascriptkey2.shtml
        var unicode = e.keyCode? e.keyCode : e.charCode;

        var index = Math.floor(characterBound.minX/game.unitSize);
        if (unicode == 39) {      // 'right' key
            deltaX += transX;
            for (var j = -1; j < 2; j++) {
                for (var i = 0; i < game.boundingGeometries[j+index].length; i++) {
                    var geometry = game.boundingGeometries[j+index][i];
                    if (geometry.intersectsX(characterBound.minX,
                        characterBound.maxX + deltaX,
                        characterBound.minY,
                        characterBound.maxY)) {

                        deltaX = 0;
                    }
                }
            }
        }
        else if (unicode == 37) {      // 'left' key
            deltaX -= transX;
            // camera.position.x -= 1;
            for (var j = -1; j < 2; j++) {
                for (var i = 0; i < game.boundingGeometries[j+index].length; i++) {
                    var geometry = game.boundingGeometries[j+index][i];
                    if (geometry.intersectsX(characterBound.minX + deltaX,
                        characterBound.maxX,
                        characterBound.minY,
                        characterBound.maxY)) {

                        deltaX = 0;
                    }
                }
            }
        }
        else if (unicode == 38) {      // 'up' key
            deltaY += transY;
            // camera.position.y += 1;
            for (var j = -1; j < 2; j++) {
                for (var i = 0; i < game.boundingGeometries[j+index].length; i++) {
                    var geometry = game.boundingGeometries[j+index][i];
                    if (geometry.intersectsY(characterBound.minX,
                        characterBound.maxX,
                        characterBound.minY,
                        characterBound.maxY + deltaY)) {

                        deltaY = 0;
                    }
                }
            }
        }
        else if (unicode == 40) {      // 'down' key
            deltaY -= transY;
            // camera.position.y -= 1;
            console.log("\nmeatBoy minY: " + characterBound.minY + ", maxY: " + characterBound.maxY);
            for (var j = -1; j < 2; j++) {
                for (var i = 0; i < game.boundingGeometries[j+index].length; i++) {
                    var geometry = game.boundingGeometries[j+index][i];
                    console.log("minY: " + geometry.minY + ", maxY: " + geometry.maxY);
                    if (geometry.intersectsY(characterBound.minX,
                        characterBound.maxX,
                        characterBound.minY + deltaY,
                        characterBound.maxY)) {

                        deltaY = 0;
                    }
                }
            }
        }

        if (deltaX !== 0 || deltaY !== 0) {
            character.translate(deltaX, deltaY, 0);
            characterBound.minX += deltaX;
            characterBound.maxX += deltaX;
            characterBound.minY += deltaY;
            characterBound.maxY += deltaY;
            deltaX = 0;
            deltaY = 0;
        }
    });

    render = function() {
        requestAnimationFrame( render );

        renderer.render(scene, camera);
    }

    render();
}