// standard global variables
var scene, camera, renderer, game;
var canvasContainer;
 
// Character 3d object
var character = null;
var level = null;

var clock;
 
// FUNCTIONS
function init() {
    canvasContainer = document.getElementById("canvas-container");

    game = new Logic();

    // SCENE
    scene = new THREE.Scene();
    // scene.position.set(startX,0,0);
 
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
    renderer.setClearColor(0x444444);
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

    // var startPoint = new THREE.Vector3(0,0,0);
    // var directionVector = new THREE.Vector3(0,0.3,0);
    // var testParticles = createBloodSplatter(startPoint, directionVector, 0);
    // scene.add(testParticles.obj);

    // Create light
    var light = new THREE.PointLight(0xffffff, 5.0);
    // We want it to be very close to our character
    light.position.set(-10,30,10);
    scene.add(light);
 
    // Start animation
    clock = new THREE.Clock;
    var time;

    var render = function () {
        requestAnimationFrame( render );

        time = clock.getElapsedTime();

        // character.rotation.y = Math.sin(clock.getElapsedTime());
        // character.rotation.y = -0.5;
        AnimateTest(time);

        game.moveScene(scene, camera, time);
        game.animateCharacter(character, time);

        RenderTextures();
        RenderParticles(time);

        renderer.render(scene, camera);
    };

    render();
}