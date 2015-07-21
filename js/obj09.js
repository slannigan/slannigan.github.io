// FUNCTIONS
function init() {
    // CharacterDemo();
    // LevelDemo();
    var canvasContainer = document.getElementById("canvas-container");

    // SCENE
    var scene = new THREE.Scene();
    // scene.position.set(startX,0,0);

    var textureManager = new TextureManager();
    var nodeManager = new NodeManager(textureManager);
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

    var character = modelManager.CreateMeatBoy();
    var game = new Logic(nodeManager, modelManager, scene, camera, light, character);
    game.setScene();
    modelManager.SetGame(game);
    var levelMap = "ssssss..mmmm..eeeeeeeH";
    var level = modelManager.CreateLevel(levelMap);

    clock = new THREE.Clock();
    clock.start();

    render = function() {
        requestAnimationFrame( render );

        var time = clock.getElapsedTime();
        textureManager.VerifyTexturesOn();
        game.animateCharacter(time);
        game.moveScene(time);

        renderer.render(scene, camera);
    }

    render();
}