window.Sounds = function() {
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

	this.musicOn = true;
	this.sfxOn = true;
	this.paused = false;

	if (!_.isNull(this.music)) {
		this.music.loop = true;
		this.music.play();
	}
	if (!this.musicOn) this.muteMusic();

	if (this.sfxOn) this.unmuteSFX();
	else this.muteSFX();

	var self = this;

	document.addEventListener('keydown', function(e) {
	    // http://www.javascriptkit.com/javatutors/javascriptkey2.shtml
	    var unicode = e.keyCode? e.keyCode : e.charCode;

	    if (unicode == 77) { 	  // 'm' key
	    	self.musicOn = !self.musicOn;
	    	if (self.musicOn) self.unmuteMusic();
	    	else self.muteMusic();
	    }
	    else if (unicode == 83) { // 's' key
	        self.sfxOn = !self.sfxOn;
	        if (self.sfxOn) self.unmuteSFX();
	        else self.muteSFX();
	    }
	});
}

_.extend(Sounds.prototype, {
	muteMusic: function() {
		if (!_.isNull(this.music)) {
			this.music.volume = 0;
		}
	},

	lowerMusic: function() {
		if (!_.isNull(this.music)) {
			this.music.volume = 0.5;
		}
	},

	unmuteMusic: function() {
		if (this.paused) this.lowerMusic();
		else {
			if (!_.isNull(this.music)) {
				this.music.volume = 1;
			}
		}
	},

	muteSFX: function() {
		this.run.volume = 0;
		this.jump.volume = 0;
		this.land.volume = 0;
		this.death.volume = 0;
		this.saw.volume = 0;
	},

	unmuteSFX: function() {
		this.run.volume = 0.2;
		this.jump.volume = 1;
		this.land.volume = 1;
		this.death.volume = 1;
		this.saw.volume = 1;
	},

	togglePaused: function(paused) {
		// console.log("Toggling audio paused: " + paused);
		this.paused = paused;
		if (paused) {
			if (this.musicOn) this.lowerMusic();
			if (this.sfxOn) this.muteSFX();
		}
		else {
			if (this.musicOn) this.unmuteMusic();
			if (this.sfxOn) this.unmuteSFX();
		}
	},

	startRunning: function() {
		if (!this.isRunning) {
			this.isRunning = true;
			// console.log("Start running timer");
			this.run.play();
		}
	},

	endRunning: function() {
		// console.log("End running");
		this.run.pause();
	},

	startJump: function() {
		if (!this.isJumping) {
			// console.log("Jumping");
			this.isJumping = true;
			this.isFalling = false;
			this.isRunning = false;

			this.jump.play();
			this.endRunning();
		}
	},

	startLand: function() {
		if (this.isFalling) {
			this.isFalling = false;
			// console.log("Landing");
			this.land.play();
			this.startRunning();
		}
	},

	startFall: function() {
		if (!this.isFalling) {
			this.isFalling = true;
			this.isRunning = false;
			this.isJumping = false;
			// console.log("Falling");
			this.endRunning();
		}
	},

	die: function() {
		this.death.play();
		this.endRunning();
	},

	chainsawDeath: function() {
		this.saw.play();
		this.die();
	},

	endGame: function() {
		this.muteSFX();
		this.lowerMusic();
	}
});