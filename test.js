// standard global variables
var scene, camera, renderer;
 
// Character 3d object
var character = null;
var level = null;
 
// FUNCTIONS
function init() {
    // SCENE
    scene = new THREE.Scene();
 
    // CAMERA
    var SCREEN_WIDTH = window.innerWidth,
                SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45,
                ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
                NEAR = 0.1, FAR = 1000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT,
                                                 NEAR, FAR);
    scene.add(camera);
    camera.position.set(0,0,50);
    camera.lookAt(scene.position);
 
    // RENDERER
    renderer = new THREE.WebGLRenderer({
        antialias:true,
        alpha: true
    });
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.setClearColor(0x444444);
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
    scene.add(character);

    level = CreateLevel();
    scene.add(level);

    // Create light
    var light = new THREE.PointLight(0xffffff, 5.0);
    // We want it to be very close to our character
    light.position.set(-10,30,10);
    scene.add(light);
 
    // Start animation
    var clock = new THREE.Clock;

    var render = function () {
        requestAnimationFrame( render );

        // character.rotation.y = Math.sin(clock.getElapsedTime());
        // character.rotation.y = -0.5;
        AnimateTest(clock.getElapsedTime());

        RenderTextures();

        renderer.render(scene, camera);
    };

    render();
}