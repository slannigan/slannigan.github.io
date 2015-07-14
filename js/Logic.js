// Logic is dependent on ParticleManager.

var spacePressed = false;
var spacePressedTime;

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

var BoundingGeometry = function() {

}

_.extend(BoundingGeometry.prototype, {
	intersectsY: function(minX, maxX, minY, maxY) {
		return true;
	},

	intersectsX: function(minX, maxX, minY, maxY) {
		return true;
	},

	isChainsaw: function() {
		return false;
	}
});

var BoundingBox = function(minX, maxX, minY, maxY) {
	this.minX = minX;
	this.minY = minY;
	this.maxX = maxX;
	this.maxY = maxY;
}

// Inherit all other methods of ModelNode.
_.extend(BoundingBox.prototype, BoundingGeometry.prototype, {
	intersectsY: function(minX, maxX, minY, maxY) {
		// if (((minX >= this.minX && minX <= this.maxX) || (maxX >= this.minX && maxX <= this.maxX)) &&
			// ((minY >= this.minY && minY <= this.maxY) || (maxY >= this.minY && maxY <= this.maxY))) {
		if ((minX <= this.maxX && maxX >= this.minX) && (minY <= this.maxY && maxY >= this.minY)) {

			return true;
		}

		return false
	},

	intersectsX: function(minX, maxX, minY, maxY) {
		if (maxX >= this.minX && minX <= this.minX && 
			((minY >= this.minY && minY <= this.maxY) || (maxY >= this.minY && maxY <= this.maxY))) {
			return true;
		}
		return false;
	},

	isChainsaw: function() {
		return false;
	}
});

var BoundingCircle = function(centreX, centreY, radius) {
	this.centreX = centreX;
	this.centreY = centreY;
	this.radius = radius;
	console.log("x, y, r: " + this.centreX + ", " + this.centreY + ", " + this.radius);
}

// Inherit all other methods of ModelNode.
_.extend(BoundingCircle.prototype, BoundingGeometry.prototype, {
	// http://mathworld.wolfram.com/Circle-LineIntersection.html
	// Their equation assumes the circle is centred at (0,0) - translate args to make this the case
	intersects: function(x1, x2, y1, y2) {
		x1 -= (this.centreX);
		x2 -= (this.centreX);
		y1 -= this.centreY;
		y2 -= this.centreY;
		// var dx = x2 - x1;
		// var dy = y2 - y1;
		// var dr2 = (dx*dx) + (dy*dy);
		// var D = (x1*y2) - (x2*y1);

		// var determinant = (this.radius * this.radius * dr2) - (D*D);
		// // console.log(determinant);
		// var ints = determinant >= 0;
		// if (ints) {
		// 	console.log("Intersected with transformed line (" + x1 + ", " + y1 + "), (" + x2 + ", " + y2 + ")");
		// }
		// return ints;

		// Hacky, and only works because Meat Boy's bounding rect is small, 
		// but determinant method wasn't working...
		var d1 = Math.sqrt(x2*x2 + y1*y1);
		if (d1 <= this.radius) return true;
		var d2 = Math.sqrt(x1*x1 + y1*y1);
		if (d2 <= this.radius) return true;
		var d3 = Math.sqrt(x2*x2 + y2*y2);
		if (d3 <= this.radius) return true;
		var d4 = Math.sqrt(x1*x1 + y2*y2)
		if (d4 <= this.radius) return true;

		return false;
	},
	intersectsY: function(minX, maxX, minY, maxY) {
		// var intersects = this.intersects(maxX, maxX, minY, maxY);
		// if (intersects) console.log("intersectsY");
		// return intersects;
		return false;
	},

	intersectsX: function(minX, maxX, minY, maxY) {
		var intersects = (this.intersects(minX, maxX, minY, minY) || this.intersects(minX, maxX, maxY, maxY));
		if (intersects) console.log("intersectsX with line: (" + minX + ", " + minY + "), (" + maxX + ", " + minY + ")");
		return intersects;
	},

	isChainsaw: function() {
		return true;
	}
});

var Logic = function(nodeManager, modelManager, scene, camera, light, character) {
	this.modelManager = modelManager;
	this.scene = scene;
	this.camera = camera;
	this.light = light;
	this.character = character;

	this.map = "";
	this.unitSize = 1; // Default value

	this.startPosX = 26;
	this.startPosY = 0;
	this.cameraDistanceZ = 30;

	this.moveSceneStartTime = 1;
	this.menuSpeed = 0.01;
	this.speed = 0.2;
	this.characterSpeed = 0.2;
	this.characterLocationIndex;

	this.lastTimeOnGround = 0;
	this.gravity = -1.5;
	this.jumpSpeed = 0.125;
	this.jumpSpeedDeceleration = -this.jumpSpeed*4;
	this.initialVelocity = 0;

	this.boundingGeometries = [];

	this.characterWidth = 0.75;
	this.characterHeight = 1.7;

	this.characterBound;

	this.died = false;
	this.gameEnd = false;

	this.audio = new Sounds();
	this.firstCall = true;
	this.isJumping = false;
	this.isFalling = false;

	this.particleManager = new ParticleManager(nodeManager);
}
// var output = 0;
_.extend(Logic.prototype, {
	storeMapInfo: function(map, unitSize, startPosX, startPosY) {
		this.map = map;
		this.unitSize = unitSize;
		this.characterBound = {
			minX: startPosX - (this.characterWidth/2),
			maxX: startPosX + (this.characterWidth/2),
			minY: startPosY + 0.2,
			maxY: startPosY + 0.2 + this.characterHeight
		}

		for (var i = 0; i < map.length; i++) {
			if (map.charAt(i) != "c" && map.charAt(i) != "C") {
				this.boundingGeometries.push([])
			}
		}

		this.characterLocationIndex = Math.floor(unitSize/startPosX);
	},
	addBoundingBox: function(index, minX, minY, maxX, maxY) {
		var box = new BoundingBox(minX, minY, maxX, maxY);
		this.boundingGeometries[index].push(box);

		// console.log("Size of array at " + index + ": " + this.boundingGeometries[index].length);
	},
	addBoundingCircle: function(index, centreX, centreY, radius) {
		var circle = new BoundingCircle(centreX, centreY, radius);
		this.boundingGeometries[index].push(circle);
	},
	setScene: function() {
		this.scene.position.set(this.startPosX, this.startPosY, 0);
		this.camera.position.set(this.startPosX, this.startPosY, this.cameraDistanceZ);
		this.camera.lookAt(this.scene.position);
		// this.modelManager.resetCharacter();
	},
	moveScene: function(time) {
		if (time > this.moveSceneStartTime && !this.died && !this.gameEnd) {
			this.scene.position.x += this.characterSpeed;
			this.camera.position.x += this.characterSpeed;
			this.camera.lookAt(this.scene.position);
			this.light.position.x += this.characterSpeed;
		}
	},
	chainsawDeath: function(time, deltax, deltay, saw) {
		this.died = true;
		this.audio.chainsawDeath();

		var p1x = this.characterBound.maxX;
		var p1y = this.characterBound.minY;
		var startPoint = new THREE.Vector3(p1x, p1y, 0);

		var speedX = 0.3*(p1x - saw.centreX)*Math.abs(deltax);
		var speedY = 0.3*(p1y - saw.centreY)*Math.abs(deltay) + 0.2;
	    var directionVector = new THREE.Vector3(speedX,speedY,0);
    	this.particleManager.createBloodSplatter(startPoint, directionVector, time);
	},
	animateCharacter: function(time) {
		if (this.firstCall) {
			this.firstCall = false;
			// console.log("Start running");
			// this.audio.startRunning();
		}
		if (!this.died && !this.gameEnd) {
			var deltaTime = time - this.lastTimeOnGround;
			var gravitySpeed = this.gravity * deltaTime;
			var upSpeed = this.jumpSpeed + (this.jumpSpeedDeceleration * deltaTime);
			// if (spacePressed && time - spacePressedTime < this.maxJumpReachedAtTime) {
				// this.initialVelocity += this.jumpSpeed;
			// }
			if (spacePressed && upSpeed > 0) {
				this.initialVelocity += upSpeed;
			}
			
			var deltaX = this.speed;
			var deltaY = gravitySpeed + this.initialVelocity;

			var index = Math.floor(this.characterBound.minX/this.unitSize);
			this.characterLocationIndex = index;

			var intersectsX = false, intersectsY = false;
			for (var j = -1; j < 2; j++) {
				if (j == -1 && index == 0) continue;
				if (j == 1 && index > this.map.length) {
					this.gameEnd = true;
					continue;
				}

				for (var i = 0; i < this.boundingGeometries[j+index].length; i++) {
					var geometry = this.boundingGeometries[j+index][i];
					if (!intersectsX && !this.died) {
						if (geometry.intersectsX(this.characterBound.minX + deltaX,
												this.characterBound.maxX + deltaX,
												this.characterBound.minY,
												this.characterBound.maxY)) {

							if (geometry.isChainsaw()) {
								this.chainsawDeath(time, deltaX, deltaY, geometry);
							}

							intersectsX = true;
							deltaX = 0;
						}
					}
					if (!intersectsY && !this.died) {
						if (geometry.intersectsY(this.characterBound.minX,
												this.characterBound.maxX,
												this.characterBound.minY + deltaY,
												this.characterBound.maxY + deltaY)) {

							// Prevents extra little bounce on land
							if (time - this.lastTimeOnGround > 0.05 &&
								this.characterBound.minY + deltaY <= geometry.maxY &&
								this.characterBound.maxY + deltaY >= geometry.maxY) {

								deltaY = geometry.maxY - this.characterBound.minY;
							}
							else {
								deltaY = 0;
							}

							intersectsY = true;
							this.lastTimeOnGround = time;
							this.initialVelocity = 0;

							if (geometry.isChainsaw()) {
								this.chainsawDeath(time);
							}
						}
					}
				}
			}

			if (!this.isJumping && deltaY > 0) {
				this.isJumping = true;
				this.audio.startJump();
			}
			else if (!this.isFalling && deltaY < 0) {
				this.isJumping = false;
				this.isFalling = true;
				this.audio.startFall();
			}
			else if (this.isFalling && deltaY == 0) {
				this.isFalling = false;
				this.audio.startLand();
			}

			this.characterBound.minX += deltaX;
			this.characterBound.maxX += deltaX;
			this.characterBound.minY += deltaY;
			this.characterBound.maxY += deltaY;

			if (this.characterBound.minY < -20) {
				this.died = true;
				this.audio.die();
			}

			if (this.died) this.modelManager.KillCharacter();

			this.character.translate(deltaX, deltaY, 0);
			this.characterSpeed = deltaX;
		}
	},
	renderParticles: function(time) {
		this.particleManager.RenderParticles(time);
	}
});

// Functions called by Interface
_.extend(Logic.prototype, {
	togglePaused: function(paused) {
		this.audio.togglePaused(paused);
	},
	restart: function() {
		this.firstCall = true;
		this.died = false;
		this.gameEnd = false;
		this.setScene(this.scene, this.camera);
	}
});