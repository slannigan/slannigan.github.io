window.BillboardManager = function(nodeManager, camera) {
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
	// this.location.x += width/2;
	// this.location.y += height/2;

	// Create texture, place at given location
	this.texture = nodeManager.CreateTextureNode(width, height, image, false, width, height, false);
	this.texture.translate(location.x, location.y, location.z);
	// this.texture.translate(width/2, 0,0);

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
			var camPos = this.manager.camera.position;

			var deltaX = camPos.x - this.location.x;
			var deltaY = camPos.y - this.location.y;
			var deltaZ = camPos.z - this.location.z;

			var angleX = -Math.atan(deltaY/deltaZ);
			var angleY = Math.atan(deltaX/deltaZ);

			var rotation = new THREE.Euler(angleX,angleY,0);
			this.texture.applyRotation(rotation);
		}
	}
});