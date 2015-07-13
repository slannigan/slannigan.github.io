// standard global variables
var scene, camera, renderer, game;
var canvasContainer;
 
// Character 3d object
var character = null;
var level = null;
var particles = null;
var textureManager = null;
var nodeManager = null;

var clock;
 
// FUNCTIONS
function init() {
    canvasContainer = document.getElementById("canvas-container");

    // SCENE
    scene = new THREE.Scene();
    // scene.position.set(startX,0,0);

    textureManager = new TextureManager();
    nodeManager = new NodeManager(textureManager);
    // nodeManager = new NodeManager();
    game = new Logic(nodeManager);
    // scene.add(this.particleManager.container.obj);
    scene.add(game.particleManager.container.obj);
 
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
    game.setScene(scene, camera);
 
    // RENDERER
    renderer = new THREE.WebGLRenderer({
        antialias:true,
        alpha: true
    });
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.setClearColor(0xb5b2c5);
    canvasContainer.appendChild( renderer.domElement );

    var container = document.body;
    container.appendChild( renderer.domElement );
 
    // Main polygon
    // character = TextureMapper(2, 1, 'meatboy.png', true, 0.5, 0.5);
    // if (_.isNull(character)) {
    //     return;
    // }
    // // textures.push(character)
    // scene.add(character);

    character = CreateMeatBoy();
    scene.add(character.obj);

    level = CreateLevel();
    scene.add(level.obj);

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
 
    // Start animation
    clock = new THREE.Clock;
    var time;

    var render = function () {
        requestAnimationFrame( render );

        time = clock.getElapsedTime();

        textureManager.VerifyTexturesOn();

        // character.rotation.y = Math.sin(clock.getElapsedTime());
        // character.rotation.y = -0.5;
        AnimateTest(time);

        game.moveScene(scene, camera, light, time);
        game.animateCharacter(character, time);
        game.renderParticles(time);

        renderer.render(scene, camera);
    };

    render();
}