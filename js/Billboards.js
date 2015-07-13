var BillboardManager = function(nodeManager) {
	this.nodeManager = nodeManager;
	this.billboardsOn = true;
	this.toggleBillboards = false;

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
		var billboard = new Billboard(this.nodeManager, width, height, location, image);
		return billboard;
	}
});

var Billboard = function(nodeManager, width, height, location, image) {
	// Create texture, place at given location
	this.texture = nodeManager.CreateTextureNode(width, height, image, false, width, height, false);
	this.texture.translate(location.x, location.y, location.z);

	this.faceCamera();
}

_.extend(Billboard.prototype, {
	update: function(transX, transY, transZ, scale) {
		this.texture.translate(transX, transY, transZ);
		this.texture.scale(scale, scale, scale);

		this.faceCamera();
	},

	faceCamera: function() {
		if (this.toggleBillboards) {
			this.billBoardsOn = !this.billBoardsOn;
			this.toggleBillboards = false;
		}

		if (this.billboardsOn) {
			// TODO: Make billboards face camera
		}
	}
});