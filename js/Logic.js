var Logic = function() {
	this.startPosX = 26;
	this.startPosY = 0;
	this.cameraDistanceZ = 30;

	this.moveSceneStartTime = 1;
	this.menuSpeed = 0.01;
	this.speed = 0.1;

	this.airTimeStart = 0;
	this.gravity = -0.98;
}

_.extend(Logic.prototype, {
	setScene: function(scene, camera) {
		scene.position.set(this.startPosX, this.startPosY, 0);
		camera.position.set(this.startPosX, this.startPosY, this.cameraDistanceZ);
		camera.lookAt(scene.position);
	},
	moveScene: function(scene, camera, time) {
		if (time > this.moveSceneStartTime) {
			scene.position.x += this.speed;
			camera.position.x += this.speed;
			camera.lookAt(scene.position);
		}
	},

	animateCharacter: function(character, time) {
		var gravitySpeed = this.gravity * (time - this.airTimeStart);
		character.translate(this.speed, gravitySpeed, 0);
	}
});