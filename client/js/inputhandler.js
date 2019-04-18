//	***
//	inputhandler.js start
//	***

const makeKey = require('./key');

let IH = class {
	constructor(canvas) {
		this.mode = 'input';
		
		this.keyNames = [];
		this.keys = {};
		
		canvas.addEventListener('contextmenu', (e) => { e.preventDefault(); });
	
		this.setupKey(0, 'right',	68, 0xc);
		this.setupKey(1, 'up',	87, 0xc);
		this.setupKey(2, 'left',	65, 0xc);
		this.setupKey(3, 'down',	83, 0xc);
		this.setupKey(4, 'nextWeapon',		81, 0xc);
		this.setupKey(5, 'previousWeapon',	69, 0xc);
		this.setupKey(6, 'reload',	82, 0xc);
		this.setupKey(7, 'slowTime',	16, 0xc);
		this.setupKey(8, 'fire',	1,	0x1, true);
		this.setupKey(9, 'detonate',	3,	0xc, true);
		
		this.lifetime = 0;
		this.events = [];
	}
	
	hasKey(keyName) {
		return (this.keys[keyName] != null);
	}
	
	setupKey(id, keyName, keyCode, keyTriggerBits, isMouse) {
		this.deleteKey(keyName);
		if (isMouse === true) { this.keys[keyName] = makeKey(id, keyName, keyCode, keyTriggerBits, true); }
		else { this.keys[keyName] = makeKey(id, keyName, keyCode, keyTriggerBits); }
		this.keyNames.push(keyName);
	}
	
	deleteKey(keyName) {
		if (this.hasKey(keyName)) {
			this.keys[keyName].unsubscribe();
			delete this.keys[keyName];
		}
		
		let keyNameIndex = this.keyNames.findIndex((element) => (element === keyName));
		if (keyNameIndex != null && keyNameIndex != -1) { this.keyNames.splice(keyNameIndex, 1); }
	}
	
	deleteAllKeys() {
		while (this.keyNames.length > 0) { this.deleteKey(this.keyNames[0]); }
	}
	
	isTriggered(keyName) {
		if (this.hasKey(keyName)) { return this.keys[keyName].triggered; }
		console.log("ERROR: IH.isTriggered() called for a key that does not exist ('" + keyName + "')!");
		return false;
	}
	
	getState(keyName) {
		if (this.hasKey(keyName)) {
			let disambiguated = this.keys[keyName].state; // Should copy by value, not reference? I think?
			return disambiguated;
		}
		console.log("ERROR: IH.getState() called for a key that does not exist ('" + keyName + "')!");
		return 0x2;
	}
	
	update(deltaS, mousePos) {
		this.lifetime += deltaS;
		
		this.keyNames.forEach((element) => {
			let event = this.keys[element].step();
			if (event != null) {
				if (this.keys[element].isMouse) { event.position = mousePos; }
				event.time = this.lifetime;
				this.events.push(event);
			}
		});
	}
};

module.exports = IH;