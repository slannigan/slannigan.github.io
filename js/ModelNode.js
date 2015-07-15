// If we wish to have textures, NodeManager is dependent on TextureManager.
// Otherwise, textures will be replaced with green squares.

var NodeManager = function(textureManager) {
	this.textureManager = textureManager;
	this.materialForNoTextures = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
	this.bgMaterialForNoTextures = new THREE.MeshLambertMaterial({ color: 0x0000ff });
}

_.extend(NodeManager.prototype, {
	CreateModelNode: function() {
		var node = new ModelNode();
		return node;
	},

	CreateBoxNode: function(material, width, height, depth) {
		var box = new BoxNode();
		box.createObj(material, width, height, depth);
		return box;
	},

	CreateJointNode: function() {
		var joint = new JointNode();
		return joint;
	},

	CreateTextureNode: function(planeSizeX, planeSizeY, textureImage, tile, textureSizeX, textureSizeY, isBg) {
		// If no TextureManager exists, create a green square instead
		if (_.isUndefined(this.textureManager)) {
			if (!isBg) {
				return this.CreateBoxNode(this.materialForNoTextures, planeSizeX, planeSizeY, 0.01);
			}
			else {
				return this.CreateBoxNode(this.bgMaterialForNoTextures, planeSizeX, planeSizeY, 0.01);
			}
		}
		// If TextureManager exists, create texture
		else {
			var texture = new TextureNode();
			texture.obj = this.textureManager.CreateTexture(planeSizeX, planeSizeY, textureImage, tile, textureSizeX, textureSizeY, isBg);
			return texture;
		}
	},

	CreateAnimatedTextureNode: function(planeSizeX, planeSizeY, textureAnimation, loops) {
        var container = this.CreateModelNode();
        var anim = this.textureManager.AnimationLibrary[textureAnimation];

        if (_.isUndefined(anim)) {
        	console.log("Animation undefined");
        	return container;
        }
        
        var textures = [];
        var timeSoFar = 0;
        var totalTime = 0;

    	_.each(anim, function(frame) {
    		totalTime += frame.duration;
    	});

		for (var i = 0; i < anim.length; i++) {
			// textures.push(anim[i].texture);
			console.log("texture: " + anim[i].texture);
			var texture = this.CreateTextureNode(planeSizeX, planeSizeY, anim[i].texture, false, planeSizeX, planeSizeY, false);
			textures.push(texture);

			if (i == 0) {
				console.log("Set to 0");
				container.addChild(textures[0]);
			}
			else {
				var nextTexture = function(x) {
					// console.log("INDEX (" + i + "): Switching from " + (i-1) + " to " + i);
					container.removeChild(textures[x-1]);
					container.addChild(textures[x]);
				}

				setTimeout(nextTexture, timeSoFar, i);

				if (loops) {
					setTimeout(function() {
						setInterval(nextTexture, totalTime);
					}, timeSoFar);
				}

				if (i == anim.length - 1) {
					if (loops) {
						var restartAnimation = function() {
							// console.log("Switching from " + i + " to 0");
							container.removeChild(textures[i-1]);
							container.addChild(textures[0]);
						}
						setInterval(restartAnimation, totalTime);
					}
					else {
						var clearAnimation = function(x) {
							container.removeChild(textures[x]);
						}
						setTimeout(clearAnimation, totalTime, i);
					}
				}
			}

			timeSoFar += anim[i].duration;
		}

        /*if (!_.isUndefined(this.ImageLibrary[textureImage])) {
            texture = this.ImageLibrary[textureImage];
        }
        else {
            texture = THREE.ImageUtils.loadTexture(textureImage);
            texture.magFilter = THREE.NearestFilter;
        }*/

        // var texture1 = this.CreateTextureNode(planeSizeX, planeSizeY, textureImage1, false, planeSizeX, planeSizeY, false);
        // var texture2 = this.CreateTextureNode(planeSizeX, planeSizeY, textureImage2, false, planeSizeX, planeSizeY, false);

        // container.addChild(texture1);

        // var addTexture2 = function() {
        // 	container.removeChild(texture1);
        // 	container.addChild(texture2);
        // }
        // var addTexture1 = function() {
        // 	container.removeChild(texture2);
        // 	container.addChild(texture1);
        // }

        // setTimeout(function() {
        // 	setInterval(addTexture2, 1000);
        // }, 500);

        // setInterval(addTexture1, 1000);

        return container;
    }
});

var ModelNode = function() {
	this.parent = null;
	this.children = [];
	this.obj = new THREE.Object3D();

	this.localMatrix = new THREE.Matrix4();
	this.translation = new THREE.Vector3(0,0,0);
	// this.quaternion = new THREE.Quaternion();
	this.rotation = new THREE.Euler(0,0,0,'XYZ');
	this.scaleVec = new THREE.Vector3(1,1,1);
}

_.extend(ModelNode.prototype, {
	addChild: function(child) {
		child.parent = this;
		this.obj.add(child.obj);
		this.children.push(child);
		this.obj.updateMatrixWorld(true);
	},

	removeChild: function(child) {
		var index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
        }
		this.obj.remove(child.obj);
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

	resetRotationOrder: function(newOrder) {
		this.rotation.reorder(newOrder);
		_.each(this.children, function(child) {
			child.resetRotationOrder(newOrder);
		});
	},

	applyTranslation: function(translation, updateGlobal) {
		var t = new THREE.Vector3(0,0,0);
		t.addVectors(translation, this.translation);

		this.obj.position.copy(t);

		if (_.isUndefined(updateGlobal) || updateGlobal == true) {
			this.obj.updateMatrixWorld(true);
		}

		// console.log("t: " + t.x + ", " + t.y + ", " + t.z);
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

});