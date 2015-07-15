var Interface = function(canvasContainer, renderer, textureManager, nodeManager, scene, camera, light) {
	this.canvasContainer = canvasContainer;
	this.renderer = renderer;
	this.textureManager = textureManager;
	this.nodeManager = nodeManager;
	this.scene = scene;
	this.camera = camera;
	this.light = light;

	// var modelManager = new ModelManager(nodeManager, scene);
	this.character;
	this.game;
	this.level;
	this.modelManager;

	this.clock;

	this.paused = false;
	this.started = false;
	this.restartTime = 500;

	var self = this;

	document.addEventListener('keydown', function(e) {
	    // http://www.javascriptkit.com/javatutors/javascriptkey2.shtml
	    var unicode = e.keyCode? e.keyCode : e.charCode;

	    if (unicode == 80) { 	  // 'p' key
	    	self.TogglePaused();
	    }
	    else if (unicode == 82) {
	    	self.RestartGame();
	    }

	    if (!self.started) {
	    	self.started = true;
	    	self.StartPlay();
	    }
	});

	this.render = function() {
		if (!self.paused) requestAnimationFrame( self.render );

        var time = self.clock.getElapsedTime();

        self.textureManager.VerifyTexturesOn();

        // character.rotation.y = Math.sin(clock.getElapsedTime());
        // character.rotation.y = -0.5;
        self.modelManager.AnimateTest(time);

        self.game.moveScene(time);
        self.game.animateCharacter(time);
        self.game.renderParticles(time);

        self.renderer.render(self.scene, self.camera);
	}

	this.startMenu = document.getElementById("start-menu");
	this.pauseMenu = document.getElementById("pause-menu");
	this.blackScreen = document.getElementById("black");

	this.ShowElement(this.startMenu);
}

_.extend(Interface.prototype, {
	ShowElement: function(node) {
		node.className = "";
	},

	HideElement: function(node) {
		node.className = "hidden";
	},

	TogglePaused: function() {
		this.paused = !this.paused;

		if (this.paused) {
			this.clock.stop();
			this.ShowElement(this.pauseMenu);
		}
		else {
			this.clock.start();
			this.HideElement(this.pauseMenu);
			this.render();
		}

		this.game.togglePaused(this.paused);
	},

	StartPlay: function() {
		this.clock = new THREE.Clock();
		this.HideElement(this.startMenu);

		this.modelManager = new ModelManager(this.nodeManager, this.scene);
		this.character = this.modelManager.CreateMeatBoy();
		this.game = new Logic(this.nodeManager, this.modelManager, this.scene, this.camera, this.light, this.character);
		this.modelManager.SetGame(this.game);

	    this.game.setScene();
	    this.scene.add(this.game.particleManager.container.obj);

	    this.level = this.modelManager.CreateLevel();

	    var self = this;
	    var restartFunction = function() {
			self.RestartGame();
		}
		this.game.addRestartFunction(restartFunction);

		this.render();
	},

	RestartGame: function() {
		console.log("Restart");
		var self = this;

		this.blackScreen.className = "fadeOutInOut";
		setTimeout(function() {
			self.blackScreen.className = "";
		}, this.restartTime);

		setTimeout(function() {
			self.clock = new THREE.Clock();
			self.game.restart();
		}, this.restartTime/2);
	}
});