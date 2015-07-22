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
    scene.add(light);
    var ambience = new THREE.AmbientLight(0x999999);
    scene.add(ambience);

    var map = "sssssssss..llllllllcllllll";
    map += "...eeeeeeeeeeeeeeeeH"

    var gameInterface = new Interface(canvasContainer, renderer, textureManager, nodeManager, scene, camera, light, map);
}