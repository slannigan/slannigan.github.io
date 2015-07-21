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
    var character = modelManager.CreateMeatBoy();
    var levelMap = "sss..h.m.l..H.M.L..MMcMCMcM..eee";
    var level = modelManager.CreateLevel(levelMap);
    character.translate(45,15,100);
 
    // CAMERA
    var SCREEN_WIDTH = 850;
    var SCREEN_HEIGHT = 800;
    var VIEW_ANGLE = 45,
                ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
                NEAR = 0.1, FAR = 1000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT,
                                                 NEAR, FAR);
    scene.add(camera);
    // camera.position.set(startX,0,30);
    var sceneX = 45;
    var sceneY = 20;
    camera.position.set(sceneX, sceneY, 110);
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
    light.position.set(60,30,130);
    // light.position.set(100,10,-50);
    scene.add(light);
    var ambience = new THREE.AmbientLight(0x999999);
    scene.add(ambience);

    clock = new THREE.Clock();
    clock.start();

    render = function() {
        requestAnimationFrame( render );

        var time = clock.getElapsedTime();

        // character.translate(0, deltaY, 0);
        character.rotate(0,0.01,0);

        renderer.render(scene, camera);
    }

    render();
}