var billboardsOn = true;
var toggleBillboards = false;

document.addEventListener('keydown', function(e) {
    // http://www.javascriptkit.com/javatutors/javascriptkey2.shtml
    var unicode = e.keyCode? e.keyCode : e.charCode;

    if (unicode == 66) {      // 'b' key
        toggleBillboards = true;
    }
});

var Billboard = function(width, height, location, image) {
	// Create texture, place at given location
	// this.texture = TextureMapper(width, height, image, false, width, height, false);
	this.texture = new TextureNode();
	this.texture.createObj(width, height, image, false, width, height, false);
	// this.texture.position.set(location.x, location.y, location.z);
	this.texture.translate(location.x, location.y, location.z);

	this.faceCamera();
}

_.extend(Billboard.prototype, {
	update: function(transX, transY, transZ, scale) {
		// this.texture.position.x += transX;
		// this.texture.position.y += transY;
		// this.texture.position.z += transZ;
		this.texture.translate(transX, transY, transZ);

		this.texture.scale.multiplyScalar(scale);

		this.faceCamera();
	},

	faceCamera: function() {
		if (toggleBillboards) {
			billBoardsOn = !billBoardsOn;
			toggleBillboards = false;
		}

		if (billboardsOn) {
			// TODO: Make billboards face camera
		}
	}
});