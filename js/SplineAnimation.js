var AnimationManager = function() {
	// Character geometry
	this.body;
	this.armR;
	this.armL;
	this.legR;
	this.legL;
	this.face;

	// Character joints/nodes
	this.shoulderR;
	this.shoulderL;
	this.hipR;
	this.hipL;

	// Animation
	this.running = 'running';
	this.jumping = 'jumping';
	this.falling = 'falling';
	this.state = null;
	this.stateStart = 0;
	this.changeState = false;

	this.bodyRotationPos = { x: 0, y: 0, z: -0.25 };
	this.armRotationPos = { x: 0, y: 0, z: 0 };
	this.armTranslationPos = { x: 0, y: 0, z: 0 };
	this.legRotationPos = { x: 0, y: 0, z: 0 };
	this.legTranslationPos = { x: 0, y: 0, z: 0 };

	// --------- BODY ANIMATIONS ----------- //
	this.fallingBodyRotation = [
		{ x: 0, y: 0, z: -0.25 },
		{ x: 0, y: 0, z: 0.13 },
		{ x: 0, y: 0, z: 0.25 }
	];
	this.fallingBodyRotationSpeed = 2;

	this.runningBodyRotation = [
		{ x: 0, y: 0, z: 0.25 },
		// { x: 0, y: 0, z: 0 },
		{ x: 0, y: 0, z: -0.25}
	];
	this.runningBodyRotationSpeed = 12;


	// --------- LEG ANIMATIONS ------------- //
	this.runningLegRotation = [
		{ x: 0, y: 0, z: 0 },
		{ x: 1, y: 0, z: 0 },
		{ x: 0, y: 0, z: 0 },
		{ x: -2, y: 0, z: 0 },
		{ x: 0, y: 0, z: 0 }
	];
	this.runningLegTranslation = [
		{ x: 0, y: 0, z: 0 },
		{ x: 0, y: 0, z: 0 },
		{ x: 0, y: 0.5, z: 0 },
		{ x: 0, y: 0, z: 0 },
		{ x: 0, y: 0, z: 0 }
	];
	this.jumpingLegRotation = [
		{ x: 0, y: 0, z: 0 }, // Will be reset to be previous leg rotation position
		{ x: 0, y: 0, z: 0 }
	];
	this.jumpingLegTranslation = [
		{ x: 0, y: 0, z: 0 }, // Will be reset to be previous leg rotation position
		{ x: 0, y: 0, z: 0 }
	];


	// --------- ARM ANIMATIONS ------------- //
	this.jumpingArmRRotation = [
		{ x: 0, y: 0, z: 0 }, // Will be reset to be previous arm rotation position
		{ x: 0, y: 0, z: 1 }
	];
	this.jumpingArmTranslation = [
		{ x: 0, y: 0, z: 0 }, // Will be reset to be previous arm translation position
		{ x: 0, y: 0.25, z: 0 }
	];
	this.jumpingArmRotationSpeed = 8;

	this.fallingArmRRotation = [
		{ x: 0, y: 0, z: -1 }, // Will be reset to be previous arm rotation position
		{ x: 0, y: 0, z: -3 }
	];
	this.fallingArmTranslation = [
		{ x: 0, y: 0.25, z: 0 },
		{ x: 0.5, y: 0.5, z: 0 }
	];
	this.fallingArmRotationSpeed = 4;

	this.runningArmRotation = [
		{ x: 0, y: 0, z: 0 },
		{ x: 0, y: 2, z: 0 },
		{ x: 0, y: 0, z: 0 },
		{ x: 0, y: -2, z: 0 },
		{ x: 0, y: 0, z: 0 }
	];
	this.runningArmTranslation = [
		{ x: 0, y: 0, z: 0 },
		{ x: 0, y: 0, z: 0.5 },
		{ x: 0, y: 0, z: 0 },
		{ x: 0, y: 0, z: -0.5 },
		{ x: 0, y: 0, z: 0 }
	];
	this.runningArmTranslation0 = { x: 0, y: 0, z: 0 }
	this.runningArmRotation0 = { x: 0, y: 0, z: 0 }
	this.runningArmSpeed = 3;
}

_.extend(AnimationManager.prototype, {
	SetBody: function(body, armR, armL, legR, legL, shoulderR, shoulderL, hipR, hipL) {
		this.body = body;
		this.armR = armR;
		this.armL = armL;
		this.legR = legR;
		this.legL = legL;

		this.shoulderR = shoulderR;
		this.shoulderL = shoulderL;
		this.hipR = hipR;
		this.hipL = hipL;
	},

	Run: function(time) {
		console.log("Running");
		this.state = this.running;
		this.stateStart = time;
		this.changeState = true;
	},

	Jump: function(time) {
		console.log("Jumping");
		this.state = this.jumping;
		this.stateStart = time;
		this.changeState = true;
	},

	Fall: function(time) {
		console.log("Falling");
		this.state = this.falling;
		this.stateStart = time;
		this.changeState = true;
	},

	Reset: function(time) {
		var e = new THREE.Euler(0,0,0);
		var v = new THREE.Vector3(0,0,0);

		this.shoulderR.applyRotation(e);
		this.shoulderR.applyTranslation(v);
		this.shoulderL.applyRotation(e);
		this.shoulderL.applyTranslation(v);

		this.hipR.applyRotation(e);
		this.hipR.applyTranslation(v);
		this.hipL.applyRotation(e);
		this.hipL.applyTranslation(v);

		this.state = null;
	},

	Factorial: function(n) {
		var fact = 1;
		for (var i = 1; i <= n; i++) {
			fact *= i;
		}
		return fact;
	},

	Bernstein: function(t, i, n) {
		var numerator = (this.Factorial(n) * Math.pow(1 - t, n - i) * Math.pow(t, i));
		var denominator = this.Factorial(n-i) * this.Factorial(i);
		return numerator/denominator;
	},

	Bezier: function(t, P) {
		var sumx = sumy = sumz = 0;
		var n = P.length;

		for (var i = 0; i < n; i++) {
			var b = this.Bernstein(t, i, n-1);
			sumx += (P[i].x * b);
			sumy += (P[i].y * b);
			sumz += (P[i].z * b);
		}
		return { x: sumx, y: sumy, z: sumz };
	},

	Animate: function(time) {
		time = (time - this.stateStart);

		if (this.changeState) {
			this.changeState = false;
			if (this.state == this.running) {
				// Body
				this.runningBodyRotation[0] = this.bodyRotationPos;
				// Arms
				this.runningArmTranslation[0] = this.armTranslationPos;
				this.runningArmRotation[0] = this.armRotationPos;
			}
			else if (this.state == this.jumping) {
				this.jumpingArmTranslation[0] = this.armTranslationPos;
				this.jumpingArmRRotation[0] = this.armRotationPos;
				this.jumpingLegRotation[0] = this.legRotationPos;
			}
			else if (this.state == this.falling) {
				// Body
				this.fallingBodyRotation[0] = this.bodyRotationPos;
				var z = (3/4)*(this.fallingBodyRotation[2].z - this.bodyRotationPos.z);
				this.fallingBodyRotation[1] = { x: 0, y: 0, z: z };
			}
		}

		if (this.state == this.running) {
			// Body
			var t = time * this.runningBodyRotationSpeed;
			if (t <= 1) {
				// Body
				var b = this.Bezier(t, this.runningBodyRotation);
				this.bodyRotationPos = b;
				var e = new THREE.Euler(b.x, b.y, b.z, 'ZYX');
				this.body.applyRotation(e);
			}

			// Arms
			t = time * this.runningArmSpeed;
			if (t <= 1) {
				var b = this.Bezier(t, this.runningArmRotation);
				this.armRotationPos = b
				var e = new THREE.Euler(b.x, b.y, b.z);
				this.shoulderR.applyRotation(e);

				b = this.Bezier(t, this.runningArmTranslation);
				this.armTranslationPos = b;
				var t = new THREE.Vector3(b.x, b.y, b.z);
				this.shoulderR.applyTranslation(t);
			}
			else {
				this.runningArmRotation[0] = this.runningArmRotation0;
				this.runningArmTranslation[0] = this.runningArmTranslation0;

				t = t - Math.floor(t);
				var b = this.Bezier(t, this.runningArmRotation);
				this.armRotationPos = b;
				var e = new THREE.Euler(b.x, b.y, b.z);
				this.shoulderR.applyRotation(e);

				b = this.Bezier(t, this.runningArmTranslation);
				this.armTranslationPos = b;
				var t = new THREE.Vector3(b.x, b.y, b.z);
				this.shoulderR.applyTranslation(t);
			}

			// Legs
			t = time * this.runningArmSpeed;
			t = t - Math.floor(t);
			b = this.Bezier(t, this.runningLegRotation);
			this.legRotationPos = b;
			var e = new THREE.Euler(b.x, b.y, b.z);
			this.hipR.applyRotation(e);

			b = this.Bezier(t, this.runningLegTranslation);
			this.legTranslationPos = b;
			t = new THREE.Vector3(b.x, b.y, b.z);
			this.hipR.applyTranslation(t);
		}
		else if (this.state == this.jumping) {
			var t = time * this.jumpingArmRotationSpeed;
			if (t <= 1) {
				// Arms
				var trans = this.Bezier(t, this.jumpingArmTranslation)
				var v = new THREE.Vector3(trans.x, trans.y, trans.z);
				this.shoulderR.applyTranslation(trans)

				var rot = this.Bezier(t, this.jumpingArmRRotation);
				var e = new THREE.Euler(rot.x, rot.y, rot.z);
				this.shoulderR.applyRotation(e);

				// Legs
				trans = this.Bezier(t, this.jumpingLegTranslation)
				v = new THREE.Vector3(trans.x, trans.y, trans.z);
				this.hipR.applyTranslation(trans)

				rot = this.Bezier(t, this.jumpingLegRotation);
				e = new THREE.Euler(rot.x, rot.y, rot.z);
				this.hipR.applyRotation(e);
			}
		}
		else if (this.state == this.falling) {
			// Body
			var t = time * this.fallingBodyRotationSpeed;
			if (t <= 1) {
				// Body
				var b = this.Bezier(t, this.fallingBodyRotation)
				this.bodyRotationPos = b;
				var e = new THREE.Euler(b.x, b.y, b.z, 'ZYX');
				this.body.applyRotation(e);

				// Arms
				var trans = this.Bezier(t, this.fallingArmTranslation)
				this.armTranslationPos = trans;
				var v = new THREE.Vector3(trans.x, trans.y, trans.z);
				this.shoulderR.applyTranslation(trans)

				var rot = this.Bezier(t, this.fallingArmRRotation);
				this.armRotationPos = rot;
				var e = new THREE.Euler(rot.x, rot.y, rot.z);
				this.shoulderR.applyRotation(e);
			}
		}
	}
});