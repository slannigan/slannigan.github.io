var body, armR, armL, legR, legL, face;
var shoulderR, shoulderL, hipR, hipL;

var floorCeilingGap = 5;
var heightDiffH = 4
var heightDiffL = -4;
var unitSize = 3;
var buildingMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });

var startPosX = 2;
var startPosY = heightDiffH;

function CreateMeatBoy() {
	var meat = new THREE.MeshLambertMaterial({ color: 0xff0000 });

	body = new BoxNode();
	body.createObj(meat, 1.5, 1, 0.75);
	// body.scale(0.5, 0.5, 0.5);

	face = new TextureNode();
	face.createObj(1, 1, '../images/meatboy.png', true, 1, 1);
	body.addChild(face);
	face.translate(0, 0, 0.377);

	shoulderL = new JointNode();
	body.addChild(shoulderL);
	shoulderL.translate(0.75, 0, 0);
	shoulderL.rotate(0,0,-0.5);

	armL = new BoxNode();
	armL.createObj(meat, 0.6, 0.3, 0.3);
	shoulderL.addChild(armL);
	armL.translate(0.1, -0.15, 0);

	shoulderR = new JointNode();
	body.addChild(shoulderR);
	shoulderR.translate(-0.75, 0, 0);
	shoulderR.rotate(0,0,0.5);

	armR = new BoxNode();
	armR.createObj(meat, 0.6, 0.3, 0.3);
	shoulderR.addChild(armR);
	armR.translate(-0.1, -0.15, 0);

	hipL = new JointNode();
	body.addChild(hipL);
	hipL.translate(0.4, -0.5, 0);

	legL = new BoxNode();
	legL.createObj(meat, 0.5, 0.5, 0.5);
	hipL.addChild(legL);
	legL.translate(0, -0.05, 0);

	hipR = new JointNode();
	body.addChild(hipR);
	hipR.translate(-0.4, -0.5, 0);

	legR = new BoxNode();
	legR.createObj(meat, 0.5, 0.3, 0.5);
	hipR.addChild(legR);
	legR.translate(0, -0.15, 0);

	// Transform to starting position
	body.translate(startPosX, startPosY + 0.75 + 0.2, 0);
	body.rotate(0, Math.PI/2, 0);

	return body;
}

function AnimateTest(time) {
	// var factor = time*4;

	// var armLRotation = new THREE.Euler();
	// // var armRRotation = new THREE.Euler();
	// armLRotation.x = 0.5*Math.sin(factor);
	// armLRotation.y = 0.5*Math.sin(factor);
	// // armRRotation.x = -0.5*Math.sin(factor);

	// shoulderL.applyRotation(armLRotation);

	// var legLRotation = new THREE.Euler();
	// legLRotation.x = -0.5*Math.sin(factor);
	// hipL.applyRotation(legLRotation);
	// var legLTranslation = new THREE.Vector3(0, 0.05*Math.cos(factor) + 0.1, 0);
	// hipL.applyTranslation(legLTranslation);
	// hipL.applyTranslation(THREE.Vector3(0, 0.5*Math.cos(factor), 0));
	// shoulderR.applyRotation(armRRotation);

	// shoulderL.rotate(0.01, 0, 0);

	// shoulderL.rotate(0.5*Math.sin(factor), 0, 0);

	// shoulderR.rotation.x = -0.5*Math.sin(factor);
	// shoulderR.rotation.y = 0.5*Math.sin(factor);
	// armR.position.z = 0.1*Math.sin(factor);

	// shoulderL.rotation.x = 0.5*Math.sin(factor);
	// shoulderL.rotation.y = 0.5*Math.sin(factor);
	// armL.position.z = -0.1*Math.sin(factor);
}

function CreateBuildingBlock(length, isFlipped) {
	var boxLength = length * unitSize;
	var boxHeight = 50;
	var boxDepth = unitSize;
	var building = new BoxNode();
	building.createObj(buildingMat, boxLength, boxHeight, boxDepth);

	var buildingNode = new ModelNode();
	buildingNode.addChild(building);

	buildingNode.translate(boxLength/2, 0, 0);

	if (isFlipped) {
		building.translate(0, boxHeight/2, 0);
		building.rotate(0, Math.PI, 0);
	}
	else {
		building.translate(0, -boxHeight/2, 0);
	}

	return buildingNode;
}

function CreateBuilding(type, length, horizontalOffset) {
	if (type == "s") type = "H";
	if (type == "e") type = "l";

	var building1 = CreateBuildingBlock(length, false);
	var building2 = null;
	var verticalOffset = 0;

	if (type == "H" || type == "M" || type == "L") {
		building2 = CreateBuildingBlock(length, true);
		building2.translate(0, floorCeilingGap, 0);
	}

	if (type == "h" || type == "H") {
		verticalOffset = heightDiffH;
	}
	else if (type == "l" || type == "L") {
		verticalOffset = heightDiffL;
	}

	var group = new ModelNode();
	group.addChild(building1);
	if (!_.isNull(building2)) {
		group.addChild(building2);
	}

	group.translate(horizontalOffset*unitSize, verticalOffset, 0);
	// group.translate(horizontalOffset*unitSize, 0, 0);

	return group;
}

var tempMat = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
function CreateChainsaw(type, prevType, horizontalOffset) {
	var verticalOffset = 0;
	if (type == "C") {
		verticalOffset += floorCeilingGap;
	}

	if (prevType == "h" || prevType == "H") {
		verticalOffset += heightDiffH;
	}
	else if (prevType == "l" || prevType == "L") {
		verticalOffset += heightDiffL;
	}

	var chainsaw = new BoxNode();
	chainsaw.createObj(tempMat, unitSize*0.9, unitSize*0.9, 0.1);

	chainsaw.translate(horizontalOffset*unitSize + (unitSize/2), verticalOffset, 0);
	return chainsaw;
}

function CreateLevel(map) {
	if (_.isUndefined(map)) {
		// map = "sss.hh.mmm.l.H.M.L.eee"
		map = "ssss..hc.m.l.H.MC.L.e";
	}
	var mapNode = new ModelNode();

	for (var i = 0, mapLocation = 0; i < map.length; i++, mapLocation++) {
		var currChar = map.charAt(i);
		var lengthOfSection = 1;
		var buildingStartIndex = mapLocation;

		if (currChar == "c" || currChar == "C") {
			mapLocation--;
			var prevChar = (i == 0) ? map.charAt(0) : map.charAt(i-1);
			var chainsaw = CreateChainsaw(currChar, prevChar, mapLocation);
			mapNode.addChild(chainsaw);
			continue;
		}

		while (map.charAt(i+1) == currChar) {
			i++;
			lengthOfSection++;
			mapLocation++;
		}
		if (currChar != ".") {
			var building = CreateBuilding(currChar, lengthOfSection, buildingStartIndex);
			mapNode.addChild(building);
		}
	}
	// mapNode.translate(-20,0,0);
	return mapNode;
}