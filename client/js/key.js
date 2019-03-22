//	***
//	key.js start
//	***

/*
 *	Key state / Trigger bits:
 *	1	:	0x1	:	OnRelease
 *	2	:	0x2	:	Released
 *	4	:	0x4	:	Pressed
 *	8	:	0x8	:	OnPress
 *	Construct 'trigger bits' by adding up all key states that should act as triggered.
*/


class Key {
	constructor(name, code, triggerBits) {
		if (name != null) { this.name = name; }
		else {
			this.name = 'unnamed';
			console.log('Warning! Key constructor called with no name!');
		}
		
		if (code != null) { this.code = code; }
		else {
			this.code = 85; // 'U', for 'unbound'.
			console.log('Warning! Key constructor called with no code!');
		}
		
		if (triggerBits != null) { this.triggerBits = triggerBits; } 
		else { this.triggerBits = 0xc; } // Defaults to triggering on any pressed.
		
		this.state = 0x2;
		
		this.downListener = null;
		this.upListener = null;
	}
	
	get triggered() {
		if (this.state & this.triggerBits) { return true; }
		return false;
	}
	
	step() {
		// Call this at the end of each update cycle, in order to pregress key state.
		if (this.state === 0x8) { this.state = 0x4; } // If OnPress, progress to Pressed.
		if (this.state === 0x1) { this.state = 0x2; } // If OnRelease, progress to Released.
	}
	
	downHandler(event) {
		if (event.keyCode === this.code) {
			if (this.state & 0x3) {
				this.state = 0x8;
			}
			event.preventDefault();
		}
	}
	
	upHandler(event) {
		if (event.keyCode === this.code) {
			if (this.state & 0xc) {
				this.state = 0x1;
			}
			event.preventDefault();
		}
	}
	
	downMouseHandler(event) {
		if (event.which === this.code) {
			if (this.state & 0x3) {
				this.state = 0x8;
			}
			event.preventDefault();
		}
	}
	
	upMouseHandler(event) {
		if (event.which === this.code) {
			if (this.state & 0xc) {
				this.state = 0x1;
			}
			event.preventDefault();
		}
	}
	
	unsubscribe() {
		if (this.downListener != null) { window.removeEventListener("keydown", this.downListener); }
		if (this.upListener != null) { window.removeEventListener("keyup", this.upListener); }
	}
}

function makeKey(name, code, triggerBits, isMouse) {
	let retKey = new Key(name, code, triggerBits);
	
	if (isMouse === true) {
		retKey.downListener = retKey.downMouseHandler.bind(retKey);
		retKey.upListener = retKey.upMouseHandler.bind(retKey);
		
		window.addEventListener("mousedown", retKey.downListener, false);
		window.addEventListener("mouseup", retKey.upListener, false);
	}
	else {
		retKey.downListener = retKey.downHandler.bind(retKey);
		retKey.upListener = retKey.upHandler.bind(retKey);
		
		window.addEventListener("keydown", retKey.downListener, false);
		window.addEventListener("keyup", retKey.upListener, false);
	}
	
	return retKey;
}

module.exports = makeKey;