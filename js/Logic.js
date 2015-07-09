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
}

// Inherit all other methods of ModelNode.
_.extend(BoundingCircle.prototype, BoundingGeometry.prototype, {
	intersectsY: function(minX, maxX, minY, maxY) {
		return false; // TEMP
	},

	intersectsX: function(minX, maxX, minY, maxY) {
		return false;
	},

	isChainsaw: function() {
		return true;
	}
});

var Logic = function() {
	this.map = "";
	this.unitSize = 1; // Default value

	this.startPosX = 26;
	this.startPosY = 0;
	this.cameraDistanceZ = 30;

	this.moveSceneStartTime = 1;
	this.menuSpeed = 0.01;
	this.speed = 0.2;
	this.characterLocationX;
	this.characterLocationY;
	this.characterLocationIndex;

	this.lastTimeOnGround = 0;
	this.gravity = -1.5;
	this.jumpSpeed = 0.125;
	this.jumpSpeedDeceleration = -this.jumpSpeed*4;
	this.initialVelocity = 0;

	this.boundingGeometries = []

	this.characterWidth = 0.75;
	this.characterHeight = 1.7;

	this.characterBound;

	this.died = false;
	this.gameEnd = false;

	this.audio = new Sounds();
}
// var output = 0;
_.extend(Logic.prototype, {
	storeMapInfo: function(map, unitSize, startPosX, startPosY) {
		this.map = map;
		this.unitSize = unitSize;
		// this.characterLocationX = startPosX;
		// this.characterLocationY = startPosY;
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
	setScene: function(scene, camera) {
		scene.position.set(this.startPosX, this.startPosY, 0);
		camera.position.set(this.startPosX, this.startPosY, this.cameraDistanceZ);
		camera.lookAt(scene.position);
	},
	moveScene: function(scene, camera, time) {
		if (time > this.moveSceneStartTime && !this.died && !this.gameEnd) {
			scene.position.x += this.speed;
			camera.position.x += this.speed;
			camera.lookAt(scene.position);
		}
	},
	animateCharacter: function(character, time) {
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
							intersectsX = true;
							deltaX = 0;

							if (geometry.isChainsaw()) {
								this.died = true;
								this.audio.chainsawDeath();
							}

							// if (output < 10) {
							// 	output++;
							// 	console.log("minX " + (this.characterBound.minX + deltaX) +
							// 				", maxX " + (this.characterBound.maxX + deltaX) +
							// 				" intersects with minX " + geometry.minX + ", maxX " + geometry.maxX);
							// }
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
								this.died = true;
								this.audio.chainsawDeath();
							}
						}
					}
				}
			}

			this.characterBound.minX += deltaX;
			this.characterBound.maxX += deltaX;
			this.characterBound.minY += deltaY;
			this.characterBound.maxY += deltaY;

			if (this.characterBound.minY < -20) {
				this.died = true;
				this.audio.die();
			}

			character.translate(deltaX, deltaY, 0);
		}
	}
});