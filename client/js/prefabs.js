//	***
//	prefabs.js start
//	***

let Sprite = PIXI.Sprite,
	Vec2 = planck.Vec2,
	gameplayTex = PIXI.Loader.shared.resources["assets/gameplay.json"].textures,
	particleTex = PIXI.Loader.shared.resources["assets/particles.json"].textures;

let visuals = require('./visuals');
	
let prefabs = {};

//	***
//	Define mixins.
//	***

prefabs.mixins = {};

//	***
//	Level-reading mixins.
//	***

prefabs.mixins['loading_90rot'] = (superclass) => class extends superclass {
	translateOptions(bitA, bitB) {
		let opts = super.translateOptions(bitA, bitB);
		let mult = (bitA && 0x06) >>> 1;
		opts.rotation = utils.PI * 0.5 * mult;
		return opts;
	}
}

//	***
//	Core mixins.
//	***

prefabs.mixins['leavestrail'] = (superclass) => class extends superclass {
	setup(options) {
		if (super.setup) super.setup(options);
		
		let thickness =	this._trailThickness	|| 0.5;
		let lifespan =	this._trailLifespan		|| 0.5;
		let colour =	this._trailColour		|| 0xff0000;
		let alpha =		this._trailAlpha		|| 0.25;
		
		this.trail = new visuals.trail(this, thickness, lifespan, colour, alpha);
	}
}

prefabs.mixins['takes_damage'] = (superclass) => class extends superclass {
	setup(options) {
		this.maxHP	= (options.maxHP != null)	? options.maxHP	: 35;
		this.HP		= (options.HP != null)		? options.HP	: this.maxHP;
		
		this._delayBeforeRegen = 1;
		this._timeSinceLastDamage = this._delayBeforeRegen;
		
		if (super.setup) super.setup(options);
	}
	
	damage(lostHP) {
		this._timeSinceLastDamage = 0;
		this.HP -= lostHP;
		if (this.HP < 0) {
			this.HP = 0;
			this.destroy(false);
		}
	}
	
	update(deltaMS) {
		let deltaS = deltaMS * 0.001;
		
		if (this._timeSinceLastDamage < this._delayBeforeRegen) {
			let temp = this._timeSinceLastDamage + deltaS;
			if (temp > this._delayBeforeRegen) {
				this._timeSinceLastDamage = this._delayBeforeRegen;
				deltaS = temp - this._delayBeforeRegen; // Get overflow for HP calc, I guess.
			}
			else { this._timeSinceLastDamage = temp; }
		}
		
		if (this._timeSinceLastDamage == this._delayBeforeRegen && this.HP < this.maxHP) {
			this.HP += 20 * deltaS; // That's right! It regens 20HP a second! Yikes!
			if (this.HP > this.maxHP) { this.HP = this.maxHP; }
		}
		
		if (super.update) super.update(deltaMS);
	}
}

prefabs.mixins['player'] = (superclass) => class extends superclass {
	setup(options) {
		options = (options != null) ? options : {};
		
		this.canSlowTime = true; //(options.canSlowTime == true);
		this.slowingTime = false;
		
		this.sprites.body = this.sprites.children[0]; // Order may be changed post-setup according to z-height, so make a permanent link.
		this.sprites.jumpField = this.sprites.children[1];
		this.sprites.pullField = this.sprites.children[2];
		
		// Build weapons
		this.currentWeapon = null;
		this.ammo = (options.startingAmmo != null) ? options.startingAmmo : 0;
		if (options.hasShotgun == true) {
			this.shotgun = this.GP.makeObject('weapon_shotgun', this.name + '_weapon_shotgun', this.position, 0, {
				hasAmmo: !(options.shotgunStartsWithAmmo === false)
			});
			this.shotgun.player = this;
			if (this.currentWeapon == null) {
				this.currentWeapon = 'shotgun';
				this.shotgun.active = true;
				this._trailColour = this.shotgun.readyTint;
			}
			else { this.shotgun.active = false; }
		}
		
		if (options.hasLauncher == true) {
			this.launcher = this.GP.makeObject('weapon_launcher', this.name + '_weapon_launcher', this.position, 0, {
				hasAmmo: !(options.launcherStartsWithAmmo === false)
			});
			this.launcher.player = this;
			if (this.currentWeapon == null) {
				this.currentWeapon = 'launcher';
				this.launcher.active = true;
				this._trailColour = this.launcher.readyTint;
			}
			else { this.launcher.active = false; }
		}
		
		if (options.hasTesla == true) {
			this.tesla = this.GP.makeObject('weapon_tesla', this.name + '_weapon_tesla', this.position, 0, {
				hasAmmo: !(options.teslaStartsWithAmmo === false)
			});
			this.tesla.player = this;
			if (this.currentWeapon == null) {
				this.currentWeapon = 'tesla';
				this.tesla.active = true;
				this._trailColour = this.tesla.readyTint;
			}
			else { this.tesla.active = false; }
		}
		
		// Build Jumpfields
		this.hasJumpField = (options.hasJumpField == true);
		this.sprites.jumpField.visible = false;
		this.jumpFieldExtension = 0.75;
		this.jumpFieldRange = 3;
		
		/*if (options.hasJumpField == true) {
			this.jumpfields = [];
			for (let i = 0; i < 32; i++) {
				let fieldRot = i * (utils.PI/16)
				this.jumpfields.push(this.GP.makeObject('player_jumpfield', 'player_jumpfield_' + i, this.position, fieldRot, {
					player: this
				}));
			}
		}*/
		
		// Build Pullfield
		this.hasPullField = (options.hasPullField == true);
		this.sprites.pullField.visible = false;
		this.pullFieldExtension = 0.75;
		this.pullFieldRange = 3;
		
		if (super.setup) super.setup(options);
	}
	
	update(deltaMS) {
		if (super.update) super.update(deltaMS);
		
		let deltaS = deltaMS * 0.001;	
		let left =	this.GP.IH.isTriggered('left'),
			right =	this.GP.IH.isTriggered('right'),
			//upState =	this.GP.IH.getState('up'),
			up =	this.GP.IH.isTriggered('up'),
			down =	this.GP.IH.isTriggered('down'),
			nextWep =		this.GP.IH.isTriggered('nextWeapon'),
			previousWep =	this.GP.IH.isTriggered('previousWeapon'),
			fireState =		this.GP.IH.getState('fire'),
			slowTime =	this.GP.IH.isTriggered('slowTime'),
			reload =	this.GP.IH.isTriggered('reload');
		
		// Decrement timers
		/*if (this.weaponSwitchTime > -1) {
			this.weaponSwitchTime -= deltaMS;
			this.weaponSwitchTime = (this.weaponSwitchTime <= 0) ? -1 : this.weaponSwitchTime;
		}*/
		
		// Weapon switching
		// This is hella ugly, but I can't quite be bothered to assign indices and generally be cleverer.
		if (this.currentWeapon != null && this[this.currentWeapon] != null && this[this.currentWeapon].isSwitching !== true) {
			let current = this.currentWeapon;
			let newWep = null;
			
			if (nextWep) {
				if (current === 'shotgun') {
					if (this.launcher != null) { newWep = 'launcher'; }
					else if (this.tesla != null) { newWep = 'tesla'; }
				}
				else if (current === 'launcher') {
					if (this.tesla != null) { newWep = 'tesla'; }
					else if (this.shotgun != null) { newWep = 'shotgun'; }
				}
				else if (current === 'tesla') {
					if (this.shotgun != null) { newWep = 'shotgun'; }
					else if (this.launcher != null) { newWep = 'launcher'; }
				}
			}
			else if (previousWep) {
				if (current === 'shotgun') {
					if (this.tesla != null) { newWep = 'tesla'; }
					else if (this.launcher != null) { newWep = 'launcher'; }
				}
				else if (current === 'launcher') {
					if (this.shotgun != null) { newWep = 'shotgun'; }
					else if (this.tesla != null) { newWep = 'tesla'; }
				}
				else if (current === 'tesla') {
					if (this.launcher != null) { newWep = 'launcher'; }
					else if (this.shotgun != null) { newWep = 'shotgun'; }
				}
			}
			
			if (newWep != null && newWep != current) {
				// Actually switch!
				this[current].active = false;
				this[newWep].active = true;
				this.currentWeapon = newWep;
				
				this.trail.setColour(this[newWep].readyTint);
			}
		}
		
		// Handle weapons
		if (this.currentWeapon != null && this[this.currentWeapon] != null) {
			let current = this[this.currentWeapon];
			let mouse = this.GP.app.renderer.plugins.interaction.mouse;
			
			current.position = this.position;
			
			let wepPos = new PIXI.Point(0, 0);
			current.sprites.getGlobalPosition(wepPos, false);
			current.rotation = -utils.rotateToPoint(mouse.global, wepPos);
			
			if (reload) { current.reload(); }
		}
		if (this.shotgun != null)	{ this.shotgun.update (	deltaMS, {fireState: fireState}); }
		if (this.launcher != null)	{ this.launcher.update (deltaMS, {fireState: fireState}); }
		if (this.tesla != null)		{ this.tesla.update (	deltaMS, {fireState: fireState}); }
		
		
		// Jumping
		/*if (this.jumpfields != null) {
			if (upState === 0x08) {
				this.jumpfields.forEach((element) => {
					element.joint.setMotorSpeed(10);
				});
			}
			if (upState === 0x01) {
				this.jumpfields.forEach((element) => {
					element.joint.setMotorSpeed(-10);
				});
			}
			this.jumpfields.forEach((element) => { element.update(deltaMS); });
		}*/
		
		// Jumpfield
		if (this.hasJumpField) {
			if (up && this.jumpFieldExtension < this.jumpFieldRange) {
				this.jumpFieldExtension += deltaS * 8;
				if (this.jumpFieldExtension > this.jumpFieldRange) {this.jumpFieldExtension = this.jumpFieldRange; }
			}
			if (!up && this.jumpFieldExtension > 0.75) {
				this.jumpFieldExtension -= deltaS * 8;
				if (this.jumpFieldExtension < 0.75) {this.jumpFieldExtension = 0.75; }
			}
			
			let scale = utils.getSpriteScale(this.GP, 128, this.jumpFieldExtension);
			this.sprites.jumpField.scale.set(scale, scale);
			
			if (this.jumpFieldExtension === 0.75) { this.sprites.jumpField.visible = false; }
			else {
				this.sprites.jumpField.visible = true;
				
				let checkRange = this.GP.relGU2M(this.jumpFieldExtension + 1);
				let jumpRange = this.GP.relGU2M(this.jumpFieldExtension * 0.5);
				let jumpRangeP = this.GP.relGU2P(this.jumpFieldExtension * 0.5);
				let jumpRangeSquared = jumpRange * jumpRange;
				
				let mass = this.body.getMass();
				let posM = this.body.getPosition();
				let posP = this.GP.absM2P(posM);
				
				let lower = posM.clone().sub(Vec2(checkRange, checkRange));
				let upper = posM.clone().add(Vec2(checkRange, checkRange));
				let aabb = planck.AABB(lower, upper);
				let foundBodies = [];
				this.GP.world.queryAABB(aabb, (fixture) => {
					// If an applicable target, and not already on the list, add to list.
					if (fixture.m_filterCategoryBits & 0xffb4) {
						let body = fixture.getBody();
						let isSubAssembly = false;
						
						if (body.gameobject != null) {
							if (body.gameobject.hasTag('subassembly')) { isSubAssembly = true; }
						}
						
						if (!isSubAssembly) {
							let isFound = foundBodies.find((element) => element === body);
							if (isFound != null && isFound !== -1) {
								// Hey this is actually working!
								let temp = 0;
							}
							else { foundBodies.push(body); }
						}
					}
				});
				
				// Jump stuff towards player, jump player towards stuff.
				foundBodies.forEach((element) => {
					let elemPos = element.getPosition().clone().add(element.getLocalCenter());
					let elemMass = element.getMass();
					let otherStatic = (elemMass === 0);
					
					let relative = elemPos.clone().sub(posM);
					if (relative.lengthSquared() <= jumpRangeSquared) {
						let attrForce = 3 * deltaS;
						let playerImpPow = otherStatic ? 200 * attrForce : elemMass * attrForce;
						let otherImpPow = mass * attrForce;
						
						let playerImp = relative.clone();
						playerImp.normalize();
						
						let otherImp = playerImp.clone();
						
						playerImp.mul(-playerImpPow);
						otherImp.mul(otherImpPow);
						
						if (!otherStatic) { element.applyLinearImpulse(otherImp, elemPos, true); }
						this.body.applyLinearImpulse(playerImp, posM, true);
					}
				});
			}
		}
		
		// Pullfield
		if (this.hasPullField) {
			if (down && this.pullFieldExtension < this.pullFieldRange) {
				this.pullFieldExtension += deltaS * 8;
				if (this.pullFieldExtension > this.pullFieldRange) {this.pullFieldExtension = this.pullFieldRange; }
			}
			if (!down && this.pullFieldExtension > 0.75) {
				this.pullFieldExtension -= deltaS * 8;
				if (this.pullFieldExtension < 0.75) {this.pullFieldExtension = 0.75; }
			}
			
			let scale = utils.getSpriteScale(this.GP, 128, this.pullFieldExtension);
			this.sprites.pullField.scale.set(scale, scale);
			
			if (this.pullFieldExtension === 0.75) { this.sprites.pullField.visible = false; }
			else {
				this.sprites.pullField.visible = true;
				
				let checkRange = this.GP.relGU2M(this.pullFieldExtension + 1);
				let pullRange = this.GP.relGU2M(this.pullFieldExtension * 0.5);
				let pullRangeP = this.GP.relGU2P(this.pullFieldExtension * 0.5);
				let pullRangeSquared = pullRange * pullRange;
				
				let mass = this.body.getMass();
				let posM = this.body.getPosition();
				let posP = this.GP.absM2P(posM);
				
				let lower = posM.clone().sub(Vec2(checkRange, checkRange));
				let upper = posM.clone().add(Vec2(checkRange, checkRange));
				let aabb = planck.AABB(lower, upper);
				let foundBodies = [];
				this.GP.world.queryAABB(aabb, (fixture) => {
					// If an applicable target, and not already on the list, add to list.
					if (fixture.m_filterCategoryBits & 0xfff4) {
						let body = fixture.getBody();
						let isSubAssembly = false;
						
						if (body.gameobject != null) {
							if (body.gameobject.hasTag('subassembly')) { isSubAssembly = true; }
						}
						
						if (!isSubAssembly) {
							let isFound = foundBodies.find((element) => element === body);
							if (isFound != null && isFound !== -1) {
								// Hey this is actually working!
								let temp = 0;
							}
							else { foundBodies.push(body); }
						}
					}
				});
				
				// Pull stuff towards player, pull player towards stuff.
				foundBodies.forEach((element) => {
					let elemPos = element.getPosition().clone().add(element.getLocalCenter());
					let elemMass = element.getMass();
					let otherStatic = (elemMass === 0);
					
					let relative = elemPos.clone().sub(posM);
					if (relative.lengthSquared() <= pullRangeSquared) {
						let attrForce = 2 * deltaS;
						let playerImpPow = otherStatic ? 100 * attrForce : elemMass * attrForce;
						let otherImpPow = mass * attrForce;
						
						let playerImp = relative.clone();
						playerImp.normalize();
						
						let otherImp = playerImp.clone();
						
						playerImp.mul(playerImpPow);
						otherImp.mul(-otherImpPow);
						
						if (!otherStatic) { element.applyLinearImpulse(otherImp, elemPos, true); }
						this.body.applyLinearImpulse(playerImp, posM, true);
					}
				});
			}
		}
		
		// Torque
		let angVel = this.body.getAngularVelocity();
		if (left && !right && angVel < (6 * utils.PI)) { this.body.applyTorque(2 * deltaMS, true); }
		if (right && !left && angVel > (-6 * utils.PI)) { this.body.applyTorque(-2 * deltaMS, true); }
		if (left && right) {
			// brake
			if (angVel > 0) {
				let factor = 2;
				if (angVel < 2) { factor = angVel; }
				this.body.applyTorque(-factor * deltaMS, true);
			}
			
			if (angVel < 0) {
				let factor = 2;
				if (angVel > -2) { factor = -angVel; }
				this.body.applyTorque(factor * deltaMS, true);
			}
		}
		
		// Time slowing.
		if (this.canSlowTime) {
			if (slowTime) { this.slowingTime = true; }
			
			if (this.slowingTime && this.GP.timeFactor > 0.25) {
				this.GP.timeFactor -= deltaS;
				this.GP.timeFactor = (this.GP.timeFactor > 0.25) ? this.GP.timeFactor : 0.25;
			}
			
			if (!this.slowingTime && this.GP.timeFactor < 1) {
				this.GP.timeFactor += deltaS;
				this.GP.timeFactor = (this.GP.timeFactor < 1) ? this.GP.timeFactor : 1;
			}
		}
		else { this.GP.timeFactor = 1; }
		this.slowingTime = false;
	}
}

/*
prefabs.mixins['player_jumpfield'] = (superclass) => class extends superclass {
	setup(options) {
		this.player = options.player;
		let axis = planck.Vec2(Math.cos(this.rotation), Math.sin(this.rotation));
		this.joint = this.GP.world.createJoint(planck.PrismaticJoint({
			lowerTranslation: 0,
			upperTranslation: 0.75,
			enableMotor: true,
			enableLimit: true,
			maxMotorForce: 3000,
			motorSpeed: -10.0
		}, this.player.body, this.body, this.player.body.getPosition(), axis));
		
		if (super.setup) super.setup(options);
	}
	
	update(deltaMS) {
		if (super.update) super.update(deltaMS);
		
		let extension = this.joint.getJointTranslation();
		if (extension <= 0.1) { this.sprites.visible = false; }
		else { this.sprites.visible = true; }
	}
}
*/

//	***
//	Weapons & Projectiles
//	***

prefabs.mixins['weapon'] = (superclass) => class extends superclass {
	get active() {
		if (this._active === true) { return true; }
		return false;
	}
	
	set active(input) {
		if (!(input === true || input === false)) {
			console.log("ERROR: Invalid input when setting weapon validity for weapon '" + this.name + "'.")
			return;
		}
		
		this._active = input;
		this.sprites.visible = input;
		if (input) {
			this.timer = (this.timer < 500) ? 500 : this.timer;
			this.isSwitching = true;
		}
	}
	
	get ready() {
		if (!this.active)		{ return false; }
		if (this.isSwitching)	{ return false; }
		if (this.isRecovering)	{ return false; }
		if (this.isReloading)	{ return false; }
		if (this.clip === 0)	{ return false; }
		return true;
	}
	
	reload() {
		if (this.active &&
			!this.isSwitching &&
			!this.isReloading &&
			this.clip != this.clipMax
			&& this.player.ammo > 0) {
			
			let remainder = this.clip / this.clipMax;
			let toTake = 1 - remainder;
			if (this.player.ammo >= toTake) {
				console.log(this.name + ': RELOADING.');
				this.player.ammo -= toTake;
				this.clip = this.clipMax;
				
				if (this.reloadTime > 0) {
					this.timer = (this.timer < this.reloadTime) ? this.reloadTime : this.timer;
					this.isReloading = true;
				}
			}
		}
	}
	
	drawCursorHud() {
		let cursorStage = this.GP.cursorStage;
		let redraw = false;
		
		if (cursorStage.stateData.weapon !== this.name)		{ redraw = true; }
		if (cursorStage.stateData.clip !== this.clip)		{ redraw = true; }
		if (cursorStage.stateData.maxClip !== this.maxClip)	{ redraw = true; }
		if (cursorStage.stateData.ammo !== this.player.ammo){ redraw = true; }
		
		if (!redraw) {
			if (cursorStage.stateData.tint != this.sprites.gun.tint) {
				cursorStage.stateData.tint = this.sprites.gun.tint
				cursorStage.children.forEach((element) => { element.tint = this.sprites.gun.tint; });
			}
			return;
		}
		
		// Clear and draw the hud
		cursorStage.removeChildren();
		
		cursorStage.stateData.weapon =	this.name;
		cursorStage.stateData.clip =	this.clip;		
		cursorStage.stateData.maxClip =	this.maxClip;
		cursorStage.stateData.ammo =	this.player.ammo;
		
		// Draw clip ammo indicators
		let segSpr = new PIXI.Graphics();
		cursorStage.addChild(segSpr);
		
		segSpr.lineStyle(0, 0, 0);
		segSpr.beginFill(0xffffff, 1);
		
		let halfgap = this.clipMax > 6 ? 0 : (utils.PI / 12);
		let segmentTotal = (utils.TAU / this.clipMax);
		let segment = segmentTotal - (2 * halfgap);
		
		let subSegment = segment;
		let pointCount = 1;
		while (subSegment > (utils.PI / 12)) { subSegment /= 2; pointCount *= 2; }
		pointCount++;
		
		let innerRad = this.GP.relGU2P(0.5),
			outerRad = this.GP.relGU2P(0.625);
		
		for (let i = 0; i < this.clip; i++) {
			let start = (-utils.PI / 2) - (i * segmentTotal) - halfgap;
			let end = start - segment;
			let points = [];
			
			for (let j = 0; j < pointCount; j++) {
				let angle = start - (j * subSegment);
				points.push(new PIXI.Point(Math.cos(angle) * innerRad, Math.sin(angle) * innerRad));
			}
			
			for (let j = pointCount - 1; j > -1; j--) {
				let angle = start - (j * subSegment);
				points.push(new PIXI.Point(Math.cos(angle) * outerRad, Math.sin(angle) * outerRad));
			}
			
			segSpr.drawPolygon(points);
		}
		
		// Draw total ammo indicators
		let ammoSpr = new PIXI.Graphics();
		cursorStage.addChild(ammoSpr);
		
		ammoSpr.lineStyle(0, 0, 0);
		ammoSpr.beginFill(0x000000, 1);
		
		let pointSep = utils.TAU / 6,
			offset = this.GP.relGU2P(0.875),
			radius = this.GP.relGU2P(0.125);
		
		for (let i = 0; i < this.player.ammo; i++) {
			let angle = -(i + 2) * pointSep;
			let centre = Vec2(Math.cos(angle) * offset, Math.sin(angle) * offset);
			
			ammoSpr.drawCircle(centre.x, centre.y, radius);
		}
		
		cursorStage.stateData.tint = this.sprites.gun.tint
		cursorStage.children.forEach((element) => { element.tint = this.sprites.gun.tint; });
		return;
	}
	
	updateTimer(deltaMS) {
		if (this.timer > -1) {
			this.timer -= deltaMS;
			if (this.timer <= 0) {
				this.timer = -1;
				this.sprites.gun.tint = this.readyTint;
				
				this.isRecovering = false;
				this.isReloading = false;
				this.isSwitching = false;
			}
			else {
				if (this.isSwitching) {
					let colourFactor = 1 - (this.timer / 500);
					this.sprites.gun.tint = utils.linearColourInterpolation(0xffffff, this.readyTint, colourFactor);
				}
				else if (this.isReloading ) {
					let colourFactor = 1 - (this.timer / this.reloadTime);
					this.sprites.gun.tint = utils.linearColourInterpolation(0xffffff, this.readyTint, colourFactor);
				}
				else if (this.isRecovering) {
					let colourFactor = 1 - (this.timer / this.recoverTime);
					this.sprites.gun.tint = utils.linearColourInterpolation(this.unreadyTint, this.readyTint, colourFactor);
				}
			}
		}
	}
}

prefabs.mixins['weapon_shotgun'] = (superclass) => class extends superclass {
	setup(options) {
		this.isRecovering = false;
		this.isReloading = false;
		this.isSwitching = false;
		
		this.readyTint = 0x0000ff;
		this.unreadyTint = 0x000000;
		this.recoverTime = 500;
		this.reloadTime = 2000;
		this.timer = -1;
		
		this.clipMax = 2;
		this.clip = options.hasAmmo ? this.clipMax : false;
		
		this.sprites.gun = this.sprites.children[0]; // Order may be changed post-setup according to z-height, so make a permanent link.
		this.sprites.chargeRead = this.sprites.children[1];
		
		this.charge = 0;
		this.chargeMax = 1500;
		
		if (super.setup) super.setup(options);
	}
	
	fire(options) {
		if (this.clip > 0) {
			let myPos = this.position;
			let myRot = this.rotation;
			
			let pelletImpStr = 75;
			let playerImpStr = 30;
			let halfAngle = ((1 - (this.charge / this.chargeMax)) * (utils.PI/18)) + (utils.PI/36); // Angle somewhere between 5 and 15 degrees, proportional to charge.
			
			let imp, offset, spawnPos, pellet, plImp;
			
			// pos angle
			imp = Vec2(Math.cos(myRot + halfAngle), Math.sin(myRot + halfAngle));
			offset = Vec2(imp.y * -0.25, imp.x * 0.25);
			spawnPos = myPos.clone().add(offset);
			pellet = this.GP.makeObject('proj_shotgun', null, spawnPos, myRot + halfAngle, {});
			plImp = imp.clone().mul(-playerImpStr);
			imp.mul(pelletImpStr);
			pellet.body.applyLinearImpulse(imp, spawnPos, true);
			this.player.body.applyLinearImpulse(plImp, myPos, true);
			
			// no angle
			imp = Vec2(Math.cos(myRot), Math.sin(myRot));
			spawnPos = myPos.clone().add(imp.clone().mul(0.25));
			pellet = this.GP.makeObject('proj_shotgun', null, spawnPos, myRot, {});
			plImp = imp.clone().mul(-playerImpStr);
			imp.mul(pelletImpStr);
			pellet.body.applyLinearImpulse(imp, spawnPos, true);
			this.player.body.applyLinearImpulse(plImp, myPos, true);
			
			// neg angle
			imp = Vec2(Math.cos(myRot - halfAngle), Math.sin(myRot - halfAngle));
			offset = Vec2(imp.y * 0.25, imp.x * -0.25);
			spawnPos = myPos.clone().add(offset);
			pellet = this.GP.makeObject('proj_shotgun', null, spawnPos, myRot - halfAngle, {});
			plImp = imp.clone().mul(-playerImpStr);
			imp.mul(pelletImpStr);
			pellet.body.applyLinearImpulse(imp, spawnPos, true);
			this.player.body.applyLinearImpulse(plImp, myPos, true);
			
			//console.log('Shotgun says "BANG!"');
			
			this.clip--;
			if (this.clip === 0 && this.GP.settings.autoReload) { this.reload(); }
			this.isRecovering = true;
			this.timer = (this.timer < this.recoverTime) ? this.recoverTime : this.timer;
		}
	}
	
	update(deltaMS, options) {
		this.updateTimer(deltaMS);
		
		if (!this.isReloading && this.clip == 0 && this.GP.settings.autoReload) { this.reload() }
		
		if (this.ready && options.fireState === 0x04) {
			// Slow time?
			if (this.GP.settings.autoSlowAim) {this.player.slowingTime = true;}
			
			// Charge accuracy meter
			this.sprites.chargeRead.visible = true;
			
			this.charge += deltaMS;
			this.charge = (this.charge > this.chargeMax) ? this.chargeMax : this.charge;
			
			let proportion = 1 - (this.charge / this.chargeMax);
			if (proportion > 0) {
				let scale = utils.getSpriteScale(this.GP, 128, proportion + 1);
				this.sprites.chargeRead.scale.set(scale, scale);
			}
			else {
				this.sprites.chargeRead.visible = false;
				let scale = utils.getSpriteScale(this.GP, 128, 1);
				this.sprites.chargeRead.scale.set(scale, scale);
			}
		}
		else if (this.ready && options.fireState === 0x01) {
			// Actual firing
			this.fire();
		}
		else {
			this.sprites.chargeRead.visible = false;
			this.sprites.chargeRead.scale.set(0.125, 0.125);
			this.charge = 0;
		}
		
		if (this.active) { this.drawCursorHud(); }
		
		if (super.update) super.update(deltaMS);
	}
}
prefabs.mixins['weapon_launcher'] = (superclass) => class extends superclass {
	setup(options) {
		this.isRecovering = false;
		this.isReloading = false;
		this.isSwitching = false;
		
		this.readyTint = 0xff0000;
		this.unreadyTint = 0x000000;
		this.recoverTime = 500;
		this.reloadTime = 2000;
		this.timer = -1;
		
		this.clipMax = 3;
		this.clip = options.hasAmmo ? this.clipMax : false;
		
		this.sprites.gun = this.sprites.children[0]; // Order may be changed post-setup according to z-height, so make a permanent link.
		this.sprites.chargeRead = this.sprites.children[1];
		
		this.preCharge = 100; // Allows a little time for minimal bounce.
		this.charge = 0;
		this.chargeMax = 1950;
		
		if (super.setup) super.setup(options);
	}
	
	fire(options) {
		if (this.clip > 0) {
			let myPos = this.position;
			if (this.charge === 0) { this.charge = 1; }
			this.GP.makeObject('proj_launcher', null, myPos, this.rotation, {charge: this.charge, chargeMax: this.chargeMax});
			let imp = Vec2(-Math.cos(this.rotation), -Math.sin(this.rotation)).mul(50);
			this.player.body.applyLinearImpulse(imp, this.player.body.getPosition(), true);
			// TODO: Effects? Sound?
			//console.log('Launcher says "BANG!"');
			
			this.clip--;
			if (this.clip === 0 && this.GP.settings.autoReload) { this.reload(); }
			this.isRecovering = true;
			this.timer = (this.timer < this.recoverTime) ? this.recoverTime : this.timer;
		}
		
		this.preCharge = 100;
		this.charge = 0;
	}
	
	update(deltaMS, options) {
		this.updateTimer(deltaMS);
		
		if (!this.isReloading && this.clip == 0 && this.GP.settings.autoReload) { this.reload() }
		
		
		if (this.ready && options.fireState === 0x04) {
			if (this.GP.settings.autoSlowAim) {this.player.slowingTime = true;}
			
			if (this.preCharge > 0) { this.preCharge -= deltaMS; }
			else {
				// Charge bounce meter
				this.sprites.chargeRead.visible = true;
				
				this.charge += 2 * deltaMS;
				this.charge = (this.charge > this.chargeMax) ? this.chargeMax : this.charge;
				
				let proportion = this.charge / this.chargeMax;
				if (proportion > 0) {
					let scale = utils.getSpriteScale(this.GP, 128, proportion + 1);
					this.sprites.chargeRead.scale.set(scale, scale);
				}
				else {
					this.sprites.chargeRead.visible = false;
					let scale = utils.getSpriteScale(this.GP, 128, 1);
					this.sprites.chargeRead.scale.set(scale, scale);
				}
			}
		}
		else if (this.ready && options.fireState === 0x01) {
			// Actual firing
			this.fire();
		}
		else {
			this.sprites.chargeRead.visible = false;
			this.sprites.chargeRead.scale.set(0.125, 0.125);
			this.charge = 0;
			this.preCharge = 100;
		}
		
		if (this.active) { this.drawCursorHud(); }
		
		if (super.update) super.update(deltaMS);
	}
}
prefabs.mixins['weapon_tesla'] = (superclass) => class extends superclass {
	setup(options) {
		this.isRecovering = false;
		this.isReloading = false;
		this.isSwitching = false;
		
		this.readyTint = 0x00bf00;
		this.unreadyTint = 0x00bf00;//0x007f00;
		this.recoverTime = 100;
		this.reloadTime = 0;
		this.timer = -1;
		
		this.clipMax = 20;
		this.clip = options.hasAmmo ? this.clipMax : false;
		
		this.sprites.gun = this.sprites.children[0]; // Order may be changed post-setup according to z-height, so make a permanent link.
		
		if (super.setup) super.setup(options);
	}
	
	fire(options) {
		if (this.clip > 0) {
			let tesla_proj = this.GP.makeObject('proj_tesla', null, this.player.position, this.rotation, {
				target:			this.player,
				firstInChain:	true
			});	
			//console.log('Tesla says "BANG!"');
			
			this.clip--;
			if (this.clip === 0 && this.GP.settings.autoReload) { this.reload(); }
			this.isRecovering = true;
			this.timer = (this.timer < this.recoverTime) ? this.recoverTime : this.timer;
		}
	}
	
	update(deltaMS, options) {
		this.updateTimer(deltaMS);
		
		if (!this.isReloading && this.clip == 0 && this.GP.settings.autoReload) { this.reload() }
		
		if (this.ready && options.fireState & 0x0c) {
			if (this.GP.settings.autoSlowAim) {this.player.slowingTime = true;}
			this.fire();
		}
		
		if (this.active) { this.drawCursorHud(); }
		
		if (super.update) super.update(deltaMS);
	}
}

prefabs.mixins['proj_shotgun'] = (superclass) => class extends superclass {
	setup(options) {
		this._trailThickness = 0.25;
		this._trailLifespan	= 0.25;
		this._trailColour = 0xff6600;
		this._trailAlpha = 1;
		
		this._hasRicocheted = false;
		this._canRicochet = true;
		
		if (super.setup) super.setup(options);
	}
	
	update(deltaMS) {
		let vel = this.GP.relM2GU(this.body.getLinearVelocity());
		let temp = this._canRicochet;
		this._canRicochet = (vel.lengthSquared() > 100);		
		
		if (this._canRicochet != temp) {
			if (!this._canRicochet) { this.body.setGravityScale(1.0); }
			else if (this._hasRicocheted) { this.body.setGravityScale(0.5); }
			else { this.body.setGravityScale(0.0); }
		}
		
		if (super.update) super.update(deltaMS);
	}
}

prefabs.mixins['proj_launcher'] = (superclass) => class extends superclass {
	setup(options) {
		this.charge = options.charge;
		this.chargeMax = options.chargeMax;
		this.mode = 0; // 0 - bouncey, 1 - sticky, 2 - stuck
		
		this.sprites.body = this.sprites.children[0]; // Order may be changed post-setup according to z-height, so make a permanent link.
		this.sprites.chargeRead = this.sprites.children[1];
		
		let imp = Vec2(Math.cos(this.rotation), Math.sin(this.rotation)).mul(150);
		this.body.applyLinearImpulse(imp, this.body.getPosition(), true);
		
		this.hitWall = false;
		
		this._trailColour = 0xff6600;
		this._trailThickness = 0.5;
		//this._trailAlpha = 1;
		
		if (super.setup) super.setup(options);
	}
	
	update(deltaMS) {
		if (this.charge > 0) {
			this.charge -= deltaMS;
			if (this.charge > 0) {
				let proportion = this.charge / this.chargeMax;
				let scale =  (1.5 * proportion) + 0.5;
				scale = utils.getSpriteScale(this.GP, 128, scale);
				this.sprites.chargeRead.scale.set(scale, scale);
			}
			else {
				this.sprites.chargeRead.visible = false;
				this.sprites.body.tint = 0xff6600;
				this.mode = 1;
				
				this.body.m_fixtureList.setRestitution(0.01);
			}
		}
		
		if (this.hitWall === true) {
			this.position = this.desiredPos;
			this.body.setType('static');
			this.hitWall = false;
			this.mode = 2;
		}
		
		let detonate = this.GP.IH.isTriggered('detonate');
		if (this.mode > 0 && detonate) { this.detonate(); }
		
		if (super.update) super.update(deltaMS);
	}
	
	detonate() {
		let checkRange = this.GP.relGU2M(4);
		let blastRange = this.GP.relGU2M(3);
		let blastRangeP = this.GP.relGU2P(3);
		let blastRangeSquared = blastRange * blastRange;
		
		let posM = this.body.getPosition();
		let posP = this.GP.absM2P(posM);
		
		let lower = posM.clone().sub(Vec2(checkRange, checkRange));
		let upper = posM.clone().add(Vec2(checkRange, checkRange));
		let aabb = planck.AABB(lower, upper);
		let foundBodies = [];
		this.GP.world.queryAABB(aabb, (fixture) => {
			// If an applicable target, and not already on the list, add to list.
			if (fixture.m_filterCategoryBits & 0x0015) {
				let body = fixture.getBody();
				let isSubAssembly = false;
				
				if (body.gameobject != null) {
					if (body.gameobject.hasTag('subassembly')) { isSubAssembly = true; }
				}
				
				if (!isSubAssembly) {
					let isFound = foundBodies.find((element) => element === body);
					if (isFound != null && isFound !== -1) {
						// Hey this is actually working!
						let temp = 0;
					}
					else { foundBodies.push(body); }
				}
			}
		});
		
		// Push stuff about.
		foundBodies.forEach((element) => {
			let elemPos = element.getPosition().clone();
			let relative = elemPos.clone().sub(posM);
			if (relative.lengthSquared() <= blastRangeSquared) {
				let ratio = 1 - (relative.length() / blastRange);
				ratio = (ratio < 0.5) ? 0.5 : ratio;
				let power = ratio * 100;
				let imp = relative.clone();
				imp.normalize();
				imp.mul(power);
				element.applyLinearImpulse(imp, elemPos, true);
			}
		});
		
		visuals.launcher_explosion(this.GP, posP, blastRangeP, this.rotation);
		
		this.destroy(false);
	}
}

prefabs.mixins['proj_tesla'] = (superclass) => class extends superclass {
	setup(options) {
		let range			= options.range != null			? options.range			: 6,
			halfAngleMax	= options.halfAngleMax != null	? options.halfAngleMax	: utils.PI / 12,
			chainsLeft		= options.chainsLeft != null	? options.chainsLeft	: 3;
		
		// On the basis that it tends to miss directly-adjacent targets, I have to do some weird offsetting shit.
		
		// Do an area-query, use the results to calc optimal target, bish bash bosh.
		let beamRangeM	= this.GP.relGU2M(range);
		
		let posM		= this.GP.relGU2M(this.position),
			rot			= this.rotation;
			
		let checkOriginOffset = Vec2(-Math.cos(rot), -Math.sin(rot)); // Check starts the angle 1GU behind the actual origin. Bizarrely. This is to avoid missing things directly next to you.
		let checkOrigin = this.position.clone().add(checkOriginOffset);
		
		let lower = posM.clone().sub(Vec2(beamRangeM, beamRangeM)),
			upper = posM.clone().add(Vec2(beamRangeM, beamRangeM)),
			aabb = planck.AABB(lower, upper),
			foundBodies = [];
			
		let bestHeur = 0, bestTarget = null;
		this.GP.world.queryAABB(aabb, (fixture) => {
			// If an applicable target, and not already on the list, add to list.
			if (fixture.m_filterCategoryBits & 0xff04) {
				let body = fixture.getBody();
				let valid = false;
				
				if (body.gameobject != null) {
					if (body.gameobject.hasTag('takes_damage')) { valid = true; }
				}
				
				if (valid) {
					let isFound = foundBodies.find((element) => element === body);
					if (isFound != null && isFound !== -1) {
						// Hey this is actually working!
						let temp = 0;
					}
					else {
						foundBodies.push(body);
						
						// Get delta angle
						let bodPos		= this.GP.absM2GU(body.getPosition().clone()),
							relative	= bodPos.clone().sub(checkOrigin),
							relAngle	= Math.atan2(relative.y, relative.x),
							deltaAngle	= utils.bearingDelta(rot, relAngle),
							dist		= relative.length();
						
						
						if (Math.abs(deltaAngle) > halfAngleMax) { return; }
						if (dist > range || dist < 1) { return; }
						if (body === options.target.body) { return; }
						let hDist		= 1 - ((dist - 1) / (range - 1)), // Account for angle offset
							hAng		= 1 - (Math.abs(deltaAngle) / halfAngleMax),
							heuristic = hDist + hAng;
						
						if (heuristic > bestHeur) {
							bestHeur = heuristic;
							bestTarget = body.gameobject;
						}
					}
				}
			}
		});
		
		// If no valid target, the chain ends here.
		if (bestTarget == null) {
			if (options.firstInChain) {
				// Draw one sparking off into nowhere
				checkOriginOffset.mul(-range).add(this.position);
				let vis = new visuals.tesla_beam(this.GP, this.position, checkOriginOffset);
			}
			return;
		}
		
		// There IS a valid target! Marvellous!
		let myBody = options.target.body,
			otherBody = bestTarget.body,
			dest = bestTarget.position,
			relative = dest.clone().sub(this.position),
			relativeAngle = Math.atan2(relative.y, relative.x);
		
		// Damage
		bestTarget.damage(2);
		
		// Visuals
		let vis = new visuals.tesla_beam(this.GP, this.position, dest);
		
		// Impulse
		let otherMassPos = otherBody.getPosition().clone().add(otherBody.getLocalCenter()),
			otherMass = otherBody.getMass();
			
		let myMassPos = myBody.getPosition().clone().add(myBody.getLocalCenter()),
			myMass = myBody.getMass();
		
		let otherStatic = otherMass === 0,
			attrForce = 5,
			myImpPow = otherStatic ? 200 * attrForce : otherMass * attrForce,
			otherImpPow = myMass * attrForce;
		
		let myImp = relative.clone();
		myImp.normalize();
		
		let otherImp = myImp.clone();
		
		myImp.mul(myImpPow);
		otherImp.mul(-otherImpPow);
		
		if (!otherStatic) { otherBody.applyLinearImpulse(otherImp, otherMassPos, true); }
		myBody.applyLinearImpulse(myImp, myMassPos, true);
		
		// Chaining
		if (chainsLeft > 0) {
			// Recursively create a chained proj_tesla.			
			let next = this.GP.makeObject('proj_tesla', null, dest, relativeAngle, {
				target:			bestTarget,
				firstInChain:	false,
				range:			range - 0.5,
				halfAngleMax:	halfAngleMax + (utils.PI / 12),
				chainsLeft:		chainsLeft - 1
			});		
		}
		
		if (super.setup) super.setup(options);
	}
	
	update(deltaMS) {
		this.destroy(false);
		
		if (super.update) super.update(deltaMS);
	}
}

//	***
//	Define gameplay prefabs.
//	***

/*
 *	Box2D filter categories:
 *	1	:	0x0001	:	player
 *	2	:	0x0002	:	player projectiles
 *	4	:	0x0004	:	enemy
 *	8	:	0x0008	:	enemy projectiles (?)
 
 *	16	:	0x0010	:	debris / gibs
 *	32	:	0x0020	:	enviroment
 *	64	:	0x0040	:	enviro hazards
 *	128	:	0x0080	:	enemy sensors
*/


prefabs.wall = {
	name: "wall",
	tags: ['static', 'terrain'],
	zIndex: 35,
	sprites: [
		{
			tex: "__rect",
			tint: 0x000000,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(1, 1),
			pos: Vec2(0, 0),
			rot: 0
		}
	],
	body: {
		type: 'static'//,
		//active: false
	},
	fixtures: [
		{
			name: 'Block',
			shape: planck.Box(0.5, 0.5),
			
			density: 5.0,
			friction: 0.75,
			restitution: 0.25,
			
			filterCategoryBits: 0x0020,
			//filterMaskBits: 0x60,
		}
	],
	mixins: []
};

prefabs.player = {
	name: "player",
	tags: ['dynamic', 'player'],
	maxCount: 1,
	zIndex: 25,
	sprites: [
		{
			tex: "player_body.png",
			tint: 0xffffff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(1, 1),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 15
		},
		{
			tex: "circle_border.png",
			tint: 0x7fffff,
			alpha: 1,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.75, 0.75),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 1
		},
		{
			tex: "circle_border.png",
			tint: 0xd97fff, //0xff7fff, //0x8300fe,
			alpha: 1,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.75, 0.75),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 0
		}
	],
	body: {
		type: 'dynamic'
	},
	fixtures: [
		{
			name: 'Body',
			shape: planck.Circle(0.5),
			
			density: 10.0,
			friction: 0.5,
			restitution: 0.25,
			
			filterCategoryBits: 0x0001,
			filterMaskBits: 0x006c
		}
	],
	mixins: [ 'leavestrail', 'player' ]
};

/*
prefabs.player_jumpfield = {
	name: "player_jumpfield",
	tags: ['dynamic', 'player', 'subassembly'],
	zIndex: 9,
	sprites: [
		{
			tex: "circle_side.png",
			tint: 0x7fffff,
			alpha: 0.125,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.75, 0.75), // 0.75 * 0.125
			pos: Vec2(0, 0),
			rot: 0
		}
	],
	body: {
		type: 'dynamic'
	},
	fixtures: [
		{
			name: 'field',
			shape: planck.Circle(0.375),
			
			density: 0.1,
			friction: 0.25,
			restitution: 0.5,
			
			filterCategoryBits: 0x0001,
			filterMaskBits: 0x0020 // environment.
		}                   
	],
	mixins: [ 'player_jumpfield' ]
}
*/

prefabs.weapon_shotgun = {
	name: "weapon_shotgun",
	tags: ['dynamic', 'player', 'weapon', 'no-box2D', 'subassembly'],
	zIndex: 26,
	sprites: [
		{
			tex: "player_weapon.png",
			tint: 0x0000ff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(2, 1),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 10
		},
		{
			tex: "circle_border.png",
			tint: 0x0000ff,
			anchor: Vec2(0.5, 0.5),
			alpha: 0.5,
			scale: Vec2(1, 1),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 5,
			visible: false
		}
	],
	body: {
		type: 'dynamic'
	},
	mixins: [ 'weapon', 'weapon_shotgun' ]
}

prefabs.weapon_launcher = {
	name: "weapon_launcher",
	tags: ['dynamic', 'player', 'weapon', 'no-box2D', 'subassembly'],
	zIndex: 26,
	sprites: [
		{
			tex: "player_weapon.png",
			tint: 0xff0000,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(2, 1),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 10
		},
		{
			tex: "circle_border.png",
			tint: 0xff0000,
			anchor: Vec2(0.5, 0.5),
			alpha: 0.5,
			scale: Vec2(1, 1),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 5,
			visible: false
		}
	],
	body: {
		type: 'dynamic'
	},
	mixins: [ 'weapon', 'weapon_launcher' ]
}

prefabs.weapon_tesla = {
	name: "weapon_tesla",
	tags: ['dynamic', 'player', 'weapon', 'no-box2D', 'subassembly'],
	zIndex: 26,
	sprites: [
		{
			tex: "player_weapon.png",
			tint: 0x00bf00,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(2, 1),
			pos: Vec2(0, 0),
			rot: 0
		}
	],
	body: {
		type: 'dynamic'
	},
	mixins: [ 'weapon', 'weapon_tesla' ]
}

//	***
//	Projectiles / Gibs
//	***

prefabs.proj_shotgun = {
	name: "proj_shotgun",
	tags: ['dynamic', 'projectile', 'bullet'],
	zIndex: 24,
	sprites: [
		{
			tex: "__circle",
			tint: 0xff6600,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.25, 0.25),
			pos: Vec2(0, 0),
			rot: 0,
			index: 10
		}
	],
	body: {
		type: 'dynamic',
		bullet: true,
		gravityScale: 0
	},
	fixtures: [
		{
			name: 'projectile',
			shape: planck.Circle(0.125),
			
			density: 50,
			friction: 1.0,
			restitution: 0.1,
			
			filterCategoryBits: 0x0002,
			filterMaskBits: 0x006e
		}                   
	],
	mixins: [ 'leavestrail', 'proj_shotgun' ]
}

prefabs.proj_launcher = {
	name: "proj_launcher",
	tags: ['dynamic', 'projectile', 'bullet'],
	zIndex: 23,
	sprites: [
		{
			tex: "__circle",
			tint: 0x883300,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.5, 0.5),
			pos: Vec2(0, 0),
			rot: 0,
			index: 10
		},
		{
			tex: "circle_border.png",
			tint: 0xff0000,
			anchor: Vec2(0.5, 0.5),
			alpha: 0.5,
			scale: Vec2(0.5, 0.5),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 5
		}
	],
	body: {
		type: 'dynamic',
		bullet: true,
		gravityScale: 1.0
	},
	fixtures: [
		{
			name: 'projectile',
			shape: planck.Circle(0.25),
			
			density: 50,
			friction: 0.01,
			restitution: 0.95,
			
			filterCategoryBits: 0x0002,
			filterMaskBits: 0x006e
		}                   
	],
	mixins: [ 'leavestrail', 'proj_launcher' ]
}

prefabs.proj_tesla = {
	name: "proj_tesla",
	tags: ['dynamic', 'no-box2D'],
	maxCount: 50,
	zIndex: 25,
	sprites: [
		{
			tex: "__circle",
			tint: 0xff00ff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.5, 0.5),
			pos: Vec2(0, 0),
			rot: 0,
			index: 10
		}
	],
	mixins: [ 'proj_tesla' ]
}

prefabs.gibs_launcher = {
	name: "gibs_launcher",
	tags: ['dynamic', 'gibs'],
	zIndex: 5,
	sprites: [
		{
			tex: "__triangle",
			tint: 0xff6600,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.25, 0.25),
			pos: Vec2(0, 0),
			rot: 0,
			index: 10
		}
	],
	body: {
		type: 'dynamic',
		gravityScale: 2.0
	},
	fixtures: [
		{
			name: 'gib',
			shape: planck.Polygon([
				Vec2(0, 0.125),
				Vec2(0.75 * 0.57735026919 / 4, -0.0625),
				Vec2(0.75 * -0.57735026919 / 4, -0.0625)
			]),
			
			density: 10,
			friction: 0.5,
			restitution: 0.5,
			
			filterCategoryBits: 0x0010,
			filterMaskBits: 0xffff
		}                   
	],
	mixins: []
}

prefabs.test = {
	name: "test",
	tags: ['dynamic', 'takes_damage'],
	zIndex: 24,
	sprites: [
		{
			tex: "__circle",
			tint: 0xff00ff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(1, 1),
			pos: Vec2(0, 0),
			rot: 0
		}
	],
	body: {
		type: 'dynamic'
	},
	fixtures: [
		{
			name: 'body',
			shape: planck.Circle(0.5),
			
			density: (Math.random() * 10) + 5,
			friction: 0.5,
			restitution: 0.25,
			
			filterCategoryBits: 0x0004
			//filterMaskBits: 0x006c
		}                   
	],
	mixins: ['takes_damage']
}

//	***
//	Level creation / reading
//	***

prefabs.map = {
	0:	'empty',
	
	//	Environment
	1:	'wall',
	2:	'ramp',
	3:	'c_ramp_2x2',
	4:	'c_ramp_3x3',
	5:	'c_ramp_4x4',
	6:	'door_wall',
	7:	'kill_field',
	8:	'acc_field',
	9:	'dec_field',
	
	//	Gameplay
	10:	'player_spawn',
	11:	'player_goal',
	12:	'enemy_walker',
	13:	'enemy_flier',
	14:	'enemy_charger',
	15:	'enemy_walker_spawner',
	16:	'door_key',
	
	//	Powerups
	20:	'player_unlock',
	21:	'player_ammo',
	22:	'player_powerup'
}

module.exports = prefabs;