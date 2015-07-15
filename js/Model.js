var ModelManager = function(nodeManager, scene) {
	this.nodeManager = nodeManager;
	this.scene = scene;
	this.game;

	// Character geometry
	this.body;
	this.armR;
	this.armL;
	this.legR;
	this.legL;
	this.face;

	// Character joints/nodes
	this.characterNode = this.nodeManager.CreateModelNode();
	this.shoulderR;
	this.shoulderL;
	this.hipR;
	this.hipL;

	// Building and chainsaw objects
	this.chainsaws = [];

	// Map characteristics
	this.floorCeilingGap = 6;
	this.heightDiffH = 6;
	this.heightDiffL = -6;
	this.unitSize = 3;
	this.buildingMat = new THREE.MeshLambertMaterial({ color: 0x8d8a9f });
	this.bgWidth = 2048;
	this.bgHeight = 512;

	// Character characteristics
	this.startPosX = 2;
	this.startPosY = this.heightDiffH;
	this.startPos = new THREE.Vector3(this.startPosX, this.startPosY + 0.75 + 0.2, 0);
	this.meat = new THREE.MeshLambertMaterial({ color: 0xbf000b });
	this.alive = true;

	// Other
	this.inf = 1000;
}

// Character related functions
_.extend(ModelManager.prototype, {
	KillCharacter: function() {
		// this.characterNode.obj.remove(this.body.obj);
		console.log("Killing character");
		this.scene.remove(this.characterNode.obj);
		this.alive = false;
	},

	CreateMeatBoy: function() {
		this.body = this.nodeManager.CreateBoxNode(this.meat, 1.5, 1, 0.75);
		this.characterNode.addChild(this.body);

		this.face = this.nodeManager.CreateTextureNode(1.5, 1.5, 'face', true, 1.5, 1.5, false);
		this.body.addChild(this.face);
		this.face.translate(0, 0, 0.377);

		this.shoulderL = this.nodeManager.CreateJointNode();
		this.body.addChild(this.shoulderL);
		this.shoulderL.translate(0.75, 0, 0);
		this.shoulderL.rotate(0,0,-0.5);

		this.armL = this.nodeManager.CreateBoxNode(this.meat, 0.6, 0.3, 0.3);
		this.shoulderL.addChild(this.armL);
		this.armL.translate(0.1, -0.15, 0);

		this.shoulderR = this.nodeManager.CreateJointNode();
		this.body.addChild(this.shoulderR);
		this.shoulderR.translate(-0.75, 0, 0);
		this.shoulderR.rotate(0,0,0.5);

		this.armR = this.nodeManager.CreateBoxNode(this.meat, 0.6, 0.3, 0.3);
		this.shoulderR.addChild(this.armR);
		this.armR.translate(-0.1, -0.15, 0);

		this.hipL = this.nodeManager.CreateJointNode();
		this.body.addChild(this.hipL);
		this.hipL.translate(0.4, -0.5, 0);

		this.legL = this.nodeManager.CreateBoxNode(this.meat, 0.5, 0.5, 0.5);
		this.hipL.addChild(this.legL);
		this.legL.translate(0, -0.05, 0);

		this.hipR = this.nodeManager.CreateJointNode();
		this.body.addChild(this.hipR);
		this.hipR.translate(-0.4, -0.5, 0);

		this.legR = this.nodeManager.CreateBoxNode(this.meat, 0.5, 0.3, 0.5);
		this.hipR.addChild(this.legR);
		this.legR.translate(0, -0.15, 0);

		// Transform to starting position
		this.body.translate(this.startPosX, this.startPosY + 0.75 + 0.2, 0);
		this.body.resetRotationOrder('ZYX');
		this.body.rotate(0, Math.PI/2, -0.25);

		this.scene.add(this.characterNode.obj);
		return this.characterNode;
	},

	ResetCharacter: function() {
		// this.characterNode.applyTran
		console.log("Resetting character");
		if (this.alive = true) {
			this.KillCharacter();
		}
		this.characterNode = this.nodeManager.CreateModelNode();
		// this.CreateMeatBoy();
		this.characterNode.addChild(this.body);
		this.scene.add(this.characterNode.obj);
		this.alive = true;

		return this.characterNode;
	},

	AnimateTest: function(time) {
		var factor = time*24;

		if (this.alive) {
			// Meat Boy
			var armLRotation = new THREE.Euler();
			armLRotation.x = 0.5*Math.sin(factor);
			armLRotation.y = 0.5*Math.sin(factor);

			this.shoulderL.applyRotation(armLRotation);

			var legLRotation = new THREE.Euler();
			legLRotation.x = -0.5*Math.sin(factor);
			this.hipL.applyRotation(legLRotation);
			var legLTranslation = new THREE.Vector3(0, 0.05*Math.cos(factor) + 0.1, 0);
			this.hipL.applyTranslation(legLTranslation);

			var armRRotation = new THREE.Euler();
			armRRotation.x = -0.5*Math.sin(factor);
			armRRotation.y = -0.5*Math.sin(factor);

			this.shoulderR.applyRotation(armRRotation);

			var legRRotation = new THREE.Euler();
			legRRotation.x = 0.5*Math.sin(factor);
			this.hipR.applyRotation(legRRotation);
			var legRTranslation = new THREE.Vector3(0, 0.05*Math.cos(factor) + 0.1, 0);
			this.hipR.applyTranslation(legLTranslation);
		}

		// Chainsaws
		_.each(this.chainsaws, function(chainsaw) {
			chainsaw.rotate(0,0,-0.1);
		});
	}
});

// Level/map related functions
_.extend(ModelManager.prototype, {
	SetGame: function(game) {
		this.game = game;
	},

	CreateBuildingBlock: function(length, isFlipped) {
		var boxLength = length * this.unitSize;
		var boxHeight = 30;
		var boxDepth = this.unitSize;
		var building = this.nodeManager.CreateBoxNode(this.buildingMat, boxLength, boxHeight, boxDepth);

		// Textures
		var front = this.nodeManager.CreateTextureNode(boxLength, boxHeight, "brick", true, this.unitSize, this.unitSize, false);
		front.translate(0,0,(boxDepth/2) + 0.001)
		building.addChild(front);

		var right = this.nodeManager.CreateTextureNode(boxDepth, boxHeight, "brick", true, this.unitSize, this.unitSize, false);
		right.rotate(0, Math.PI/2, 0);
		right.translate((boxLength/2) + 0.001, 0, 0);
		building.addChild(right);

		var left = this.nodeManager.CreateTextureNode(boxDepth, boxHeight, "brick", true, this.unitSize, this.unitSize, false);
		left.rotate(0, -Math.PI/2, 0);
		left.translate(-((boxLength/2) + 0.001), 0, 0);
		building.addChild(left);

		var buildingNode = this.nodeManager.CreateModelNode();
		buildingNode.addChild(building);

		buildingNode.translate(boxLength/2, 0, 0);

		if (isFlipped) {
			building.translate(0, boxHeight/2, 0);
		}
		else {
			building.translate(0, -boxHeight/2, 0);
		}

		return buildingNode;
	},

	CreateBuilding: function(type, length, horizontalOffset) {
		if (type == "s") type = "H";
		if (type == "e") type = "l";

		var building1 = this.CreateBuildingBlock(length, false);
		var building2 = null;
		var verticalOffset = 0;

		if (type == "H" || type == "M" || type == "L") {
			building2 = this.CreateBuildingBlock(length, true);
			building2.translate(0, this.floorCeilingGap, 0);
		}

		if (type == "h" || type == "H") {
			verticalOffset = this.heightDiffH;
		}
		else if (type == "l" || type == "L") {
			verticalOffset = this.heightDiffL;
		}

		var minX = horizontalOffset * this.unitSize;
		var maxX = (horizontalOffset + length) * this.unitSize;

		for (var i = horizontalOffset; i < horizontalOffset + length; i ++) {
			this.game.addBoundingBox(i, minX, maxX, -this.inf, verticalOffset);
			if (!_.isNull(building2)) {
				this.game.addBoundingBox(i, minX, maxX, verticalOffset + this.floorCeilingGap, this.inf);
			}
		}

		var group = this.nodeManager.CreateModelNode();
		group.addChild(building1);
		if (!_.isNull(building2)) {
			group.addChild(building2);
		}

		group.translate(horizontalOffset * this.unitSize, verticalOffset, 0);
		// group.translate(horizontalOffset*unitSize, 0, 0);

		return group;
	},

	CreateChainsaw: function(type, prevType, horizontalOffset, scale) {
		var verticalOffset = -0.5;
		if (type == "C") {
			verticalOffset += this.floorCeilingGap + 1;
		}

		if (prevType == "h" || prevType == "H") {
			verticalOffset += this.heightDiffH;
		}
		else if (prevType == "l" || prevType == "L") {
			verticalOffset += this.heightDiffL;
		}
		
		var diameter = this.unitSize * 0.9 * scale;
		var chainsaw = this.nodeManager.CreateTextureNode(diameter, diameter, "saw", false, diameter, diameter, false);
		chainsaw.translate(horizontalOffset * this.unitSize + (this.unitSize/2), verticalOffset, 0);
		this.chainsaws.push(chainsaw);

		// console.log("Creating bounding circle at offset " + horizontalOffset + ", x, y, d: " + chainsaw.translation.x + ", " + chainsaw.translation.y + ", " + diameter);
		this.game.addBoundingCircle(horizontalOffset, chainsaw.translation.x, chainsaw.translation.y, diameter/2)

		return chainsaw;
	},

	CreateLevel: function(map) {
		if (_.isUndefined(map)) {
			// map = "sss.hh.mmm.l.H.M.L.eee"
			// map = "ssss.hc.m.l.H.MC.L.e";
			// map = "HHHHHHH.lllll..ll.LL.ll...llllllllllllllllllllllllllllllllllllllllllllllllll";
			// map = "HHHHHHHHHHMMMMM";
			// map = "lllllllcllllHHHHHHlllllllllllllllllllllllllllllllllllll";
			map = "HHHHHHH..lllllllll..llllllcllllll...MMMMMMMcMMMCMMMcMMMMMMMM...lllllcHHH..."
			// map = "HHHHHHHHHHHHCHHHHHHLLL"
		}

		var mapNode = this.nodeManager.CreateModelNode();

		if (!_.isUndefined(this.game)) {
			this.game.storeMapInfo(map, this.unitSize, this.startPosX, this.startPosY)
		}

		for (var i = 0, mapLocation = 0; i < map.length; i++, mapLocation++) {
			var currChar = map.charAt(i);
			var lengthOfSection = 1;
			var buildingStartIndex = mapLocation;

			if (currChar == "c" || currChar == "C") {
				mapLocation--;
				var prevChar = (i == 0) ? map.charAt(0) : map.charAt(i-1);
				var chainsaw = this.CreateChainsaw(currChar, prevChar, mapLocation, 2);
				mapNode.addChild(chainsaw);
				continue;
			}

			while (map.charAt(i+1) == currChar) {
				i++;
				lengthOfSection++;
				mapLocation++;
			}
			if (currChar != ".") {
				var building = this.CreateBuilding(currChar, lengthOfSection, buildingStartIndex);
				mapNode.addChild(building);
			}
		}

		// Background 
		var bg1 = this.nodeManager.CreateTextureNode(this.bgWidth, this.bgHeight, 'bg1', false, this.bgWidth, this.bgHeight, true);
		mapNode.addChild(bg1);
		bg1.translate(700,-150,-350);

		var bg2 = this.nodeManager.CreateTextureNode(this.bgWidth*3, this.bgHeight, 'bg2', true, this.bgWidth, this.bgHeight, true);
		mapNode.addChild(bg2);
		bg2.translate(2000, -50, -800);

		// mapNode.translate(-20,0,0);
		this.scene.add(mapNode.obj);
		return mapNode;
	}
});