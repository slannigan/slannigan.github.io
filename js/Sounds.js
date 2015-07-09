var Sounds = function() {
	// this.run = new Audio("../sounds/Meat_feet_fast1.wav");
	// this.jump = new Audio("../sounds/Meat_jumps0.wav");
	// this.land = new Audio("../sounds/Meat_Landing0.wav");
	// this.death = new Audio("../sounds/meat_death_1.wav");
	// this.death = new Audio("../sounds/meat_death_1.mp3");
	// this.death = new Audio("../sounds/LK 1M1 Circle Of Life.mp3");
	// this.saw = new Audio("../sounds/SawDeath0.wav");

	// this.run = document.getElementById("runSound");
	// this.jump = document.getElementById("jumpSound");
	// this.land = document.getElementById("landSound");
	this.death = document.getElementById("deathSound");
	// this.saw = document.getElementById("sawSound");

	this.runRate = 100;
	this.runSoundTimer = null;
}

_.extend(Sounds.prototype, {
	playRunningSound: function(self) {
		self.run.play();
	},

	startRunning: function() {
		this.runSoundTimer = setInterval(this.playRunningSound, this.runRage, this);
	},

	startJump: function() {
		clearInterval(this.runSoundTimer);
		this.jump.play();
	},

	endJump: function() {
		this.land.play();
		this.startRunning();
	},

	die: function() {
		console.log("Trying to play death sound");
		this.death.play();
	},

	chainsawDeath: function() {
		this.saw.play();
		this.die();
	}
});