var Sounds = function() {
	this.music = document.getElementById("backgroundMusic");

	this.run = document.getElementById("runSound");
	this.jump = document.getElementById("jumpSound");
	this.land = document.getElementById("landSound");
	this.death = document.getElementById("deathSound");
	this.saw = document.getElementById("sawSound");

	this.runRate = 1;
	this.runSoundTimer = null;

	this.isRunning = false;
	this.isJumping = false;
	this.isFalling = false;

	this.run.loop = true;
	this.run.playbackRate = 2.5;
	this.run.volume = 0.3;

	this.music.loop = true;
	this.music.play();
}

_.extend(Sounds.prototype, {
	startRunning: function() {
		if (!this.isRunning) {
			this.isRunning = true;
			console.log("Start running timer");
			this.run.play();
		}
	},

	endRunning: function() {
		console.log("End running");
		this.run.pause();
	},

	startJump: function() {
		if (!this.isJumping) {
			console.log("Jumping");
			this.isJumping = true;
			this.isFalling = false;
			this.isRunning = false;
			this.endRunning();
			this.jump.play();
		}
	},

	startLand: function() {
		if (this.isFalling) {
			this.isFalling = false;
			console.log("Landing");
			this.land.play();
			this.startRunning();
		}
	},

	startFall: function() {
		if (!this.isFalling) {
			this.isFalling = true;
			this.isRunning = false;
			this.isJumping = false;
			console.log("Falling");
			this.endRunning();
		}
	},

	die: function() {
		this.death.play();
	},

	chainsawDeath: function() {
		this.saw.play();
		this.die();
	}
});