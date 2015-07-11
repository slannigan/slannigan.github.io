var toggleParticles = false;

document.addEventListener('keydown', function(e) {
    // http://www.javascriptkit.com/javatutors/javascriptkey2.shtml
    var unicode = e.keyCode? e.keyCode : e.charCode;

    if (unicode == 80) {      // 'p' key
        toggleParticles = true;
    }
});

var ParticleManager = function() {
	this.container = new ModelNode();
	this.particleSystems = [];
	this.particlesOn = true;
}

_.extend(ParticleManager.prototype, {
	RenderParticles: function(time) {
		// console.log("Rendering particles");
		if (toggleParticles) {
			this.particlesOn = !particlesOn;
			toggleParticles = false;
		}

		if (this.particlesOn) {
			// console.log("Particles: " + particleSystems[0].particles.length);
			for (var i = 0; i < this.particleSystems.length; i++) {
				if (this.particleSystems[i].isDead) {
					continue;
				}
				var numDead = 0;
				for (var j = 0; j < this.particleSystems[i].particles.length; j++) {
					if (this.particleSystems[i].particles[j].isDead) {
						numDead++;
						continue;
					}

					this.particleSystems[i].particles[j].update(time);
				}
				if (numDead == this.particleSystems[i].particles.length) {
					this.particleSystems[i].isDead = true;
					this.container.removeChild(this.particleSystems[i].container);
				}
			}
		}
	},

	createBloodSplatter: function(startPoint, directionVector, time) {
		var startPointDistribution = new THREE.Vector3(0.1, 0.1, 0.1);
		var sizeAvg = 0.3;
		var sizeVar = 0.2;
		var ttlAvg = 0.45;
		var ttlVar = 0.15;
		var hasGravity = true;
		var creationRate = 50;
		var image = "images/blood.png";
		var alwaysOn = false;
		
		var particleSystem = new ParticleSystem(startPoint, startPointDistribution, directionVector, sizeAvg, sizeVar, ttlAvg, ttlVar, hasGravity, creationRate, image, alwaysOn, time);
		// return particleSystem;
		this.container.addChild(particleSystem.container);
		this.particleSystems.push(particleSystem);
	}
});

var Particle = function(startPoint, speed, size, ttl, system) {
	this.isDead = false;
	this.speed = speed;

	this.ttl = ttl;
	this.system = system;

	this.billboard = new Billboard(size, size, startPoint, system.image);
	// this.system.obj.add(this.billboard.texture);
	this.system.container.addChild(this.billboard.texture);
}

_.extend(Particle.prototype, {
	update: function(time) {
		// console.log("updating");
		var deltaTime = time - this.system.timeCreated;
		if (deltaTime >= this.ttl) {
			// console.log("Dead");
			this.isDead = true;
			// this.system.obj.remove(this.billboard.texture);
			this.system.container.removeChild(this.billboard.texture);
			return;
		}

		var x = this.speed.x;
		var y = this.system.gravity * deltaTime + this.speed.y;
		var z = this.speed.z;

		this.billboard.update(x,y,z,1);
	}
});

var ParticleSystem = function(startPoint, startPointDistribution, directionVector, sizeAvg, sizeVar, ttlAvg, ttlVar, hasGravity, creationRate, image, alwaysOn, time) {
	this.isDead = false;
	this.particles = [];
	this.container = new ModelNode();

	this.startPoint = startPoint;
	this.startPointDistribution = startPointDistribution;
	this.minX = startPoint.x - startPointDistribution.x;
	this.maxX = startPoint.x + startPointDistribution.x;
	this.minY = startPoint.y - startPointDistribution.y;
	this.maxY = startPoint.y + startPointDistribution.y;
	this.minZ = startPoint.z + startPointDistribution.z;
	this.maxZ = startPoint.z - startPointDistribution.z;

	this.directionVector = directionVector;
	this.sizeAvg = sizeAvg;
	this.sizeVar = sizeVar;
	this.ttlAvg = ttlAvg;
	this.ttlVar = ttlVar;
	this.gravity = hasGravity ? -0.98 : 0;
	this.creationRate = creationRate;
	this.numToCreate = creationRate >= 1 ? creationRate : 1;

	this.image = image;
	this.timeCreated = time;

	if (!alwaysOn) {
		this.createParticles();
	}

	// particleSystems.push(this);
	// particleContainer.addChild(this.container);
}

_.extend(ParticleSystem.prototype, {
	createParticles: function() {
		// Z: Need to create particles in order from back to front
		// X/Y: Distribute randomly
		var zInc = (this.maxZ - this.minZ)/this.numToCreate;
		for (var i = 0; i < this.numToCreate; i++) {
			var x = Math.random() * (this.maxX - this.minX) + this.minX;
			var y = Math.random() * (this.maxY - this.minY) + this.minY;
			var z = this.minZ + (i*zInc);
			var startPoint = new THREE.Vector3(x,y,z);

			var speed = new THREE.Vector3(x,y,z);
			speed.add(this.directionVector);
			speed.sub(this.startPoint);

			var size = this.sizeAvg + (Math.random() * 2 * this.sizeVar) - this.sizeVar;
			var ttl = this.ttlAvg + (Math.random() * 2 * this.ttlVar) - this.ttlVar;

			// Particle adds itself to parent in constructor
			var particle = new Particle(startPoint, speed, size, ttl, this);
			this.particles.push(particle);
		}
	}
});