var BillboardManager = function(nodeManager, camera) {
	this.nodeManager = nodeManager;
	this.camera = camera;

	this.billboardsOn = true;
	this.toggleBillboards = false;

	this.up = new THREE.Vector3(0,1,0);
	this.normal = new THREE.Vector3(0,0,1);

	var self = this;

	document.addEventListener('keydown', function(e) {
	    // http://www.javascriptkit.com/javatutors/javascriptkey2.shtml
	    var unicode = e.keyCode? e.keyCode : e.charCode;

	    if (unicode == 66) {      // 'b' key
	        self.toggleBillboards = true;
	    }
	});
}

_.extend(BillboardManager.prototype, {
	CreateBillboard: function(width, height, location, image) {
		var billboard = new Billboard(this, this.nodeManager, width, height, location, image);
		return billboard;
	}
});

var Billboard = function(billboardManager, nodeManager, width, height, location, image) {
	this.manager = billboardManager;
	this.location = location;

	// Create texture, place at given location
	this.texture = nodeManager.CreateTextureNode(width, height, image, false, width, height, false);
	this.texture.translate(location.x, location.y, location.z);

	this.faceCamera();
}

_.extend(Billboard.prototype, {
	update: function(transX, transY, transZ, scale) {
		// console.log("Updating");
		this.location.x += transX;
		this.location.y += transY;
		this.location.z += transZ;
		this.texture.translate(transX, transY, transZ);
		this.texture.scale(scale, scale, scale);

		this.faceCamera();
	},

	faceCamera: function() {
		if (this.manager.toggleBillboards) {
			this.manager.billBoardsOn = !this.manager.billBoardsOn;
			this.manager.toggleBillboards = false;
		}

		if (this.manager.billboardsOn) {
			// TODO: Make billboards face camera
			// var cameraVector = new THREE.Vector3();
			// cameraVector.subVectors(this.manager.camera.position, this.location);
			// cameraVector.normalize();

			// var rotation = new THREE.Euler(-cameraVector.x,cameraVector.y,0,'XYZ');
			var lookat = new THREE.Matrix4();
			lookat.lookAt(this.location, this.manager.camera.position, this.manager.up);
			lookat.lookAt(this.manager.camera.position, this.location, this.manager.up);
			// lookat.
			var rotation = new THREE.Euler();
			rotation.setFromRotationMatrix(lookat);
			this.texture.applyRotation(rotation);

			// console.log("Rotation matrix: " + rotation.x + ", " + rotation.y + ", " + rotation.z);
			// this.texture.rotate(0.01,0,0);
		}
	}
});