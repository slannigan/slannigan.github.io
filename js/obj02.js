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

    var nodeManager = new NodeManager();
    var modelManager = new ModelManager(nodeManager, scene);
    var animationManager = new AnimationManager();
    var character = modelManager.CreateMeatBoy(animationManager);
 
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
    var sceneX = 2;
    var sceneY = 5;
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

    // TEMP LOGIC
    var gravity = -1.5;
    var jumpSpeed = 0.125;
    var jumpSpeedDeceleration = -jumpSpeed*4;
    var lastTimeOnGround = 0;
    var initialVelocity = 0;
    var ground = -6;
    var characterY = 0;

    var isFalling = false;
    var isJumping = false;

    clock = new THREE.Clock();
    clock.start();

    var spacePressed = false;
    var spacePressedTime;

    animationManager.Run(0);
    animationManager.Animate(0);

    document.addEventListener('keydown', function(e) {
        // http://www.javascriptkit.com/javatutors/javascriptkey2.shtml
        var unicode = e.keyCode? e.keyCode : e.charCode;

        if (unicode == 32) {      // space key
            spacePressed = true;
            spacePressedTime = clock.getElapsedTime();
        }
    });

    document.addEventListener('keyup', function(e) {
        // http://www.javascriptkit.com/javatutors/javascriptkey2.shtml
        var unicode = e.keyCode? e.keyCode : e.charCode;

        if (unicode == 32) {      // space key
            spacePressed = false;
        }
    });

    // character.translate(0, -2, 0);
    render = function() {
        requestAnimationFrame( render );

        var time = clock.getElapsedTime();

        var deltaTime = time - lastTimeOnGround;
        var gravitySpeed = gravity * deltaTime;
        var upSpeed = jumpSpeed + (jumpSpeedDeceleration * deltaTime);

        if (spacePressed && upSpeed > 0 && !isFalling) {
            initialVelocity += upSpeed;
        }
        
        var deltaY = gravitySpeed + initialVelocity;

        // if intersects
        if (characterY + deltaY < ground) {
            if (time - lastTimeOnGround > 0.05 &&
                characterY + deltaY <= ground) {

                deltaY = ground - characterY;
            }
            else {
                deltaY = 0;
            }

            intersectsY = true;
            lastTimeOnGround = time;
            initialVelocity = 0;
        }

        if (!isJumping && deltaY > 0) {
            isJumping = true;
            animationManager.Jump(time);
        }
        else if (!isFalling && isJumping && deltaY <= 0) {
            isJumping = false;
            isFalling = true;
            animationManager.Fall(time);
        }
        else if (isFalling && !isJumping && deltaY == 0) {
            isFalling = false;
            animationManager.Run(time);
        }

        characterY += deltaY;
        character.translate(0, deltaY, 0);

        animationManager.Animate(time);

        renderer.render(scene, camera);
    }

    render();
}