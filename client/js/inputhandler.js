//	***
//	inputhandler.js start
//	***

const makeKey = require('./key');

let IH = {};

IH.keyNames = [];
IH.keys = {};

IH.hasKey = (keyName) => (IH.keys[keyName] != null);

IH.setupKey = (keyName, keyCode, keyTriggerBits, isMouse) => {
	IH.deleteKey(keyName);
	if (isMouse === true) { IH.keys[keyName] = makeKey(keyName, keyCode, keyTriggerBits, true); }
	else { IH.keys[keyName] = makeKey(keyName, keyCode, keyTriggerBits); }
	IH.keyNames.push(keyName);
}

IH.deleteKey = (keyName) => {
	if (IH.hasKey(keyName)) {
		IH.keys[keyName].unsubscribe();
		delete IH.keys[keyName];
	}
	
	keyNameIndex = IH.keyNames.findIndex((element) => (element === keyName));
	if (keyNameIndex != null && keyNameIndex != -1) { IH.keyNames.splice(keyNameIndex, 1); }
}

IH.deleteAllKeys = () => {
	while (IH.keyNames.length > 0) { IH.deleteKey(IH.keyNames[0]); }
}

IH.isTriggered = (keyName) => {
	if (IH.hasKey(keyName)) { return IH.keys[keyName].triggered; }
	console.log("ERROR: IH.isTriggered() called for a key that does not exist ('" + keyName + "')!");
	return false;
}

IH.getState = (keyName) => {
	if (IH.hasKey(keyName)) {
		let disambiguated = IH.keys[keyName].state; // Should copy by value, not reference? I think?
		return disambiguated;
	}
	console.log("ERROR: IH.getState() called for a key that does not exist ('" + keyName + "')!");
	return 0x2;
}

IH.setup = function(canvas) {
	canvas.addEventListener('contextmenu', (e) => { e.preventDefault(); });
	
	this.setupKey('left',	65, 0xc);
	this.setupKey('right',	68, 0xc);
	this.setupKey('up',	87, 0xc);
	this.setupKey('down',	83, 0xc);
	this.setupKey('nextWeapon',		81, 0xc);
	this.setupKey('previousWeapon',	69, 0xc);
	this.setupKey('reload',	82, 0xc);
	this.setupKey('slowTime',	16, 0xc);
	this.setupKey('fire',	1,	0x1, true);
	this.setupKey('detonate',	3,	0xc, true);
}

IH.update = (deltaMS) => {
	IH.keyNames.forEach((element) => {
		IH.keys[element].step();
	});
}

module.exports = IH;