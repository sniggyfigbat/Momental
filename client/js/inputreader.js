//	***
//	inputreader.js start
//	***

let IR = class {
	constructor(levelName, runID) {
		this.mode = 'output';
		this.ready = false;
		
		this.lifetime = 0;
		this.nextEventIndex = 0;
		
		this.keyIDs = {};
		this.keyNames = [];
		this.keyStates = [];
		this.keyTriggerBits = [];
		this.keyIsMouse = [];
		
		this.setupKey(0, 'right',			0xc);
		this.setupKey(1, 'up',				0xc);
		this.setupKey(2, 'left',			0xc);
		this.setupKey(3, 'down',			0xc);
		this.setupKey(4, 'nextWeapon',		0xc);
		this.setupKey(5, 'previousWeapon',	0xc);
		this.setupKey(6, 'reload',			0xc);
		this.setupKey(7, 'slowTime',		0xc);
		this.setupKey(8, 'fire',			0x1, true);
		this.setupKey(9, 'detonate',		0xc, true);
		
		this.events = null;
		this.victoryRunTime = null;
	
		let fetchLevelProm = fetch('./runs/' + runID + '.json').then(
		(response) => {
				if (response.status !== 200) {
					console.log("Issue loading replay file '" + runID + "' from server. Status Code: " + response.status);
					return;
				}
				
				return response;
			}
		).then(function(response) {
			return response.json();
		}).then(function(runData) {
			if (runData.levels && runData.levels.findIndex) {
				let index = runData.levels.findIndex((element) => element.id == levelName));
				if (index == null || index === -1) { console.log("ERROR: Issue with parsed runData in IR; could not find specified level."); }
				else {
					if (runData.levels[index].victoryRunInputs) {
						this.events = runData.levels[index].victoryRunInputs;
						this.victoryRunTime = runData.levels[index].victoryRunTime;
						this.ready = true;
					}
					else { console.log("ERROR: Issue with parsed runData in IR; No event data in specified level."); }
				}
			}
			else { console.log("ERROR: Issue with parsed runData in IR; no valid levels array."); }
		}).catch(function(err) {
			console.log('Fetch Error: ', err);
		});
	}
	
	setupKey(id, name, triggerBits, isMouse) {
		this.keyIDs.name = id;
		
		this.keyNames[id] = name;
		this.keyStates[id] = 0x2;
		this.keyTriggerBits[id] = triggerBits;
		this.keyIsMouse[i] = isMouse ? true : false;
	}
	
	hasKey(keyName) {
		return (this.keyIDs[keyName] != null);
	}
	
	isTriggered(keyName) {
		if (this.hasKey(keyName)) {
			let keyID = this.keyIDs[keyName];
			if (this.keyStates[keyID].state & this.keyTriggerBits[keyID]) { return true; }
			return false;
		}
		console.log("ERROR: IH.isTriggered() called for a key that does not exist ('" + keyName + "')!");
		return false;
	}
	
	getState(keyName) {
		if (this.hasKey(keyName)) {
			let disambiguated = this.keyStates[this.keyIDs[keyName]]; // Should copy by value, not reference? I think?
			return disambiguated;
		}
		console.log("ERROR: IH.getState() called for a key that does not exist ('" + keyName + "')!");
		return 0x2;
	}
	
	update(deltaS, mousePos) {
		this.lifetime += deltaS;
		
		if (this.nextEventIndex < this.events.length) {
			// Tick all states.
			for (let i = 0; i < this.keyStates; i++) {
				if (this.keyStates[i] == 0x8) { this.keyStates[i] = 0x4; }
				if (this.keyStates[i] == 0x1) { this.keyStates[i] = 0x2; }
			}
			
			// Read events
			let keepChecking = true;
			while (this.nextEventIndex < this.events.length && keepChecking) {
				if (this.events[this.nextEventIndex].time <= this.lifetime) {
					this.keyStates[this.events[this.nextEventIndex].id] = this.events[this.nextEventIndex].state;
					if (this.keyIsMouse[this.events[this.nextEventIndex].id] && this.events[this.nextEventIndex].position) {
						mousePos.x = this.events[this.nextEventIndex].position.x;
						mousePos.y = this.events[this.nextEventIndex].position.y;
					}
					
					this.nextEventIndex++;
				}
				else { keepChecking = false; }
			}
		}
	}
}