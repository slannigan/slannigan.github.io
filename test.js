// standard global variables
var scene, camera, renderer, game;
var canvasContainer;

var clock;
 
// FUNCTIONS
function init() {
    canvasContainer = document.getElementById("canvas-container");

    // SCENE
    scene = new THREE.Scene();
    // scene.position.set(startX,0,0);

    var textureManager = new TextureManager();
    var nodeManager = new NodeManager(textureManager);
    var modelManager = new ModelManager(nodeManager);
 
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
    // camera.position.set(0,0,30);
    // camera.lookAt(scene.position);
 
    // RENDERER
    renderer = new THREE.WebGLRenderer({
        antialias:true,
        alpha: true
    });
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.setClearColor(0xb5b2c5);
    canvasContainer.appendChild( renderer.domElement );

    // canvasContainer.appendChild( renderer.domElement );
 
    // Main polygon
    // character = TextureMapper(2, 1, 'meatboy.png', true, 0.5, 0.5);
    // if (_.isNull(character)) {
    //     return;
    // }
    // // textures.push(character)
    // scene.add(character);

    // particleManager = new ParticleManager();
    // scene.add(particleManager.container.obj);

    // var startPoint = new THREE.Vector3(15,0,0);
    // var directionVector = new THREE.Vector3(0,0.3,0);
    // game.particleManager.createBloodSplatter(startPoint, directionVector, 0);

    // Create light
    var light = new THREE.PointLight(0xffffff, 1.0);
    // We want it to be very close to our character
    light.position.set(60,30,30);
    // light.position.set(100,10,-50);
    scene.add(light);
    var ambience = new THREE.AmbientLight(0x999999);
    scene.add(ambience);


    var character = modelManager.CreateMeatBoy();
    scene.add(character.obj);

    game = new Logic(nodeManager, modelManager, scene, camera, light, character);
    game.setScene();
    // scene.add(this.particleManager.container.obj);
    scene.add(game.particleManager.container.obj);

    var level = modelManager.CreateLevel();
    scene.add(level.obj);


    var gameInterface = new Interface(canvasContainer, renderer, textureManager, modelManager, game, scene, camera, light, character);
}