var Interface = function(canvasContainer, renderer, textureManager, nodeManager, scene, camera, light, map) {
	this.canvasContainer = canvasContainer;
	this.renderer = renderer;
	this.textureManager = textureManager;
	this.nodeManager = nodeManager;
	this.animationManager = new AnimationManager();
	this.scene = scene;
	this.camera = camera;
	this.light = light;
	this.map = map;

	// var modelManager = new ModelManager(nodeManager, scene);
	this.character;
	this.game;
	this.level;
	this.modelManager;

	this.clock;

	this.paused = false;
	this.started = false;
	this.restartTime = 500;

	this.gameEnded = false;

	var self = this;

	document.addEventListener('keydown', function(e) {
	    // http://www.javascriptkit.com/javatutors/javascriptkey2.shtml
	    var unicode = e.keyCode? e.keyCode : e.charCode;

	    if (unicode == 80) { 	  // 'p' key
	    	if (!self.gameEnded) {
	    		self.TogglePaused();
	    	}
	    }
	    else if (unicode == 82) { // 'r' key
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

        self.modelManager.AnimateChainsaws(time);
        self.animationManager.Animate(time);

        self.game.moveScene(time);
        self.game.animateCharacter(time);
        self.game.renderParticles(time);

        self.UpdateTime(time);

        self.renderer.render(self.scene, self.camera);
	}

	this.startMenu = document.getElementById("start-menu");
	this.pauseMenu = document.getElementById("pause-menu");
	this.blackScreen = document.getElementById("black");
	this.winScreen = document.getElementById("win");
	this.winText = document.getElementById("win-text");
	this.hud = document.getElementById("hud");
	this.scoreText = document.getElementById("score-text");

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
		this.ShowElement(this.hud);

		this.modelManager = new ModelManager(this.nodeManager, this.scene);
		this.character = this.modelManager.CreateMeatBoy(this.animationManager);
		this.game = new Logic(this.nodeManager, this.modelManager, this.scene, this.camera, this.light, this.character, this.animationManager);
		this.modelManager.SetGame(this.game);

	    this.game.setScene();
	    this.scene.add(this.game.particleManager.container.obj);

	    this.level = this.modelManager.CreateLevel(this.map);

	    var self = this;
	    var restartFunction = function() {
			self.RestartGame();
		}
		this.game.addRestartFunction(restartFunction);
		var endGameFunction = function() {
			self.EndGame();
		}
		this.game.addEndGameFunction(endGameFunction);

		this.animationManager.Run(0);
	    this.animationManager.Animate(0);

		this.render();
	},

	UpdateTime: function(time) {
		if (!this.gameEnded) {
			var s = Math.floor(time);
			var ms = Math.floor((time-s)*100);
			if (ms < 10) {
				ms = "0" + ms;
			}
			this.scoreText.innerHTML = s + ":" + ms;
		}
	},

	RestartGame: function() {
		// console.log("Restart");
		this.gameEnded = false;
		var self = this;

		this.blackScreen.className = "fadeOutInOut";
		setTimeout(function() {
			self.blackScreen.className = "";
		}, this.restartTime);

		setTimeout(function() {
			self.clock = new THREE.Clock();
			self.animationManager.Run(0);
		    self.animationManager.Animate(0);
		    self.HideElement(self.winScreen);
			self.game.restart();
		}, this.restartTime/2);
	},

	EndGame: function() {
		this.winScreen.className = "";
		this.gameEnded = true;

		var self = this;
		var showScreen = function() {
			self.winText.className = "";
		}
		var hideScreen = function() {
			self.winText.className = "hidden";
		}

		var blinkTime = 300;

		var showScreenTimer;
		var hideScreenTimer = setInterval(function() {
			hideScreen();
		}, blinkTime)
		setTimeout(function() {
			self.ShowElement(self.winScreen);
			showScreenTimer = setInterval(function() {
				showScreen();
			}, blinkTime);
		}, blinkTime)
		setTimeout(function() {
			clearInterval(showScreenTimer);
			clearInterval(hideScreenTimer);
		}, blinkTime*6.5);
	}
});