var ModelNode = function() {
	this.parent = null;
	this.children = [];
	this.obj = new THREE.Object3D();

	this.localMatrix = new THREE.Matrix4();
	this.translation = new THREE.Vector3(0,0,0);
	// this.quaternion = new THREE.Quaternion();
	this.rotation = new THREE.Euler();
	this.scaleVec = new THREE.Vector3(1,1,1);
}

_.extend(ModelNode.prototype, {
	addChild: function(child) {
		child.parent = this;
		this.obj.add(child.obj);
		this.children.push(child);
		this.obj.updateMatrixWorld(true);
	},

	translate: function(x, y, z) {
		this.translation.x += x;
		this.translation.y += y;
		this.translation.z += z;

		this.obj.position.copy(this.translation);
		this.obj.updateMatrixWorld(true);
	},

	rotate: function(x, y, z) {
		this.rotation.x += x;
		this.rotation.y += y;
		this.rotation.z += z;

		this.obj.rotation.copy(this.rotation);
		this.obj.updateMatrixWorld(true);
	},

	scale: function(x, y, z) {
		this.scaleVec.x = this.scaleVec.x*x;
		this.scaleVec.y = this.scaleVec.y*y;
		this.scaleVec.z = this.scaleVec.z*z;

		this.obj.scale.copy(this.scaleVec);
		this.obj.updateMatrixWorld(true);
	},

	applyTranslation: function(translation, updateGlobal) {
		var t = new THREE.Vector3();
		t.addVectors(translation, this.translation);

		this.obj.position.copy(t);

		if (_.isUndefined(updateGlobal) || updateGlobal == true) {
			this.obj.updateMatrixWorld(true);
		}
	},

	applyRotation: function(rotation, updateGlobal) {
		rotation.x += this.rotation.x;
		rotation.y += this.rotation.y;
		rotation.z += this.rotation.z;

		this.obj.rotation.copy(rotation);
		
		if (_.isUndefined(updateGlobal) || updateGlobal == true) {
			this.obj.updateMatrixWorld(true);
		}
	},

	applyScale: function(scale, updateGlobal) {
		scale.x *= this.scaleVec.x;
		scale.y *= this.scaleVec.y;
		scale.z *= this.scaleVec.z;

		this.obj.scale.copy(scale);
		
		if (_.isUndefined(updateGlobal) || updateGlobal == true) {
			this.obj.updateMatrixWorld(true);
		}
	},

	applyMatrix: function(matrix) {
		var object = matrix.decompose();
		var rotation = new THREE.Euler();
		applyTranslation(object[0], false);
		applyRotation(rotation.setFromQuaternion(object[1]), false);
		applyScale(object[2], false);

		this.obj.updateMatrixWorld(true);
	}
});

var JointNode = function() {
    // Inherit the constructor of ModelNode.
    ModelNode.apply(this, arguments);
}

// Inherit all other methods of ModelNode.
_.extend(JointNode.prototype, ModelNode.prototype, {

});

var BoxNode = function() {
    // Inherit the constructor of ModelNode.
    ModelNode.apply(this, arguments);

    this.width;
    this.height;
    this.depth;
}

// Inherit all other methods of ModelNode.
_.extend(BoxNode.prototype, ModelNode.prototype, {
	createObj: function(material, width, height, depth) {
		this.width = width;
		this.height = height;
		this.depth = depth;

		var box = new THREE.BoxGeometry(width, height, depth);
		this.obj = new THREE.Mesh(box, material);
	}
});

var TextureNode = function() {
	// Inherit the constructor of ModelNode.
    ModelNode.apply(this, arguments);
}

// Inherit all other methods of ModelNode.
_.extend(TextureNode.prototype, ModelNode.prototype, {
	createObj: function(planeSizeX, planeSizeY, textureImage, tile, textureSizeX, textureSizeY, isBg) {
		this.obj = TextureMapper(planeSizeX, planeSizeY, textureImage, tile, textureSizeX, textureSizeY, isBg)
	}
});