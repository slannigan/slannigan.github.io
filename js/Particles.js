var particleSystems = [];
var particlesOn = true;
var toggleParticles = false;

document.addEventListener('keydown', function(e) {
    // http://www.javascriptkit.com/javatutors/javascriptkey2.shtml
    var unicode = e.keyCode? e.keyCode : e.charCode;

    if (unicode == 80) {      // 'p' key
        toggleParticles = true;
    }
});

function RenderParticles(time) {
	// console.log("Rendering particles");
	if (toggleParticles) {
		particlesOn = !particlesOn;
		toggleParticles = false;
	}

	if (particlesOn) {
		// console.log("Particles: " + particleSystems[0].particles.length);
		for (var i = 0; i < particleSystems.length; i++) {
			if (particleSystems[i].isDead) {
				continue;
			}
			var numDead = 0;
			for (var j = 0; j < particleSystems[i].particles.length; j++) {
				if (particleSystems[i].particles[j].isDead) {
					numDead++;
					continue;
				}

				particleSystems[i].particles[j].update(time);
			}
			if (numDead == particleSystems[i].particles.length) {
				particleSystems[i].isDead = true;
			}
		}
	}
}

var Particle = function(startPoint, speed, size, ttl, system) {
	this.isDead = false;
	this.speed = speed;

	this.ttl = ttl;
	this.system = system;

	this.billboard = new Billboard(size, size, startPoint, system.image);
	this.system.obj.add(this.billboard.texture);
}

_.extend(Particle.prototype, {
	update: function(time) {
		// console.log("updating");
		var deltaTime = time - this.system.timeCreated;
		if (deltaTime >= this.ttl) {
			// console.log("Dead");
			this.isDead = true;
			this.system.obj.remove(this.billboard.texture);
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
	this.obj = new THREE.Object3D();

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

	particleSystems.push(this);
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

			var particle = new Particle(startPoint, speed, size, ttl, this);
			this.particles.push(particle);
		}
	}
});

var createBloodSplatter = function(startPoint, directionVector, time) {
	var startPointDistribution = new THREE.Vector3(0.1, 0.1, 0.1);
	var sizeAvg = 0.2;
	var sizeVar = 0.1;
	var ttlAvg = 0.35;
	var ttlVar = 0.15;
	var hasGravity = true;
	var creationRate = 50;
	var image = "../images/meatboy.png";
	var alwaysOn = false;
	
	var particleSystem = new ParticleSystem(startPoint, startPointDistribution, directionVector, sizeAvg, sizeVar, ttlAvg, ttlVar, hasGravity, creationRate, image, alwaysOn, time);
	return particleSystem;
}