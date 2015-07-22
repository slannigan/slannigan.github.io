window.ParticleManager = function(nodeManager, camera) {
	this.nodeManager = nodeManager;
	this.container = this.nodeManager.CreateModelNode();
	this.particleSystems = [];
	this.particlesOn = true;
	this.toggleParticles = false;

	if (!_.isUndefined(window.BillboardManager)) {
		this.billboardManager = new BillboardManager(nodeManager, camera);
	}

	var self = this;
	document.addEventListener('keydown', function(e) {
	    // http://www.javascriptkit.com/javatutors/javascriptkey2.shtml
	    var unicode = e.keyCode? e.keyCode : e.charCode;

	    if (unicode == 79) {      // 'o' key
	        self.toggleParticles = true;
	    }
	});
}

_.extend(ParticleManager.prototype, {
	RenderParticles: function(time) {
		// console.log("Rendering particles");
		if (this.toggleParticles) {
			this.particlesOn = !this.particlesOn;
			this.toggleParticles = false;
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
		var startPointDistribution = new THREE.Vector3(0.1, 0.1, 0);
		var accelerationVector = new THREE.Vector3(0, -0.98, 0);
		var sizeAvg = 0.3;
		var sizeVar = 0.2;
		var ttlAvg = 0.45;
		var ttlVar = 0.15;
		var creationRate = 50;
		var image = "blood";
		var alwaysOn = false;
		
		if (this.particlesOn) {
			var particleSystem = new ParticleSystem(this.nodeManager, this.billboardManager, startPoint, startPointDistribution, directionVector, accelerationVector, sizeAvg, sizeVar, ttlAvg, ttlVar, creationRate, image, alwaysOn, time);
			this.container.addChild(particleSystem.container);
		this.particleSystems.push(particleSystem);
		}
	}
});

var Particle = function(startPoint, speed, size, ttl, system) {
	this.isDead = false;
	this.speed = speed;

	this.ttl = ttl;
	this.system = system;

	// this.billboard = new Billboard(size, size, startPoint, system.image);
	if (!_.isUndefined(this.system.billboardManager) && !_.isNull(this.system.billboardManager)) {
		this.billboard = this.system.billboardManager.CreateBillboard(size, size, startPoint, system.image);
		// this.system.obj.add(this.billboard.texture);
		this.system.container.addChild(this.billboard.texture);
	}
	else {
		this.billboard = this.system.nodeManager.CreateTextureNode(size, size, system.image, false, size, size, false);
		this.billboard.translate(startPoint.x, startPoint.y, startPoint.z);
		this.system.container.addChild(this.billboard);
	}
}

_.extend(Particle.prototype, {
	update: function(time) {
		// console.log("updating");
		var deltaTime = time - this.system.timeCreated;
		if (deltaTime >= this.ttl) {
			// console.log("Dead");
			this.isDead = true;
			// this.system.obj.remove(this.billboard.texture);
			if (!_.isUndefined(this.system.billboardManager) && !_.isNull(this.system.billboardManager)) {
				this.system.container.removeChild(this.billboard.texture);
			}
			else {
				this.system.container.removeChild(this.billboard);
			}
			return;
		}

		var x = this.system.accelerationVector.x * deltaTime + this.speed.x;
		var y = this.system.accelerationVector.y * deltaTime + this.speed.y;
		var z = this.system.accelerationVector.z * deltaTime + this.speed.z;

		if (!_.isUndefined(this.system.billboardManager) && !_.isNull(this.system.billboardManager)) {
			// console.log("Attempting to update billboard");
			this.billboard.update(x,y,z,1);
		}
		else {
			// console.log("Updating texture");
			this.billboard.translate(x,y,z);
		}
	}
});

var ParticleSystem = function(nodeManager, billboardManager, startPoint, startPointDistribution, directionVector, accelerationVector, sizeAvg, sizeVar, ttlAvg, ttlVar, creationRate, image, alwaysOn, time) {
	this.nodeManager = nodeManager;
	this.billboardManager = billboardManager;

	this.isDead = false;
	this.particles = [];
	this.container = nodeManager.CreateModelNode();

	this.startPoint = startPoint;
	this.startPointDistribution = startPointDistribution;
	this.minX = startPoint.x - startPointDistribution.x;
	this.maxX = startPoint.x + startPointDistribution.x;
	this.minY = startPoint.y - startPointDistribution.y;
	this.maxY = startPoint.y + startPointDistribution.y;
	this.minZ = startPoint.z + startPointDistribution.z;
	this.maxZ = startPoint.z - startPointDistribution.z;

	this.directionVector = directionVector;
	this.accelerationVector = accelerationVector;
	this.sizeAvg = sizeAvg;
	this.sizeVar = sizeVar;
	this.ttlAvg = ttlAvg;
	this.ttlVar = ttlVar;
	this.creationRate = creationRate;
	this.numToCreate = creationRate >= 1 ? creationRate : 1;

	this.image = image;
	this.timeCreated = time;

	if (!alwaysOn) {
		this.createParticles();
	}
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