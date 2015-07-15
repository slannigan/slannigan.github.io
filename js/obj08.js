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
    camera.position.set(0,0,10);
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
    light.position.set(60,30,30);
    scene.add(light);
    var ambience = new THREE.AmbientLight(0x999999);
    scene.add(ambience);

    var billboardManager = new BillboardManager(nodeManager, camera);
    var location = new THREE.Vector3();
    // (width, height, location, image)
    var billboards = [];

    // var billboard = billboardManager.CreateBillboard(1, 1, location, 'brick');
    var num = 5;

    for (var i = -(num/2); i < num/2; i++) {
        for (var j = -(num/2); j < (num/2); j++) {
            location.set(i,j,0);
            var billboard = billboardManager.CreateBillboard(1,1,location,'brick');
            scene.add(billboard.texture.obj);
            billboards.push(billboard);
        }
    }

    scene.add(billboard.texture.obj);

    clock = new THREE.Clock();
    clock.start();

    render = function() {
        requestAnimationFrame( render );

        var time = clock.getElapsedTime();

        textureManager.VerifyTexturesOn();
        // billboard.update(0,0,0,1);
        _.each(billboards, function(billboard) {
            billboard.update(0,0,0,1);
        })

        renderer.render(scene, camera);
    }

    render();

    document.addEventListener('keydown', function(e) {
        // http://www.javascriptkit.com/javatutors/javascriptkey2.shtml
        var unicode = e.keyCode? e.keyCode : e.charCode;

        if (unicode == 39) {      // 'right' key
            camera.position.x += 1;
        }
        else if (unicode == 37) {      // 'left' key
            camera.position.x -= 1;
        }
        else if (unicode == 38) {      // 'up' key
            camera.position.y += 1;
        }
        else if (unicode == 40) {      // 'down' key
            camera.position.y -= 1;
        }
    });
}