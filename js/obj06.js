function CharacterDemo(textureManager) {
    var canvasContainer = document.getElementById("canvas-container-character");

    // SCENE
    var scene = new THREE.Scene();
    // scene.position.set(startX,0,0);

    var nodeManager = new NodeManager(textureManager);
    var modelManager = new ModelManager(nodeManager, scene);
    var character = modelManager.CreateMeatBoy();
 
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
    var sceneX = 0;
    var sceneY = 7;
    camera.position.set(sceneX, sceneY, 10);
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

    clock = new THREE.Clock();
    clock.start();

    render = function() {
        requestAnimationFrame( render );

        character.rotate(0,0.1,0);

        renderer.render(scene, camera);
    }

    render();
}

function LevelDemo(textureManager) {
    var canvasContainer = document.getElementById("canvas-container-level");

    // SCENE
    var scene = new THREE.Scene();

    var nodeManager = new NodeManager(textureManager);
    var modelManager = new ModelManager(nodeManager, scene);
    var levelMap = "sss...h.m.l...H.M.L...MMcMCMcM...eee";
    var level = modelManager.CreateLevel(levelMap);
 
    // CAMERA
    var SCREEN_WIDTH = 850;
    var SCREEN_HEIGHT = 400;
    var VIEW_ANGLE = 45,
                ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
                NEAR = 0.1, FAR = 1000;
    var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT,
                                                 NEAR, FAR);
    scene.add(camera);
    var sceneX = 50;
    var sceneY = 3;
    camera.position.set(sceneX, sceneY, 100);
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

    clock = new THREE.Clock();
    clock.start();

    render = function() {
        requestAnimationFrame( render );

        renderer.render(scene, camera);
    }

    render();
}
 
// FUNCTIONS
function init() {
    var textureManager = new TextureManager();
    CharacterDemo(textureManager);
    LevelDemo(textureManager);
}