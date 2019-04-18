//	***
//	prefabs.js start
//	***

//const planck = require('planck-js');
//const PIXI = require('pixi.js');
const uuid = require('uuid');
//const fs = require('fs');
const PNG = require('pngjs');

let Sprite = PIXI.Sprite,
	Vec2 = planck.Vec2,
	gameplayTex = PIXI.Loader.shared.resources["assets/gameplay.json"].textures,
	particleTex = PIXI.Loader.shared.resources["assets/particles.json"].textures;

const visuals = require('./visuals');
	
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
		let mult = (bitA & 0x06) >>> 1;
		opts.rotation = utils.PI * 0.5 * mult;
		return opts;
	}
}

prefabs.mixins['loading_scale1to4'] = (superclass) => class extends superclass {
	translateOptions(bitA, bitB) {
		let opts = super.translateOptions(bitA, bitB);
		let firstBit = (bitA & 0x01) << 1;
		let secondBit = (bitB & 0x80) >>> 7;
		opts.scale = (firstBit | secondBit) + 1;
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
		this.maxHP	= (options.maxHP != null)	? options.maxHP	: 35; // 0 for invincible.
		this.HP		= (options.HP != null)		? options.HP	: this.maxHP;
		
		this._delayBeforeRegen = 1;
		this._timeSinceLastDamage = this._delayBeforeRegen;
		
		this._deathTrigger = false;
		
		this.sprites.healthbar = new PIXI.Graphics();
		this.sprites.healthbar.zIndex = 100;
		this.sprites.healthbar.visible = false;
		this.sprites.addChild(this.sprites.healthbar);
		
		this._healthbarConsts = {};
		this._healthbarConsts.width = this.GP.relGU2P(1.0);
		this._healthbarConsts.height = this.GP.relGU2P(0.1875);
		this._healthbarConsts.topLeft = new PIXI.Point(this.GP.relGU2P(-0.5), this.GP.relGU2P(0.25));
		this._healthbarConsts.oneHPWidth = this.maxHP > 0 ? this.GP.relGU2P(1.0 / this.maxHP) : 1.0;		
		
		this._healthbarTimeout = 0;
		this._healthbarFadeout = 0;
		
		if (super.setup) super.setup(options);
	}
	
	setMaxHP(newMaxHP) {
		this.maxHP = newMaxHP;
		this._healthbarConsts.oneHPWidth = this.maxHP > 0 ? this.GP.relGU2P(1.0 / this.maxHP) : 1.0;
		this.redrawHealthbar();
	}
	
	damage(lostHP) {
		this._timeSinceLastDamage = 0;
		if (this.maxHP > 0) {
			this.HP -= lostHP;
			if (this.HP <= 0) {
				this.HP = 0;
				this._deathTrigger = true;
			}
			this.redrawHealthbar();
		}
	}
	
	redrawHealthbar() {
		if (this.maxHP > 0) {
			this._healthbarTimeout = 1;
			
			this.sprites.healthbar.visible = true;
			this.sprites.healthbar.alpha = 1.0;
			
			this.sprites.healthbar.clear();
			this.sprites.healthbar.lineStyle(0, 0, 0);
			
			let startX = this._healthbarConsts.topLeft.x;
			let width = this._healthbarConsts.width;
			
			if (this.HP < this.maxHP) {
				let empty = this.maxHP - this.HP,
					subWidth = empty * this._healthbarConsts.oneHPWidth;
					
				this.sprites.healthbar.beginFill(0xff6600, 1);
				this.sprites.healthbar.drawRect(
					startX,
					this._healthbarConsts.topLeft.y,
					subWidth,
					this._healthbarConsts.height
				);
				
				startX += subWidth;
				width -= subWidth;
			}
			
			this.sprites.healthbar.beginFill(0xb3b3b3, 1);
			this.sprites.healthbar.drawRect(
				startX,
				this._healthbarConsts.topLeft.y,
				width,
				this._healthbarConsts.height
			);
		}
	}
	
	update(deltaMS) {
		let deltaS = deltaMS * 0.001;
		
		if (this._deathTrigger) {this.destroy(false); }
		
		if (this.maxHP > 0) {
			if (this._timeSinceLastDamage < this._delayBeforeRegen) {
				let temp = this._timeSinceLastDamage + deltaS;
				if (temp > this._delayBeforeRegen) {
					this._timeSinceLastDamage = this._delayBeforeRegen;
					deltaS = temp - this._delayBeforeRegen; // Get overflow for HP calc, I guess.
				}
				else { this._timeSinceLastDamage = temp; }
			}
			
			if (this._timeSinceLastDamage == this._delayBeforeRegen && this.HP < this.maxHP) {
				this.HP += 10 * deltaS; // That's right! It regens 10HP a second! Yikes!
				if (this.HP > this.maxHP) { this.HP = this.maxHP; }
				this.redrawHealthbar();
			}
		}
		
		this.sprites.healthbar.rotation = this.rotation;
		
		if (this.sprites.healthbar.visible == true) {
			if ( this._healthbarTimeout > 0 ) {
				this._healthbarTimeout -= deltaS;
				if (this._healthbarTimeout <= 0) {
					this._healthbarTimeout = 0;
					this._healthbarFadeout = 1;
				}
			}
			
			if ( this._healthbarFadeout > 0 ) {
				this._healthbarFadeout -= deltaS;
				if (this._healthbarFadeout <= 0) {
					this._healthbarFadeout = 0;
					this.sprites.healthbar.visible = false;
				}
				else { this.sprites.healthbar.alpha = this._healthbarFadeout; }
			}
		}
		
		if (super.update) super.update(deltaMS);
	}
}

//	***
//	Environment mixins.
//	***

prefabs.mixins['c_ramp_concave'] = (superclass) => class extends superclass {
	setup(options) {
		let dim = (options != null && options.scale != null) ? options.scale : 2,
			segCount = 4 * dim,
			twoDim = 2 * dim;
		
		this.sprites.children[0].scale.x *= dim;
		this.sprites.children[0].scale.y *= dim;
		this.sprites.children[0].anchor.set((twoDim - 1)/ twoDim, (twoDim - 1)/ twoDim);
		
		let angle = 0;
		let segAng = utils.PI / (2 * segCount);
		
		for (let i = 0; i < segCount; i++) {
			let nextAng = angle - segAng;
			let def = {
				name: 'c_ramp_concave_subsection',
				shape: planck.Polygon([
					Vec2(0.5, -0.5),
					Vec2((Math.cos(angle) * dim) - dim + 0.5,	(Math.sin(angle) * dim) + dim -0.5),
					Vec2((Math.cos(nextAng) * dim) - dim + 0.5,	(Math.sin(nextAng) * dim) + dim - 0.5)
				]),
				
				density: 5.0,
				friction: 0.75,
				restitution: 0.25,
				
				filterCategoryBits: 0x0020
			}
			
			this.body.createFixture(def);
			angle = nextAng;
		}
		
		if (super.setup) super.setup(options);
	}
}

prefabs.mixins['c_ramp_convex'] = (superclass) => class extends superclass {
	setup(options) {
		let dim = (options != null && options.scale != null) ? options.scale : 2,
			segCount = 4 * dim,
			twoDim = 2 * dim;
		
		this.sprites.children[0].scale.x *= dim;
		this.sprites.children[0].scale.y *= dim;
		this.sprites.children[0].anchor.set((twoDim - 1)/ twoDim, (twoDim - 1)/ twoDim);
		
		let angle = utils.PI / 2;
		let segAng = utils.PI / (2 * segCount);
		
		for (let i = 0; i < dim; i++) {
			let ang1	= angle + (1 * segAng),
				ang2	= angle + (2 * segAng),
				ang3	= angle + (3 * segAng),
				nextAng	= angle + (4 * segAng);
			let def = {
				name: 'c_ramp_convex_subsection',
				shape: planck.Polygon([
					Vec2(0.5, -0.5),
					Vec2((Math.cos(angle) * dim) + 0.5,		(Math.sin(angle) * dim) - 0.5),
					Vec2((Math.cos(ang1) * dim) + 0.5,		(Math.sin(ang1) * dim) - 0.5),
					Vec2((Math.cos(ang2) * dim) + 0.5,		(Math.sin(ang2) * dim) - 0.5),
					Vec2((Math.cos(ang3) * dim) + 0.5,		(Math.sin(ang3) * dim) - 0.5),
					Vec2((Math.cos(nextAng) * dim) + 0.5,	(Math.sin(nextAng) * dim) - 0.5)
				]),
				
				density: 5.0,
				friction: 0.75,
				restitution: 0.25,
				
				filterCategoryBits: 0x0020
			}
			
			this.body.createFixture(def);
			angle = nextAng;
		}
		
		if (super.setup) super.setup(options);
	}
}

prefabs.mixins['door_wall'] = (superclass) => class extends superclass {
	translateOptions(bitA, bitB) {
		let opts = super.translateOptions(bitA, bitB);
		let colInd = (bitA & 0x06) >>> 1;
		
		if (colInd === 1) { opts.colour = 'red'; }
		else if (colInd === 2) { opts.colour = 'green'; }
		else if (colInd === 3) { opts.colour = 'blue'; }
		else { opts.colour = 'white'; }
		
		return opts;
	}
	
	setup(options) {
		if (super.setup) super.setup(options);
		
		this.colour = (options.colour != null) ? options.colour : 'white';
		
		if (this.colour === 'red') { this.tint = 0xff0000; }
		else if (this.colour === 'green') { this.tint = 0x00ff00; }
		else if (this.colour === 'blue') { this.tint = 0x0000ff; }
		else {
			this.colour = 'white';
			this.tint = 0xffffff;
		}
		
		this.keyAssigned = false;
		
		this.sprites.children[0].tint = this.tint;
	}
	
	destroy(immediate) {
		visuals.door_key_death(this.GP, this.position, this.colour);
		
		super.destroy(immediate);
	}
}

prefabs.mixins['door_key'] = (superclass) => class extends superclass {
	translateOptions(bitA, bitB) {
		let opts = super.translateOptions(bitA, bitB);
		let colInd = (bitA & 0x06) >>> 1;
		
		if (colInd === 1) { opts.colour = 'red'; }
		else if (colInd === 2) { opts.colour = 'green'; }
		else if (colInd === 3) { opts.colour = 'blue'; }
		else { opts.colour = 'white'; }
		
		opts.maxHP = 20;
		
		opts.keyCount = bitB;
		
		return opts;
	}
	
	setup(options) {
		if (super.setup) super.setup(options);
		
		this._field_kill_applicable = true;
		
		this.colour = (options.colour != null) ? options.colour : 'white';
		
		if (this.colour === 'red') {
			this.tint = 0xff0000;
			this.tintString = 'ff0000';
		}
		else if (this.colour === 'green') {
			this.tint = 0x00ff00;
			this.tintString = '00ff00';
		}
		else if (this.colour === 'blue') {
			this.tint = 0x0000ff;
			this.tintString = '0000ff';
		}
		else {
			this.colour = 'white';
			this.tint = 0xffffff;
			this.tintString = 'ffffff';
		}
		
		//this._trailColour = this.tint;
		
		this.keyCount = (options.keyCount != null) ? options.keyCount : 0;
		
		this.sprites.children[0].tint = this.tint;
		
		// Setup triggers
		this.projectiles = [];
		
		// Spawn proj_triggers in a circling pattern.
		let subAngle = utils.TAU / this.keyCount,
			spawnAngle = this.rotation,
			myPos = this.position.clone(),
			ninetyDeg = utils.PI / 2,
			projTint	= (this.colour === 'white') ? 0xdddddd : this.tint,
			projTintStr	= (this.colour === 'white') ? 'dddddd' : this.tintString;
		
		for (let i = 0; i < this.keyCount; i++) {
			let offset = Vec2(Math.cos(spawnAngle), Math.sin(spawnAngle));
			let proj = this.GP.makeObject('proj_trigger', null, offset.add(myPos), spawnAngle + ninetyDeg, {
				origin: this,
				effectType:		'addAmmo',
				particleName:	'square.png',
				tint:			projTint,
				tintString:		projTintStr,
				targetFunction:	'destroy',
				targetFunctionParameters: false
			});
			
			this.projectiles.push(proj);
			spawnAngle += subAngle;
		}
	}
	
	destructor(options) {
		visuals.door_key_death(this.GP, this.position, this.colour);
		
		// Get all doors, find valid ones, order by relative distance.
		let sameColour = [],
			multiColour = [];
		
		// Get valid options
		let allDoors = this.GP.getObjectsOfType('door_wall', true);
		if (this.colour === 'white') {
			allDoors.forEach((element) => {
				if (element.keyAssigned) { return; }
				
				if (element.colour === 'white') { sameColour.push(element); }
				else { multiColour.push(element); }
			});
		}
		else {
			allDoors.forEach((element) => {
				if (element.keyAssigned) { return; }
				
				if (element.colour === this.colour) { sameColour.push(element); }
				else if (element.colour === 'white') { multiColour.push(element); }
			});
		}
		
		let leftOvers = (sameColour.length < this.keyCount),
			overflow = (sameColour.length + multiColour.length < this.keyCount);
		
		if (overflow) {this.keyCount = sameColour.length + multiColour.length; }
		
		// Sort the options
		let myPos = this.position;
		sameColour.sort((a, b) => {
			let aRel = a.position.clone().sub(myPos);
			let bRel = b.position.clone().sub(myPos);
			return (aRel.lengthSquared() - bRel.lengthSquared());
		});
		
		if (leftOvers) {
			multiColour.sort((a, b) => {
				let aRel = a.position.clone().sub(myPos);
				let bRel = b.position.clone().sub(myPos);
				return (aRel.lengthSquared() - bRel.lengthSquared());
			});
		}
		
		// Spawn proj_key instances.
		/*let angle = 0,
			relAng = utils.TAU / this.keyCount,
			tint = (this.colour === 'white') ? 0xdddddd : this.tint;
		for (let i = 0; this.keyCount > 0 && i < sameColour.length; i++) {
			sameColour[i].keyAssigned = true;
			let proj = this.GP.makeObject('proj_key', null, myPos, angle, {
				colour:	this.colour,
				tint:	tint,
				target:	sameColour[i]
			});
			
			this.keyCount--;
			angle += relAng;
		}
		for (let i = 0; this.keyCount > 0 && i < multiColour.length; i++) {
			multiColour[i].keyAssigned = true;
			let proj = this.GP.makeObject('proj_key', null, myPos, angle, {
				colour:	this.colour,
				tint:	tint,
				target:	multiColour[i]
			});
			
			this.keyCount--;
			angle += relAng;
		}*/
		
		let numDone = 0;
		this.projectiles.forEach((element) => {
			let target = null;
			let numDoneOffest = numDone - sameColour.length;
			if (numDone < sameColour.length) {
				sameColour[numDone].keyAssigned = true;
				target = sameColour[numDone];
			}
			else if (numDoneOffest < multiColour.length) {
				multiColour[numDoneOffest].keyAssigned = true;
				target = multiColour[numDoneOffest];
			}
			
			element.giveTarget(target);
			
			let relative = element.position.clone().sub(myPos);
			relative.normalize();
			relative.mul(25);
			element.body.applyLinearImpulse(relative, element.position, true);
			
			numDone++;
		});
	}
}

prefabs.mixins['symbol_display'] = (superclass) => class extends superclass {
	translateOptions(bitA, bitB) {
		let opts = super.translateOptions(bitA, bitB);
		
		opts.zIndex = ((bitA & 0x01) > 0) ? 10 : 5;
		opts.symbolIndex = (bitB & 0xf0) >>> 4;
		
		let colourIndex = (bitB & 0x0f);
		
		switch (colourIndex) {
			case 1:
				// Red
				opts.colour = 0xbf4040;
				break;
			case 2:
				// Green
				opts.colour = 0x40bf40;
				break;
			case 3:
				// Blue
				opts.colour = 0x4040bf;
				break;
			case 4:
				// Yellow
				opts.colour = 0xbfbf40;
				break;
			case 5:
				// Push Blue
				opts.colour = 0x9fdfdf;
				break;
			case 6:
				// Pull Purple
				opts.colour = 0xcc9fdf;
				break;
			case 7:
				// Exit Magenta
				opts.colour = 0xdfa1df;
				break;
			case 8:
				// White
				opts.colour = 0xffffff;
				break;
			case 9:
				// Black
				opts.colour = 0x000000;
				break;
			case 10:
				// Orange
				opts.colour = 0xff6600;
				break;
			default:
				// Grey
				opts.colour = 0xb3b3b3;
		}
		
		opts.maxHP = 20;
		
		opts.keyCount = bitB;
		
		return opts;
	}
	
	setup(options) {
		this.symbolIndex = (options.symbolIndex != null) ? options.symbolIndex : 0;
		this.colour = (options.colour != null) ? options.colour : 0xb3b3b3;
		
		if (options.zIndex != null) { this.sprites.zIndex = options.zIndex; }
		
		let size = (this.symbolIndex < 3) ? 1 : 2,
			sprDim = utils.getSpriteScale(this.GP, 128, size),
			newSpr;
		
		switch (this.symbolIndex) {
			case 0:
				// Arrow
				newSpr = new Sprite(gameplayTex['symbol_arrow.png']);
				newSpr.tint = this.colour;
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				
				this.sprites.addChild(newSpr);
				break;
			case 1:
				// Cross
				newSpr = new Sprite(gameplayTex['symbol_cross.png']);
				newSpr.tint = this.colour;
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				
				this.sprites.addChild(newSpr);
				break;
			case 2:
				// Dot
				newSpr = new Sprite(gameplayTex['symbol_dot_outer.png']);
				newSpr.tint = '0xffffff';
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 0;
				
				this.sprites.addChild(newSpr);
				
				newSpr = new Sprite(gameplayTex['symbol_dot_centre.png']);
				newSpr.tint = this.colour;
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 1;
				
				this.sprites.addChild(newSpr);
				break;
			case 3:
				// M1
				newSpr = new Sprite(gameplayTex['symbol_m_body.png']);
				newSpr.tint = '0xffffff';
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 0;
				
				this.sprites.addChild(newSpr);
				
				newSpr = new Sprite(gameplayTex['symbol_m1.png']);
				newSpr.tint = this.colour;
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 1;
				
				this.sprites.addChild(newSpr);
				break;
			case 4:
				// M2
				newSpr = new Sprite(gameplayTex['symbol_m_body.png']);
				newSpr.tint = '0xffffff';
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 0;
				
				this.sprites.addChild(newSpr);
				
				newSpr = new Sprite(gameplayTex['symbol_m2.png']);
				newSpr.tint = this.colour;
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 1;
				
				this.sprites.addChild(newSpr);
				break;
			case 5:
				// Keyboard base
				newSpr = new Sprite(gameplayTex['symbol_wasd.png']);
				newSpr.tint = '0xffffff';
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				
				this.sprites.addChild(newSpr);
				break;
			case 6:
				// W
				newSpr = new Sprite(gameplayTex['symbol_wasd.png']);
				newSpr.tint = '0xffffff';
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 0;
				
				this.sprites.addChild(newSpr);
				
				newSpr = new Sprite(gameplayTex['symbol_w.png']);
				newSpr.tint = this.colour;
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 1;
				
				this.sprites.addChild(newSpr);
				break;
			case 7:
				// A
				newSpr = new Sprite(gameplayTex['symbol_wasd.png']);
				newSpr.tint = '0xffffff';
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 0;
				
				this.sprites.addChild(newSpr);
				
				newSpr = new Sprite(gameplayTex['symbol_a.png']);
				newSpr.tint = this.colour;
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 1;
				
				this.sprites.addChild(newSpr);
				break;
			case 8:
				// S
				newSpr = new Sprite(gameplayTex['symbol_wasd.png']);
				newSpr.tint = '0xffffff';
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 0;
				
				this.sprites.addChild(newSpr);
				
				newSpr = new Sprite(gameplayTex['symbol_s.png']);
				newSpr.tint = this.colour;
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 1;
				
				this.sprites.addChild(newSpr);
				break;
			case 9:
				// D
				newSpr = new Sprite(gameplayTex['symbol_wasd.png']);
				newSpr.tint = '0xffffff';
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 0;
				
				this.sprites.addChild(newSpr);
				
				newSpr = new Sprite(gameplayTex['symbol_d.png']);
				newSpr.tint = this.colour;
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 1;
				
				this.sprites.addChild(newSpr);
				break;
			case 10:
				// Q
				newSpr = new Sprite(gameplayTex['symbol_wasd.png']);
				newSpr.tint = '0xffffff';
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 0;
				
				this.sprites.addChild(newSpr);
				
				newSpr = new Sprite(gameplayTex['symbol_q.png']);
				newSpr.tint = this.colour;
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 1;
				
				this.sprites.addChild(newSpr);
				break;
			case 11:
				// E
				newSpr = new Sprite(gameplayTex['symbol_wasd.png']);
				newSpr.tint = '0xffffff';
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 0;
				
				this.sprites.addChild(newSpr);
				
				newSpr = new Sprite(gameplayTex['symbol_e.png']);
				newSpr.tint = this.colour;
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 1;
				
				this.sprites.addChild(newSpr);
				break;
			case 12:
				// Shift
				newSpr = new Sprite(gameplayTex['symbol_wasd.png']);
				newSpr.tint = '0xffffff';
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 0;
				
				this.sprites.addChild(newSpr);
				
				newSpr = new Sprite(gameplayTex['symbol_shift.png']);
				newSpr.tint = this.colour;
				newSpr.anchor.set(1.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 1;
				
				this.sprites.addChild(newSpr);
				break;
			case 13:
				// Brake
				newSpr = new Sprite(gameplayTex['symbol_wasd.png']);
				newSpr.tint = '0xffffff';
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 0;
				
				this.sprites.addChild(newSpr);
				
				newSpr = new Sprite(gameplayTex['symbol_a.png']);
				newSpr.tint = this.colour;
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 1;
				
				this.sprites.addChild(newSpr);
				
				newSpr = new Sprite(gameplayTex['symbol_d.png']);
				newSpr.tint = this.colour;
				newSpr.anchor.set(0.5, 0.5);
				newSpr.scale.set(sprDim, sprDim);
				newSpr.zIndex = 1;
				
				this.sprites.addChild(newSpr);
				break;
			default:
				// Error
				console.log("ERROR: Invalid symbol index ('" + this.symbolIndex + "') was passed to symbol_display setup.");
		}
		
		if (super.setup) super.setup(options);
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
//	Player, Weapons & Projectiles
//	***

prefabs.mixins['player'] = (superclass) => class extends superclass {
	setup(options) {
		options = (options != null) ? options : {};
		
		this.canSlowTime = true; //(options.canSlowTime == true);
		this.slowingTime = false;
		
		this.sprites.body = this.sprites.children[0]; // Order may be changed post-setup according to z-height, so make a permanent link.
		//this.sprites.jumpField = this.sprites.children[1];
		//this.sprites.pullField = this.sprites.children[2];
		
		// Field checks
		this._field_kill_applicable = true;
		
		// Build weapons
		this.currentWeapon = null;
		this.ammo = (options.startingAmmo != null) ? options.startingAmmo : 0;
		
		if (options.hasShotgun == true) { this.enableShotgun(options.shotgunStartsWithAmmo); }
		if (options.hasLauncher == true) { this.enableLauncher(options.launcherStartsWithAmmo); }
		if (options.hasTesla == true) { this.enableTesla(options.teslaStartsWithAmmo); }
		
		// Build Jumpfields
		if (options.hasJumpField == true) { this.enableJumpField(); }
		/*this.sprites.jumpField.visible = false;
		this.jumpFieldExtension = 0.75;*/
		this.jumpFieldRange = 1.5;
		
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
		if (options.hasPullField == true) { this.enablePullField(); }
		//this.sprites.pullField.visible = false;
		//this.pullFieldExtension = 0.75;
		this.pullFieldRange = 1.5;
		
		if (super.setup) super.setup(options);
	}
	
	enableJumpField() {
		//this.hasJumpField = true;
		if (!this.hasJumpField) {
			this.hasJumpField = true;
			this.jumpField = this.GP.makeObject('player_field', this.name + '_jump', this.position, this.rotation, { tint: 0x7fffff });
			let joint = this.GP.world.createJoint(planck.WeldJoint({
				frequencyHz : 0.0,
				dampingRatio : 0.0,
				localAnchorA: 0,
				localAnchorB: 0,
				referenceAngle: 0
			}, this.body, this.jumpField.body));
		}
	}
	
	enablePullField() {
		//this.hasPullField = true;
		if (!this.hasPullField) {
			this.hasPullField = true;
			this.pullField = this.GP.makeObject('player_field', this.name + '_pull', this.position, this.rotation, { tint: 0xd97fff });
			let joint = this.GP.world.createJoint(planck.WeldJoint({
				frequencyHz : 0.0,
				dampingRatio : 0.0,
				localAnchorA: 0,
				localAnchorB: 0,
				referenceAngle: 0
			}, this.body, this.pullField.body));
		}
	}
	
	enableShotgun(startsWithAmmo) {
		if (this.shotgun != null) { return; }
		
		this.shotgun = this.GP.makeObject('weapon_shotgun', this.name + '_weapon_shotgun', this.position, 0, {
			hasAmmo: !(startsWithAmmo === false)
		});
		this.shotgun.player = this;
		if (this.currentWeapon == null) {
			this.currentWeapon = 'shotgun';
			this.shotgun.active = true;
			this._trailColour = this.shotgun.readyTint;
			
			if (this.trail) { this.trail.setColour(this.shotgun.readyTint); }
		}
		else { this.shotgun.active = false; }
	}
	
	enableLauncher(startsWithAmmo) {
		if (this.launcher != null) { return; }
		
		this.launcher = this.GP.makeObject('weapon_launcher', this.name + '_weapon_launcher', this.position, 0, {
			hasAmmo: !(startsWithAmmo === false)
		});
		this.launcher.player = this;
		if (this.currentWeapon == null) {
			this.currentWeapon = 'launcher';
			this.launcher.active = true;
			this._trailColour = this.launcher.readyTint;
			
			if (this.trail) { this.trail.setColour(this.launcher.readyTint); }
		}
		else { this.launcher.active = false; }
	}
	
	enableTesla(startsWithAmmo) {
		if (this.tesla != null) { return; }
		
		this.tesla = this.GP.makeObject('weapon_tesla', this.name + '_weapon_tesla', this.position, 0, {
			hasAmmo: !(startsWithAmmo === false)
		});
		this.tesla.player = this;
		if (this.currentWeapon == null) {
			this.currentWeapon = 'tesla';
			this.tesla.active = true;
			this._trailColour = this.tesla.readyTint;
			
			if (this.trail) { this.trail.setColour(this.tesla.readyTint); }
		}
		else { this.tesla.active = false; }
	}
	
	addAmmo(amount) {
		this.ammo += amount;
		if (this.ammo > 6) this.ammo = 6;
	}
	
	update(deltaMS) {
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
			//let mouse = this.GP.app.renderer.plugins.interaction.mouse;
			
			current.position = this.position;
			
			//let wepPos = new PIXI.Point(0, 0);
			//current.sprites.getGlobalPosition(wepPos, false);
			//current.rotation = -utils.rotateToPoint(mouse.global, wepPos);
			
			current.rotation = utils.rotateToPoint(this.GP.mousePosGU, this.position);
			
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
			
			this.jumpField.update(deltaMS);
			
			// Update field size for next tick
			let JFE = this.jumpField.radius,
				newJFE = JFE;
			
			if (up && newJFE < this.jumpFieldRange) {
				newJFE += deltaS * 4;
				if (newJFE > this.jumpFieldRange) {newJFE = this.jumpFieldRange; }
			}
			if (!up && newJFE > 0.375) {
				newJFE -= deltaS * 4;
				if (newJFE < 0.375) {newJFE = 0.375; }
			}
			if (newJFE != JFE) {
				this.jumpField.radius = newJFE;
			}
			
			// Now do actual jumping.
			if (JFE > 0.375) {
				let pos = this.body.getPosition(),
					mass = this.body.getMass();
				
				for (let contact = this.jumpField.getContactList(); contact != null; contact = contact.next) {
					let otherIsPlayer = (contact.other.gameobject != null) ? (contact.other.gameobject === this) : false;
					
					if (!otherIsPlayer) {
						let other = contact.other,
							otherMass = other.getMass(),
							otherStatic = (otherMass === 0),
							otherLocalMassPos = other.getLocalCenter();
							
						if (otherStatic && other.manualMassCalc == null) {
							let otherMassData = { center: Vec2(0.0, 0.0) };
							other.m_fixtureList.m_shape.computeMass(otherMassData, 20);
							
							other.manualMassCalc = otherMassData;
							
						}
						if (otherStatic) {
							otherMass = other.manualMassCalc.mass;
							otherLocalMassPos = other.manualMassCalc.center;
						}
						
						
						let otherMassPos = other.getPosition().clone().add(otherLocalMassPos);
							
						let relative = otherMassPos.clone().sub(pos),
							distanceFactor = 1, // Anything within the field has distance factor of one.
							distance = relative.normalize();
						// If outside the field, a modified square root law applies
						if (distance > JFE) {
							let temp = (distance - JFE) + 1;
							distanceFactor = 1 / (temp * temp);
						}
						
						let otherFIF = (other.gameobject != null) ? other.gameobject.fieldImpFac : 1;
						
						let attrForce = -5 * distanceFactor,
							playerForPow = otherMass * attrForce * this.fieldImpFac,
							otherForPow = mass * -attrForce * otherFIF;
						
						let otherForce = relative.clone().mul(otherForPow);
						relative.mul(playerForPow);

						if (!otherStatic) { other.applyForce(otherForce, otherMassPos, true); }
						this.body.applyForce(relative, pos, true);
					}
				}
			}
		}
		
		// Pullfield
		if (this.hasPullField) {
			
			this.pullField.update(deltaMS);
			
			// Update field size for next tick
			let PFE = this.pullField.radius,
				newPFE = PFE;
			
			if (down && newPFE < this.pullFieldRange) {
				newPFE += deltaS * 4;
				if (newPFE > this.pullFieldRange) {newPFE = this.pullFieldRange; }
			}
			if (!down && newPFE > 0.375) {
				newPFE -= deltaS * 4;
				if (newPFE < 0.375) {newPFE = 0.375; }
			}
			if (newPFE != PFE) {
				this.pullField.radius = newPFE;
			}
			
			// Now do actual pulling.
			if (PFE > 0.375) {
				let pos = this.body.getPosition(),
					mass = this.body.getMass();
				
				for (let contact = this.pullField.getContactList(); contact != null; contact = contact.next) {
					let otherIsPlayer = (contact.other.gameobject != null) ? (contact.other.gameobject === this) : false;
					
					if (!otherIsPlayer) {
						let other = contact.other,
							otherMass = other.getMass(),
							otherStatic = (otherMass === 0),
							otherLocalMassPos = other.getLocalCenter();
							
						if (otherStatic && other.manualMassCalc == null) {
							let otherMassData = { center: Vec2(0.0, 0.0) };
							other.m_fixtureList.m_shape.computeMass(otherMassData, 20);
							
							other.manualMassCalc = otherMassData;
							
						}
						if (otherStatic) {
							otherMass = other.manualMassCalc.mass;
							otherLocalMassPos = other.manualMassCalc.center;
						}
						
						
						let otherMassPos = other.getPosition().clone().add(otherLocalMassPos);
							
						let relative = otherMassPos.clone().sub(pos),
							distanceFactor = 1,
							distance = relative.normalize();
						// If outside the field, a modified square root law applies
						if (distance > PFE) {
							let temp = (distance - PFE) + 1;
							distanceFactor = 1 / (temp * temp);
						}
						
						let otherFIF = (other.gameobject != null) ? other.gameobject.fieldImpFac : 1;
						
						let attrForce = 3 * distanceFactor,
							playerForPow = otherMass * attrForce * this.fieldImpFac,
							otherForPow = mass * -attrForce * otherFIF;
						
						let otherForce = relative.clone().mul(otherForPow);
						relative.mul(playerForPow);

						if (!otherStatic) { other.applyForce(otherForce, otherMassPos, true); }
						this.body.applyForce(relative, pos, true);
					}
				}
			}
		}
		
		// Jumpfield
		/*if (this.hasJumpField) {
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
					if (fixture.m_filterCategoryBits & 0xfbb4) {
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
						let otherFIF = (element.gameobject != null) ? element.gameobject.fieldImpFac : 1;
						
						let attrForce = 3 * deltaS;
						let playerImpPow = otherStatic ? 200 * attrForce * this.fieldImpFac : elemMass * attrForce * this.fieldImpFac;
						let otherImpPow = mass * attrForce * otherFIF;
						
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
		}*/
		
		// Pullfield
		/*if (this.hasPullField) {
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
					if (fixture.m_filterCategoryBits & 0xfbb4) {
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
						let otherFIF = (element.gameobject != null) ? element.gameobject.fieldImpFac : 1;
						
						let attrForce = 2 * deltaS;
						let playerImpPow = otherStatic ? 100 * attrForce * this.fieldImpFac : elemMass * attrForce * this.fieldImpFac;
						let otherImpPow = mass * attrForce * otherFIF;
						
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
		}*/
		
		// Torque
		let angVel = this.body.getAngularVelocity();
		if (left && !right && angVel < (6 * utils.PI * this.fieldImpFac)) { this.body.applyTorque(30 * this.fieldImpFac, true); }
		if (right && !left && angVel > (-6 * utils.PI * this.fieldImpFac)) { this.body.applyTorque(-30 * this.fieldImpFac, true); }
		if (left && right) {
			// brake
			if (angVel > 0) {
				let factor = 2;
				if (angVel < 2) { factor = angVel; }
				this.body.applyTorque(-factor * 15 * this.fieldImpFac, true);
			}
			
			if (angVel < 0) {
				let factor = 2;
				if (angVel > -2) { factor = -angVel; }
				this.body.applyTorque(factor * 15 * this.fieldImpFac, true);
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
		
		if (super.update) super.update(deltaMS);
	}
	
	destroy(options) {
		utils.setCursorIcon(this.GP, "white");
		
		if (super.destroy) super.destroy(options);
	}
	
	destructor(options) {
		if (this.shotgun) this.shotgun.destroy(true);
		if (this.launcher) this.launcher.destroy(true);
		if (this.tesla) this.tesla.destroy(true);
		
		if (this.jumpField) this.jumpField.destroy(true);
		if (this.pullField) this.pullField.destroy(true);
		
		this.GP.trigger_player_death(this.position);
	}
}

prefabs.mixins['player_field'] = (superclass) => class extends superclass {
	setup(options) {
		if (super.setup) super.setup(options);
		
		this.sprites.children[0].tint = options.tint;
		this.sprites.children[0].visible = false;
		
		this.fixtureDef = {
			name: 'field',
			//shape: planck.Circle(0.375),
			
			isSensor: true,
			
			density: 0.0001,
			friction: 0.5,
			restitution: 0.25,
			
			filterCategoryBits: 0x0001,
			filterMaskBits: 0xf3b0
		}
	}
	
	get radius() {
		let rad = this.body.m_fixtureList.m_shape.m_radius;
		return rad;
	}
	
	set radius(newRadius) {
		this.body.destroyFixture(this.body.m_fixtureList);
		this.fixtureDef.shape = planck.Circle(newRadius);
		this.body.createFixture(this.fixtureDef);
		
		let sprSc = utils.getSpriteScale(this.GP, 128, 2 * newRadius);
		this.sprites.children[0].scale.set(sprSc, sprSc);
		
		if (newRadius > 0.375) { this.sprites.children[0].visible = true; }
		else { this.sprites.children[0].visible = false; }
	}
	
	getContactList() {
		return this.body.getContactList();
	}
}

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
			
			utils.setCursorIcon(this.GP, this.cursorColour);
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
			this.clip != this.clipMax &&
			this.player.ammo > 0) {
			
			let remainder = this.clip / this.clipMax,
				toTake = 1 - remainder,
				floatPointHack = false;
			
			let reloadAmount = 0;
			if (this.player.ammo >= toTake) { reloadAmount = toTake * this.clipMax; } 
			else if (this.player.ammo > 0) {
				let t1 = this.player.ammo * this.clipMax,
					available = Math.floor(t1);
				if (t1 - available > 0.975) { available = Math.ceil(t1); floatPointHack = true; }
				
				if (available > 0) {
					reloadAmount = available;
					toTake = available / this.clipMax;
				}
			}
			
			if (reloadAmount > 0) {
				this.player.ammo = floatPointHack ? 0 : this.player.ammo - toTake;
				this.clip += reloadAmount;
				
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
			
		let i = 1,
			angle = -2 * pointSep;
		
		for (; i <= this.player.ammo; i++) {
			let centre = Vec2(Math.cos(angle) * offset, Math.sin(angle) * offset);
			ammoSpr.drawCircle(centre.x, centre.y, radius);
			
			angle -= pointSep;
		}
		
		if (!Number.isInteger(this.player.ammo)) {
			// Draw the last clip as a partial dot, to represent a partial clip.
			let centre = Vec2(Math.cos(angle) * offset, Math.sin(angle) * offset),
				prop = this.player.ammo - Math.floor(this.player.ammo),
				startAngle = (utils.PI * -0.5) - (utils.TAU * prop); 
			
			ammoSpr.arc(centre.x, centre.y, radius, startAngle, utils.PI * -0.5).lineTo(centre.x, centre.y);
		}
		
		/*for (let i = 0; i < this.player.ammo; i++) {
			let angle = -(i + 2) * pointSep;
			let centre = Vec2(Math.cos(angle) * offset, Math.sin(angle) * offset);
			
			ammoSpr.drawCircle(centre.x, centre.y, radius);
		}*/
		
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
		
		this.cursorColour = "blue";
		
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
			
			let fif = this.player.fieldImpFac;
			
			let pelletImpStr = 75 * fif;
			let playerImpStr = 30 * fif;
			let halfAngle = ((1 - (this.charge / this.chargeMax)) * (utils.PI/24)) + (utils.PI/72); // Angle somewhere between 2.5 and 10 degrees, proportional to charge.
			
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
		
		this.cursorColour = "red";
		
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
			let proj = this.GP.makeObject('proj_launcher', null, myPos, this.rotation, {charge: this.charge, chargeMax: this.chargeMax});
			
			let plImp = Vec2(Math.cos(this.rotation), Math.sin(this.rotation)).mul(this.player.fieldImpFac),			
				prImp = plImp.clone().mul(150);
			plImp.mul(-50);
			
			this.player.body.applyLinearImpulse(plImp, this.player.body.getPosition(), true);
			proj.body.applyLinearImpulse(prImp, proj.body.getPosition(), true);
			
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
		
		this.cursorColour = "green";
		
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
			if (fixture.m_filterCategoryBits & 0xfb15) {
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
				let power = ratio * 100 * this.fieldImpFac;
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
			if (fixture.m_filterCategoryBits & 0xfb04) {
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
				checkOriginOffset.mul(-(range - 1)).add(this.position);
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
		bestTarget.damage(3);
		
		// Visuals
		let vis = new visuals.tesla_beam(this.GP, this.position, dest);
		
		// Impulse
		let otherMassPos = otherBody.getPosition().clone().add(otherBody.getLocalCenter()),
			otherMass = otherBody.getMass(),
			otherFIF = (otherBody.gameobject != null) ? otherBody.gameobject.fieldImpFac : 1;
			
		let myMassPos = myBody.getPosition().clone().add(myBody.getLocalCenter()),
			myMass = myBody.getMass(),
			myFIF = (myBody.gameobject != null) ? myBody.gameobject.fieldImpFac : 1;;
		
		let otherStatic = otherMass === 0,
			attrForce = 5,
			myImpPow = otherStatic ? 200 * attrForce * myFIF : otherMass * attrForce * myFIF,
			otherImpPow = myMass * attrForce * otherFIF;
		
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

prefabs.mixins['proj_trigger'] = (superclass) => class extends superclass {
	setup(options) {
		this.origin = options.origin;
		this.effectType = options.effectType;
		this.particleName = options.particleName;
		this.tint = options.tint;
		this.tintString = options.tintString;
		this.targetFunction = options.targetFunction;
		this.targetFunctionParameters = options.targetFunctionParameters;
		
		this.sprites.children[0].tint = this.tint;
		
		this._trailThickness = 0.25;
		this._trailLifespan	= 0.5;
		this._trailColour = this.tint;
		this._trailAlpha = 0.5;
		
		//let facing = Vec2(Math.cos(this.rotation) * 5, Math.sin(this.rotation) * 5);
		//this.body.applyLinearImpulse(facing, this.position, true);
		
		this.visual = new visuals.proj_trigger(this);
		
		this._targeted = false;
		this._triggered = false;
		
		if (super.setup) super.setup(options);
	}
	
	update(deltaMS) {
		if (this._targeted && (this.target == null || this.target._markedForDeath)) {
			this.destroy(false);
			if (super.update) super.update(deltaMS);
			return;
		} 
		
		if (this._triggered) { this.trigger(); }
		else {
			let myPos = this.position,
				myRot = this.rotation,
				destPos = (this._targeted) ? this.target.position : this.origin.position,
				relative = destPos.clone().sub(myPos),
				relAng = Math.atan2(relative.y, relative.x),
				deltaAng = utils.bearingDelta(myRot, relAng);
			
			// Friction component.
			let linVel = this.body.getLinearVelocity().clone();
				linVel.normalize();
			
			if (this._targeted) {
				// Chase the target (eg. the player)
				linVel.mul(-10);
				
				let facing = relative.clone();
				facing.normalize();
				facing.mul(20).add(linVel);
				
				this.body.applyForce(facing, myPos, true);
			}
			else {
				// Circle the origin (thing that spawned this) until given a target.
				linVel.mul(-10);				
				
				// Forward movement.
				let forward = Vec2(Math.cos(myRot), Math.sin(myRot));
				let orbitFactor = Math.abs(deltaAng) / utils.PI; // 0 to 1. 0.5 is optimal.
				orbitFactor = orbitFactor < 0.5 ? 1 - Math.abs(orbitFactor - 0.5) : 1 - (Math.abs(orbitFactor - 0.5) * 2);
				
				//forward.normalize();
				forward.mul(17.5 * orbitFactor).add(linVel);
				this.body.applyForce(forward, myPos, true);
				
				// Rotation.
				let myAngVel = this.body.getAngularVelocity(),
					angForce;
				if (myAngVel > 3) { angForce = -1; }
				else if (myAngVel < -3) { angForce = 1; }
				else { angForce = deltaAng / utils.PI; }
				
				// angForce *= 1;
				
				this.body.applyTorque(angForce, true);
			}
		}
		if (super.update) super.update(deltaMS);
	}
	
	giveTarget(target) {
		this.target = target;
		this._targeted = true;
	}
	
	trigger() {
		if (this.target == null || this.target._markedForDeath) {
			this.destroy(false);
			return;
		}
		
		if (this.targetFunctionParameters != null) { this.target[this.targetFunction](this.targetFunctionParameters); }
		else { this.target[this.targetFunction](); }
		this.destroy(false);
	}
	
	destroy(immediate) {
		this.visual.stopEmitting();
		visuals.proj_trigger_death(this.GP, this.position, this.tintString, this.particleName);
		
		super.destroy(immediate);
	}
}


//	***
//	General Gameplay mixins
//	***

prefabs.mixins['pull_bobble'] = (superclass) => class extends superclass {
	setup(options) {
		this.home = this.position.clone();
		this._stiffness = 20;
		
		options.maxHP = -1;
		
		this.visual = new visuals.pull_bobble_tether(this);
		
		if (super.setup) super.setup(options);
	}
	
	update(deltaMS) {
		let pos = this.position;
		let posM = this.body.getPosition();
		if (pos.x != this.home.x && pos.y != this.home.y) {
			// Apply a force pulling it back home.
			// Uses Hooke's law.
			let relative = this.home.clone().sub(pos),
				disp = relative.normalize(); // Normalize returns length prior to normalization. Useful! Sometimes. Mostly a pain in the arse, actually.
				
			let force = this._stiffness * disp;
			relative.mul(force);
			this.body.applyForce(relative, posM);
		}
		
		// Friction
		let linVel = this.body.getLinearVelocity();
		if (linVel.lengthSquared() != 0) {
			let friction = linVel.clone().mul(-5);
			this.body.applyForce(friction, posM);
		}
		
		// Angular friction
		let rotVel = this.body.getAngularVelocity();
		if (rotVel != 0) {
			rotVel *= -1;
			this.body.applyTorque(rotVel);
		}
		
		this.visual.updatePosition(pos, this.home);
		
		if (super.update) super.update(deltaMS);
	}
	
	destructor(options) { this.visual._markedForDeath = true; }
}

prefabs.mixins['player_unlock'] = (superclass) => class extends superclass {
	translateOptions(bitA, bitB) {
		let opts = super.translateOptions(bitA, bitB);
		utils.translatePlayerOptions(opts, bitA, bitB);
				
		opts.maxHP = 20;

		return opts;
	}
	
	setup(options) {
		if (super.setup) super.setup(options);
		
		this._field_kill_applicable = true;
		
		this.effects = {
			count: 0,
			hasJumpField:			options.hasJumpField,
			hasPullField:			options.hasPullField,
			hasShotgun:				options.hasShotgun,
			shotgunStartsWithAmmo:	options.shotgunStartsWithAmmo,
			hasLauncher:			options.hasLauncher,
			launcherStartsWithAmmo:	options.launcherStartsWithAmmo,
			hasTesla:				options.hasTesla,
			teslaStartsWithAmmo:	options.teslaStartsWithAmmo
			//startingAmmo: options.startingAmmo
		};
		
		// There's almost certainly a smart way of doing this. This isn't it.
		if (this.effects.hasJumpField)				this.effects.count++;
		if (this.effects.hasPullField)				this.effects.count++;
		if (this.effects.hasShotgun)				this.effects.count++;
		if (this.effects.hasLauncher)				this.effects.count++;
		if (this.effects.hasTesla)					this.effects.count++;
		
		this.projectiles = [];
		
		// Spawn proj_triggers in a circling pattern.
		let effectsTriggered = 0,
			subAngle = utils.TAU / this.effects.count,
			spawnAngle = this.rotation,
			myPos = this.position.clone(),
			ninetyDeg = utils.PI / 2;
		
		if (this.effects.hasJumpField) {
			let offset = Vec2(Math.cos(spawnAngle), Math.sin(spawnAngle));
			let proj = this.GP.makeObject('proj_trigger', null, offset.add(myPos), spawnAngle + ninetyDeg, {
				origin: this,
				effectType:		'jumpFields',
				particleName:	'equilateral.png',
				tint:			0x7fffff,
				tintString:		'7fffff',
				targetFunction:	'enableJumpField',
				targetFunctionParameters: null
			});
			
			this.projectiles.push(proj);
			spawnAngle += subAngle;
			effectsTriggered++;
		}
		
		if (this.effects.hasPullField) {
			let offset = Vec2(Math.cos(spawnAngle), Math.sin(spawnAngle));
			let proj = this.GP.makeObject('proj_trigger', null, offset.add(myPos), spawnAngle + ninetyDeg, {
				origin: this,
				effectType:		'jumpFields',
				particleName:	'equilateral.png',
				tint:			0xd97fff,
				tintString:		'd97fff',
				targetFunction:	'enablePullField',
				targetFunctionParameters: null
			});
			
			this.projectiles.push(proj);
			spawnAngle += subAngle;
			effectsTriggered++;
		}
		
		if (this.effects.hasShotgun) {
			let offset = Vec2(Math.cos(spawnAngle), Math.sin(spawnAngle));
			let proj = this.GP.makeObject('proj_trigger', null, offset.add(myPos), spawnAngle + ninetyDeg, {
				origin: this,
				effectType:		'shotgun',
				particleName:	'equilateral.png',
				tint:			0x0000ff,
				tintString:		'0000ff',
				targetFunction:	'enableShotgun',
				targetFunctionParameters: this.effects.shotgunStartsWithAmmo
			});
			
			this.projectiles.push(proj);			
			spawnAngle += subAngle;
			effectsTriggered++;
		}
		
		if (this.effects.hasLauncher) {
			let offset = Vec2(Math.cos(spawnAngle), Math.sin(spawnAngle));
			let proj = this.GP.makeObject('proj_trigger', null, offset.add(myPos), spawnAngle + ninetyDeg, {
				origin: this,
				effectType:		'launcher',
				particleName:	'equilateral.png',
				tint:			0xff0000,
				tintString:		'ff0000',
				targetFunction:	'enableLauncher',
				targetFunctionParameters: this.effects.launcherStartsWithAmmo
			});
			
			this.projectiles.push(proj);
			spawnAngle += subAngle;
			effectsTriggered++;
		}
		
		if (this.effects.hasTesla) {
			let offset = Vec2(Math.cos(spawnAngle), Math.sin(spawnAngle));
			let proj = this.GP.makeObject('proj_trigger', null, offset.add(myPos), spawnAngle + ninetyDeg, {
				origin: this,
				effectType:		'tesla',
				particleName:	'equilateral.png',
				tint:			0x00bf00,
				tintString:		'00bf00',
				targetFunction:	'enableTesla',
				targetFunctionParameters: this.effects.teslaStartsWithAmmo
			});
			
			this.projectiles.push(proj);
			spawnAngle += subAngle;
			effectsTriggered++;
		}
		
		if (effectsTriggered != this.effects.count) { "WARNING: Detected a player_unlock instance spawn effect count mismatch." }
	}
	
	destructor(options) {
		if (super.destructor) { super.destructor(options); }
		
		let myPos = this.position.clone(),
			particleCount = Math.ceil(10 / this.effects.count),
			player = this.GP.getObjectsOfType('player', false)[0];
		
		if (player == null || player._markedForDeath) {
			visuals.powerup_death(this.GP, myPos, 10, '000000');
			return;
		}
		
		this.projectiles.forEach((element) => {
			visuals.powerup_death(this.GP, myPos, particleCount, element.tintString);
			
			let relative = element.position.clone().sub(myPos);
			relative.normalize();
			relative.mul(25);
			element.body.applyLinearImpulse(relative, element.position, true);
			
			element.giveTarget(player);
		});
	}
}

prefabs.mixins['player_ammo'] = (superclass) => class extends superclass {
	translateOptions(bitA, bitB) {
		let opts = super.translateOptions(bitA, bitB);
		utils.translatePlayerOptions(opts, bitA, bitB);
				
		opts.maxHP = 20;

		return opts;
	}
	
	setup(options) {
		if (super.setup) super.setup(options);
		
		this._field_kill_applicable = true;
		
		this.effects = {
			/*count: 0,
			hasJumpField:			options.hasJumpField,
			hasPullField:			options.hasPullField,
			hasShotgun:				options.hasShotgun,
			shotgunStartsWithAmmo:	options.shotgunStartsWithAmmo,
			hasLauncher:			options.hasLauncher,
			launcherStartsWithAmmo:	options.launcherStartsWithAmmo,
			hasTesla:				options.hasTesla,
			teslaStartsWithAmmo:	options.teslaStartsWithAmmo*/
			startingAmmo: options.startingAmmo
		};
		
		this.projectiles = [];
		
		// Spawn proj_triggers in a circling pattern.
		let subAngle = utils.TAU / this.effects.startingAmmo,
			spawnAngle = this.rotation,
			myPos = this.position.clone(),
			ninetyDeg = utils.PI / 2;
		
		for (let i = 0; i < this.effects.startingAmmo; i++) {
			let offset = Vec2(Math.cos(spawnAngle), Math.sin(spawnAngle));
			let proj = this.GP.makeObject('proj_trigger', null, offset.add(myPos), spawnAngle + ninetyDeg, {
				origin: this,
				effectType:		'addAmmo',
				particleName:	'equilateral.png',
				tint:			0x000000,
				tintString:		'000000',
				targetFunction:	'addAmmo',
				targetFunctionParameters: 1
			});
			
			this.projectiles.push(proj);
			spawnAngle += subAngle;
		}
	}
	
	destructor(options) {
		let myPos = this.position.clone(),
			player = this.GP.getObjectsOfType('player', false)[0];
		
		if (player == null || player._markedForDeath) {
			visuals.powerup_death(this.GP, myPos, 10, '000000');
			return;
		}
		
		this.projectiles.forEach((element) => {
			let relative = element.position.clone().sub(myPos);
			relative.normalize();
			relative.mul(25);
			element.body.applyLinearImpulse(relative, element.position, true);
			
			element.giveTarget(player);
		});
		
		visuals.powerup_death(this.GP, myPos, 10, '000000');
	}
}

prefabs.mixins['player_spawn'] = (superclass) => class extends superclass {
	translateOptions(bitA, bitB) {
		let opts = super.translateOptions(bitA, bitB);
		utils.translatePlayerOptions(opts, bitA, bitB);
				
		opts.maxHP = 20;

		return opts;
	}
	
	setup(options) {
		if (super.setup) super.setup(options);
		
		this.visual = visuals.player_spawn_and_goal(this.GP, this.position, 180);
		this.GP.makeObject('player', null, this.position, 0, options);
	}
	
	destructor(options) {
		this.visual.destroy();
		if (super.destructor) { super.destructor(options); }
	}
}

prefabs.mixins['player_goal'] = (superclass) => class extends superclass {
	setup(options) {
		if (super.setup) super.setup(options);
		
		this.visual = visuals.player_spawn_and_goal(this.GP, this.position, 0);
	}
	
	update(deltaMS) {
		let playerOverlap = false;
		for (let overlap = this.body.getContactList();
			overlap != null && !playerOverlap;
			overlap = overlap.next) {
			if (overlap.other.gameobject != null) {
				if (overlap.other.gameobject.type === 'player') { playerOverlap = true; }
			}
		}
		
		if (playerOverlap) { this.GP.trigger_player_reached_goal(this); }
		if (super.update) super.update(deltaMS);
	}
	
	destructor(options) {
		this.visual.destroy();
		if (super.destructor) { super.destructor(options); }
	}
}

//	***
//	Enemy mixins
//	***

prefabs.mixins['spawner_enemy_walker'] = (superclass) => class extends superclass {
	translateOptions(bitA, bitB) {
		let opts = super.translateOptions(bitA, bitB);
		
		opts.maxCount = (bitB & 0x0f);
		opts.cooldown = ((bitB & 0xf0) >>> 4);
		
		if (opts.maxCount === 0) { opts.maxCount = 5; }
		if (opts.cooldown === 0) { opts.cooldown = 3; }

		opts.rotCat = (bitA & 0x06) >>> 1;
		
		return opts;
	}
	
	setup(options) {
		this.preset = {
			rotation: options.rotCat,
			maxCount: options.maxCount,
			cooldown: options.cooldown * 1000
		}
		
		this.spawns = [];
		this._cooldown = this.preset.cooldown;
		this._nextSpawnDir = 0;
		
		// Ugly but probably faster than trig:
		if (this.preset.rotation === 1)			{ this.spawnOffset = Vec2(0, 1); }
		else if (this.preset.rotation === 2)	{ this.spawnOffset = Vec2(-1, 0); }
		else if (this.preset.rotation === 3)	{ this.spawnOffset = Vec2(0, -1); }
		else									{ this.spawnOffset = Vec2(1, 0); }
		
		this.sprites.timer = new PIXI.Graphics();
		this.sprites.timer.zIndex = 15;
		this.sprites.timer.tint = 0xff0000;
		this.sprites.addChild(this.sprites.timer);
		this._totalTimerSlices = 16;
		this._currentTimerSlices = 0;
		
		this.sprites.counter = new PIXI.Graphics();
		this.sprites.counter.zIndex = 16;
		this.sprites.counter.tint = 0x000000;
		this.sprites.addChild(this.sprites.counter);
		
		if (super.setup) super.setup(options);
	}
	
	update(deltaMS) {
		if (super.update) super.update(deltaMS);
		
		if (this.spawns.length < this.preset.maxCount) {
			this._cooldown -= deltaMS;
			if (this._cooldown < 0) { this._cooldown = 0; }
		}
		
		let cooldownSlices = Math.round((1 - (this._cooldown / this.preset.cooldown)) * this._totalTimerSlices);
		if (cooldownSlices !== this._currentTimerSlices) {
			this._currentTimerSlices = cooldownSlices;
			this.redrawTimer();
		}
		
		if (this._cooldown === 0) {
			this._cooldown = this.preset.cooldown;
			let spawnPos = this.position.clone().add(this.spawnOffset),
				direction;
				
			let blocked = false;
			let lower = spawnPos.clone().sub(Vec2(0.25, 0.25));
			let upper = spawnPos.clone().add(Vec2(0.25, 0.25));
			let aabb = planck.AABB(lower, upper);
			this.GP.world.queryAABB(aabb, (fixture) => {
				if (fixture.m_filterCategoryBits & 0x0020) { blocked = true; }
			});
			
			if (this.preset.rotation === 0)			{ direction = 1; }
			else if (this.preset.rotation === 2)	{ direction = 0; }
			else {
				direction = this._nextSpawnDir;
				this._nextSpawnDir = (this._nextSpawnDir === 0) ? 1 : 0;
			}
			
			if (!blocked) {
				let newEnemy = this.GP.makeObject('enemy_walker', null, spawnPos, 0, {
					spawner: this,
					startGoingRight: direction
				});
				this.spawns.push(newEnemy);
				this.redrawCounter();
			}
		}
	}
	
	redrawTimer() {
		let angle = this.rotation - utils.PI / 2,
			subAngle = utils.TAU / this._totalTimerSlices,
			innerRad = this.GP.relGU2P(0.625 * 0.5),
			outerRad = this.GP.relGU2P(0.875 * 0.5);
		
		if (this._currentTimerSlices === 0) {
			this.sprites.timer.visible = false;
			return;
		}
		else { this.sprites.timer.visible = true; }
		
		this.sprites.timer.clear();
			
		for (let i = 0; i < this._currentTimerSlices; i++) {
			let nextAng = angle + subAngle;
			
			this.sprites.timer.lineStyle(0, 0, 0);
			this.sprites.timer.beginFill(0xffffff, 1);
			
			let points = [];
			points.push(new PIXI.Point(Math.cos(angle) * innerRad, Math.sin(angle) * innerRad));
			points.push(new PIXI.Point(Math.cos(angle) * outerRad, Math.sin(angle) * outerRad));
			points.push(new PIXI.Point(Math.cos(nextAng) * outerRad, Math.sin(nextAng) * outerRad));
			points.push(new PIXI.Point(Math.cos(nextAng) * innerRad, Math.sin(nextAng) * innerRad));
			
			this.sprites.timer.drawPolygon(points);
			
			angle = nextAng;
		}
	}
	
	redrawCounter() {
		let seg = utils.TAU / this.preset.maxCount,
			halfSeg = seg * 0.5,
			angle = (this.rotation - utils.PI / 2) + halfSeg;
			
		let posRad = this.GP.relGU2P(0.75 * 0.5),
			bobbleRad = this.GP.relGU2P(0.125 * 0.5);
			
		this.sprites.counter.clear();
		this.sprites.counter.lineStyle(0, 0, 0);
		this.sprites.counter.beginFill(0xffffff, 1);
		
		for (let i = 0; i < this.spawns.length; i++) {
			let centre = new PIXI.Point(Math.cos(angle) * posRad, Math.sin(angle) * posRad);
			this.sprites.counter.drawCircle(centre.x, centre.y, bobbleRad);
			angle += seg;
		}
	}
	
	removeFromSpawnList(enemy) {
		let index = this.spawns.findIndex((element) => (element === enemy));
		if (index != null && index !== -1) {
			this.spawns.splice(index, 1);
			this.redrawCounter();
		}
	}
}

prefabs.mixins['enemy_walker'] = (superclass) => class extends superclass {
	translateOptions(bitA, bitB) {
		let opts = super.translateOptions(bitA, bitB);
		
		opts.startGoingRight = (bitA & 0x04) != 0;
				
		opts.maxHP = 20;

		return opts;
	}
	
	setup(options) {
		this.sprites.body	= this.sprites.children[0];
		this.sprites.arrow	= this.sprites.children[1];
		this.sprites.stop	= this.sprites.children[2];
		
		this._spawner = (options.spawner != null) ? options.spawner : null;
		this._nextDirState = options.startGoingRight ? 1 : 0;
		this._state = options.startGoingRight ? 1 : 0;
		/*
		 *	Behaviour States:
		 *	0:	Going left.
		 *	1:	Going right.
		 *	2:	In the air.
		*/
		
		this._field_kill_applicable = true;
		
		this._leftContact = false;
		this._rightContact = false;
		this._exclaTimeout = 0;
		this._stateChangeCooldown = 0;
		this._stoppedCountup = 0;
		
		this._deathAngle = null;
		
		// Setup ground sensor.
		this.groundSensor = this.GP.makeObject('enemy_sensor', this.name + '_sensor', this.position.clone().sub(Vec2(0.0, 0.5)), 0);
		this.groundSensor.body.setFixedRotation(true);
		let joint = this.GP.world.createJoint(planck.RevoluteJoint({
			localAnchorA: Vec2(0, 0),
			localAnchorB: Vec2(0.0, 0.5)
		}, this.body, this.groundSensor.body));
		
		if (super.setup) super.setup(options);
	}
	
	update(deltaMS) {
		let angVel = this.body.getAngularVelocity();
		
		this._stateChangeCooldown -= deltaMS;
		if (this._stateChangeCooldown < 0) { this._stateChangeCooldown = 0; }
		if (Math.abs(angVel) < 0.5) {
			this._exclaTimeout -= deltaMS;
			if (this._exclaTimeout < 0) { this._exclaTimeout = 0; }
		}
		if (Math.abs(angVel) < 0.1) { this._stoppedCountup += deltaMS; }
		else {this._stoppedCountup = 0; }
		
		
		let touchingGround = (this.groundSensor.body.getContactList() != null);
		
		// Check collisions and sensor, update state.
		if (!touchingGround) {
			if (this._state !== 2) {
				this._state = 2;
			}
			
			if (this._nextDirState === 0 && this._leftContact && this._stateChangeCooldown === 0) {
				this._nextDirState = 1;
				this._stateChangeCooldown = 1000;
			}
			else if (this._nextDirState === 1 && this._rightContact && this._stateChangeCooldown === 0) {
				this._nextDirState = 0;
				this._stateChangeCooldown = 1000;
			}
			
			this._exclaTimeout = 1500;
		}
		else {
			if (this._state === 0 && (this._leftContact || angVel < -0.5) && this._stateChangeCooldown === 0) {
				this._state = 1;
				this._nextDirState = 1;
				this._stateChangeCooldown = 1000;
			}
			else if (this._state === 1 && (this._rightContact || angVel > 0.5)  && this._stateChangeCooldown === 0) {
				this._state = 0;
				this._nextDirState = 0;
				this._stateChangeCooldown = 1000;
			}
			else if (this._state === 2 && this._exclaTimeout === 0 && Math.abs(angVel) < 0.5) {
				this._state = this._nextDirState;
				this._stateChangeCooldown = 1000;
			}
			
			if (this._state < 2 && this._stoppedCountup > 2000) {
				this._state = (this._state === 1) ? 0 : 1;
				this._nextDirState = this._state;
				this._stoppedCountup = 0;
			}
		}
		
		// Implement state.
		if (this._state < 2) {
			// Moving
			this.sprites.arrow.visible = true;
			this.sprites.stop.visible = false;
			
			let dirFac = (this._state === 1) ? -1 : 1;
			let angVel1 = dirFac * angVel;
			if (angVel1 < 10 * this.fieldImpFac) { this.body.applyTorque(dirFac * 15 * this.fieldImpFac, true); }
		}
		else {
			// In the air.
			this.sprites.arrow.visible = false;
			this.sprites.stop.visible = true;
			
			// Just dampen rotation.
			if (angVel < 0) { this.body.applyTorque(15 * this.fieldImpFac, true); }
			if (angVel > 0) { this.body.applyTorque(-15 * this.fieldImpFac, true); }
		}
		
		// Reset collision listener triggers
		this._leftContact = false;
		this._rightContact = false;
		
		if (super.update) super.update(deltaMS);
		this.sprites.arrow.rotation	= (this._state === 1) ? this.rotation : this.rotation + utils.PI;
		this.sprites.stop.rotation	= this.rotation;
		
		this.groundSensor.update(deltaMS);
	}
	
	destructor(options) {
		if (this._spawner != null) { this._spawner.removeFromSpawnList(this); }
		
		this.groundSensor.destroy(true);
		if (super.destructor) super.destructor(options);
		let deathRot;
		if (this._deathAngle != null) {deathRot = this._deathAngle; }
		else {
			let linVel = this.body.getLinearVelocity();
			deathRot = Math.atan2(linVel.y, linVel.x);
		}
		visuals.enemy_death(this.GP, this.position, deathRot);
	}
}

prefabs.mixins['enemy_flier'] = (superclass) => class extends superclass {
	translateOptions(bitA, bitB) {
		let opts = super.translateOptions(bitA, bitB);
		
		opts.startGoingRight = (bitA & 0x04) != 0;
				
		opts.maxHP = 20;

		return opts;
	}
	
	setup(options) {
		this.sprites.bodyMain	= this.sprites.children[0];
		this.sprites.bodyUpper	= this.sprites.children[1];
		this.sprites.arrow		= this.sprites.children[2];
		this.sprites.stop		= this.sprites.children[3];
		
		this._desiredHeight = this.position.y;
		this._nextDirState = options.startGoingRight ? 1 : 0;
		this._state = options.startGoingRight ? 1 : 0;
		/*
		 *	Behaviour States:
		 *	0:	Going left.
		 *	1:	Going right.
		 *	2:	Stunned
		*/
		
		// Platform subassembly setup
		this.body.setFixedRotation(true);
		this.platform = this.GP.makeObject('enemy_flier_platform', this.name + '_platform', this.position, 0, { parentFlier: this });
		let joint1 = this.GP.world.createJoint(planck.WeldJoint({
				frequencyHz : 0.0,
				dampingRatio : 0.0,
				localAnchorA: 0,
				localAnchorB: 0,
				referenceAngle: 0
			}, this.body, this.platform.body));
		
		this._field_kill_applicable = true;
		
		this._leftContact = false;
		this._rightContact = false;
		this._stunContact = false;
		this._exclaTimeout = 0;
		this._stateChangeCooldown = 0;
		this._stoppedCountup = 0;
		
		this._deathAngle = null;
		
		// Setup upper and lower sensor.
		this.upperSensor = this.GP.makeObject('enemy_sensor', this.name + '_sensor_upper', this.position.clone().add(Vec2(0.0, 0.5)), 0);
		this.upperSensor.body.setFixedRotation(true);
		let joint2 = this.GP.world.createJoint(planck.RevoluteJoint({
			localAnchorA: Vec2(0, 0),
			localAnchorB: Vec2(0.0, -0.5)
		}, this.body, this.upperSensor.body));
		
		this.lowerSensor = this.GP.makeObject('enemy_sensor', this.name + '_sensor_lower', this.position.clone().sub(Vec2(0.0, 0.5)), 0);
		this.lowerSensor.body.setFixedRotation(true);
		let joint3 = this.GP.world.createJoint(planck.RevoluteJoint({
			localAnchorA: Vec2(0, 0),
			localAnchorB: Vec2(0.0, 0.5)
		}, this.body, this.lowerSensor.body));
		
		if (super.setup) super.setup(options);
	}
	
	update(deltaMS) {
		let linVel = this.body.getLinearVelocity(),
			velSq = linVel.lengthSquared();
		
		this.platform.updateContact();
		
		this._stateChangeCooldown -= deltaMS;
		if (this._stateChangeCooldown < 0) { this._stateChangeCooldown = 0; }
		if (velSq < 1 && !this._stunContact) {
			this._exclaTimeout -= deltaMS;
			if (this._exclaTimeout < 0) { this._exclaTimeout = 0; }
		}
		if (velSq < 0.1) { this._stoppedCountup += deltaMS; }
		else {this._stoppedCountup = 0; }
		
		
		let stuffAbove = (this.upperSensor.body.getContactList() != null),
			stuffBelow = (this.lowerSensor.body.getContactList() != null);
		
		// Check collisions and sensor, update state.
		if (this._stunContact) {
			
			if (this._state !== 2) {
				this._state = 2;
			}
			
			if (this._nextDirState === 0 && this._leftContact && this._stateChangeCooldown === 0) {
				this._nextDirState = 1;
				this._stateChangeCooldown = 1000;
			}
			else if (this._nextDirState === 1 && this._rightContact && this._stateChangeCooldown === 0) {
				this._nextDirState = 0;
				this._stateChangeCooldown = 1000;
			}
			
			this._exclaTimeout = 1500;
		}
		else {
			if (this._state === 0 && (this._leftContact || linVel.x > 1) && this._stateChangeCooldown === 0) {
				this._state = 1;
				this._nextDirState = 1;
				this._stateChangeCooldown = 1000;
			}
			else if (this._state === 1 && (this._rightContact || linVel.x < -1) && this._stateChangeCooldown === 0) {
				this._state = 0;
				this._nextDirState = 0;
				this._stateChangeCooldown = 1000;
			}
			else if (this._state === 2 && this._exclaTimeout === 0 && velSq < 1) {
				this._state = this._nextDirState;
				this._stateChangeCooldown = 1000;
			}
			
			if (this._state < 2 && this._stoppedCountup > 2000) {
				this._state = (this._state === 1) ? 0 : 1;
				this._nextDirState = this._state;
				this._stoppedCountup = 0;
			}
		}
		
		let totalForce = 10 * this.fieldImpFac,
			frictionForce = 5 * this.fieldImpFac;
		
		// 'Friction'.
			let friction = linVel.clone().mul(-1);
			friction.normalize(),
			friction.mul(frictionForce);
		
		// Implement state.
		if (this._state < 2) {
			// Moving. Get x and y, normalize, give a set total force.
			this.sprites.arrow.visible = true;
			this.sprites.stop.visible = false;
			
			let dirFac = (this._state === 1) ? 1 : -1,
				linVel1 = linVel.clone().mul(dirFac),
				xComp = (linVel1.x < 5 * this.fieldImpFac) ? 1 * dirFac : 0;
			
			let relY = this.position.y - this._desiredHeight,
				yComp = 0;
			if (relY < 0 && !stuffAbove) { yComp = (relY > -2)	? relY * -0.5 : 1; }
			if (relY > 0 && !stuffBelow) { yComp = (relY < 2)	? relY * -0.5 : -1; }
			
			let force = Vec2(xComp, yComp);
			force.normalize();
			force.mul(totalForce);
			
			force.add(friction);
			
			this.body.applyForce(force, this.position, true);
		}
		else {
			// Stunned.
			this.sprites.arrow.visible = false;
			this.sprites.stop.visible = true;
			
			// Just add friction.
			this.body.applyForce(friction, this.position, true);
		}
		
		// Reset collision listener triggers
		this._leftContact = false;
		this._rightContact = false;
		this._stunContact = false;
		
		if (super.update) super.update(deltaMS);
		this.sprites.arrow.rotation	= (this._state === 1) ? 0 : utils.PI;
		//this.sprites.excla.rotation	= 0;
		
		this.platform.update(deltaMS);
		this.upperSensor.update(deltaMS);
		this.lowerSensor.update(deltaMS);
	}
	
	destructor(options) {
		if (this._spawner != null) { this._spawner.removeFromSpawnList(this); }
		
		this.platform.destroy(true);
		this.upperSensor.destroy(true);
		this.lowerSensor.destroy(true);
		
		if (super.destructor) super.destructor(options);
		
		let deathRot;
		if (this._deathAngle != null) {deathRot = this._deathAngle; }
		else {
			let linVel = this.body.getLinearVelocity();
			deathRot = Math.atan2(linVel.y, linVel.x);
		}
		visuals.enemy_death(this.GP, this.position, deathRot);
	}
}

prefabs.mixins['enemy_flier_platform'] = (superclass) => class extends superclass {
	setup(options) {
		this._parent = options.parentFlier;
		this.body.setFixedRotation(true);
		
		if (super.setup) super.setup(options);
	}
	
	updateContact() {
		for (let c = this.body.getContactList(); c != null; c = c.next) {
			let otherIsPlayer = (c.other.gameobject != null) ? (c.other.gameobject.type === 'player') : false;
			if (otherIsPlayer) { this._parent._stunContact = true; }
		}
	}
	
	//damage(lostHP) {
		//this._parent.damage(lostHP);
	//}
}

prefabs.mixins['enemy_charger'] = (superclass) => class extends superclass {
	translateOptions(bitA, bitB) {
		let opts = super.translateOptions(bitA, bitB);
		
		opts.startGoingRight = (bitA & 0x04) != 0;
				
		opts.maxHP = 20;

		return opts;
	}
	
	setup(options) {
		this.sprites.body	= this.sprites.children[0];
		this.sprites.arrow	= this.sprites.children[1];
		this.sprites.stop	= this.sprites.children[2];
		this.sprites.excla	= this.sprites.children[3];
		
		this._nextDirState = options.startGoingRight ? 1 : 0;
		this._state = options.startGoingRight ? 1 : 0;
		/*
		 *	Behaviour States:
		 *	0:	Going left.
		 *	1:	Going right.
		 *	2:	Stunned, either because in air or goomba'd or charge-end.
		 *	3:	Spotting
		 *	4:	Charging
		 *	5:	Righting
		*/
		
		this._field_kill_applicable = true;
		
		this._stunContact = false;
		this._leftContact = false;
		this._rightContact = false;
		this._stunTimeout = 0;			// Current duration of stunned state
		this._spotCountdown = 0;		// Countdown for spotting behaviour, after which to transition into charging. Also used for righting.
		this._stateChangeCooldown = 0;	// Cooldown on switching between states (mostly direction)
		this._stoppedCountup = 0;		// How long the charger has been still for when it should be moving. After a while, assumes is stuck and will reverse direction.
		
		this._prowLock = 2;				// 0 - left, 1 - right, 2 - up, 3 - unlocked
		this._desProwLock = 2;
		
		this._deathAngle = null;
		
		this._playerRef = null;
		
		// Setup prow
		this.prow = this.GP.makeObject('enemy_charger_prow', this.name + '_prow', this.position, 0, {parentCharger: this});
		this.prow.body.setFixedRotation(true);
		let joint1 = this.GP.world.createJoint(planck.RevoluteJoint({
			localAnchorA: Vec2(0, 0),
			localAnchorB: Vec2(0.0, 0.0)
		}, this.body, this.prow.body));
		
		// Setup ground sensors.
		this.groundSensor = this.GP.makeObject('enemy_sensor', this.name + '_sensor', this.position.clone().sub(Vec2(0.0, 0.5)), 0);
		this.groundSensor.body.setFixedRotation(true);
		let joint2 = this.GP.world.createJoint(planck.RevoluteJoint({
			localAnchorA: Vec2(0, 0),
			localAnchorB: Vec2(0.0, 0.5)
		}, this.body, this.groundSensor.body));
		
		if (super.setup) super.setup(options);
	}
	
	update(deltaMS) {
		let angVel = this.body.getAngularVelocity(),
			linVel = this.body.getLinearVelocity();
		
		this._stateChangeCooldown -= deltaMS;
		if (this._stateChangeCooldown < 0) { this._stateChangeCooldown = 0; }
		
		if (Math.abs(angVel) < 0.5) {
			this._stunTimeout -= deltaMS;
			if (this._stunTimeout < 0) { this._stunTimeout = 0; }
		}
		
		this._spotCountdown -= deltaMS;
		if (this._spotCountdown < 0) { this._spotCountdown = 0; }
		
		if (Math.abs(angVel) < 0.1 || linVel.lengthSquared() < 0.5) { this._stoppedCountup += deltaMS; }
		else {this._stoppedCountup = 0; }
		
		let touchingGround = (this.groundSensor.body.getContactList() != null),
			chargeTrigger = false;
			
		// Charge trigger check
		if (this._playerRef == null) { this._playerRef = this.GP.getObjectsOfType('player', false)[0]; }
		if (this._state < 2 && this._playerRef != null) {
			// Check if in facing direction, and if at right y-level
			let playerPos = this._playerRef.position.clone(),
				horCheck = this._state === 0 ? (this.position.x > playerPos.x) : (this.position.x < playerPos.x),
				verCheck = (Math.abs(this.position.y - playerPos.y) < 0.5);
			
			chargeTrigger = (horCheck && verCheck);
		}
		
		// Check collisions and sensor, update state.
		if ((!touchingGround || this._stunContact) && (this._state < 3 || this._state === 5)) {
			// Stun logic
			if (this._state !== 2) {
				this._state = 2;
			}
			
			if (this._nextDirState === 0 && this._leftContact && this._stateChangeCooldown === 0) {
				this._nextDirState = 1;
				this._stateChangeCooldown = 1000;
			}
			else if (this._nextDirState === 1 && this._rightContact && this._stateChangeCooldown === 0) {
				this._nextDirState = 0;
				this._stateChangeCooldown = 1000;
			}
			
			this._stunTimeout = 1500;
		}
		else if (this._state === 2 && this._stunTimeout === 0 && Math.abs(angVel) < 0.5) {
			if (this._desProwLock !== 2) {
				// Exiting a charge stun
				this._prowLock = 3;
				this._desProwLock = 2;
				this._state = 5;
				this._stateChangeCooldown = 1000;
				this._spotCountdown = 1000;
				
				this.prow.body.setFixedRotation(false);
			}
			else {
				// Exiting a normal stun
				this._state = this._nextDirState;
				this._stateChangeCooldown = 1000;
			}
		}
		else if (this._state < 2 && chargeTrigger) {
			// Activate a charge, switch to spotting
			this._prowLock = 3;
			this._desProwLock = this._state;
			this._state = 3;
			this._stateChangeCooldown = 1000;
			this._spotCountdown = 1000;
			
			this.prow.body.setFixedRotation(false);
		}
		else if (this._state === 3 && this._spotCountdown === 0) {
			this._state = 4;
			this._stateChangeCooldown = 1000;
		}
		else if (this._state === 4) {
			let hitObs = this._desProwLock === 0 ? this._leftContact : this._rightContact;
			let rollBack = this._desProwLock === 0 ? angVel < -0.5 : angVel > 0.5;
			let stopped = (this._stateChangeCooldown === 0 && this._stoppedCountup > 1000);
			if (hitObs || rollBack || stopped) {
				this._state = 2;
				this._stateChangeCooldown = 1000;
				this._stunTimeout = 1500;
			}
		}
		else if (this._state === 5 && this._spotCountdown === 0) {
			this._state = this._nextDirState;
			this._stateChangeCooldown = 1000;
		}
		else if (this._state === 0 && (this._leftContact || angVel < -0.5) && this._stateChangeCooldown === 0) {
			this._state = 1;
			this._nextDirState = 1;
			this._stateChangeCooldown = 1000;
		}
		else if (this._state === 1 && (this._rightContact || angVel > 0.5)  && this._stateChangeCooldown === 0) {
			this._state = 0;
			this._nextDirState = 0;
			this._stateChangeCooldown = 1000;
		}
		else if (this._state < 2 && this._stoppedCountup > 2000) {
			this._state = (this._state === 1) ? 0 : 1;
			this._nextDirState = this._state;
			this._stoppedCountup = 0;
		}
		
		// Implement state.
		if (this._state < 2) {
			// Moving
			this.sprites.arrow.visible = true;
			this.sprites.stop.visible = false;
			this.sprites.excla.visible = false;
			
			let dirFac = (this._state === 1) ? -1 : 1;
			let angVel1 = dirFac * angVel;
			if (angVel1 < 10 * this.fieldImpFac) { this.body.applyTorque(dirFac * 15 * this.fieldImpFac, true); }
		}
		else if (this._state === 4) {
			// Charging
			this.sprites.arrow.visible = false;
			this.sprites.stop.visible = false;
			this.sprites.excla.visible = true;
			
			let dirFac = (this._desProwLock === 1) ? -1 : 1;
			let angVel1 = dirFac * angVel;
			if (angVel1 < 30 * this.fieldImpFac) { this.body.applyTorque(dirFac * 30 * this.fieldImpFac, true); }
		}
		else {
			// stunned or in a charge transition.
			this.sprites.arrow.visible = false;
			this.sprites.stop.visible = (this._state !== 3);
			this.sprites.excla.visible = (this._state === 3);
			
			// Just dampen rotation.
			if (angVel < 0) { this.body.applyTorque(15 * this.fieldImpFac, true); }
			if (angVel > 0) { this.body.applyTorque(-15 * this.fieldImpFac, true); }
		}
	
		// Prow rotation
		if (this._desProwLock !== this._prowLock) {
			// try to right the prow to the desired direction.
			this._prowLock = 3;
			
			let prowAng = this.prow.body.getAngle(),
				prowAngVel = this.prow.body.getAngularVelocity(),
				desAng = 0;
				
			let canTurnCW	= (this.prow.sensors.cw.body.getContactList()	== null),
				canTurnACW	= (this.prow.sensors.acw.body.getContactList()	== null);
			
			if (this._desProwLock === 0) { desAng = (utils.PI * 0.5); }
			else if (this._desProwLock === 1) { desAng = -(utils.PI * 0.5); }
			else if (this._desProwLock === 2) { desAng = 0; }
			
			let squeezeLatch = false; // Is this a good or helpful variable name? No. Does it make me happy? Yes.
			if (prowAng < 0 && !canTurnCW) { desAng = -(utils.PI * 0.5); squeezeLatch = true }
			if (prowAng > 0 && !canTurnACW) { desAng = (utils.PI * 0.5); squeezeLatch = true }
			
			let relAng = utils.bearingDelta(prowAng, desAng);
				
			if (Math.abs(relAng) < (utils.PI / 180) && Math.abs(prowAngVel) < 0.05 && !squeezeLatch) {
				// Basically on-target, basically stable.
				this.prow.body.setTransform(this.prow.body.getPosition(), desAng);
				this.prow.body.setFixedRotation(true);
				this._prowLock = this._desProwLock;
			}
			else {
				let signFac = relAng < 0 ? -1 : 1;
					
				if (prowAngVel * signFac < 1) {
					//let prop = Math.abs(relAng) < (utils.PI / 12) ? relAng / (utils.PI / 12) : signFac,
					//	torque = prop * this.fieldImpFac * 50;
					let torque = signFac * this.fieldImpFac * 100;
					
					this.prow.body.applyTorque(torque, this.position);
				}
			}
		}
		
		// Reset collision listener triggers
		this._stunContact = false;
		this._leftContact = false;
		this._rightContact = false;
		
		if (super.update) super.update(deltaMS);
		this.sprites.body.rotation	= this.rotation - this.prow.rotation;
		this.sprites.arrow.rotation	= (this._state === 1) ? this.rotation : this.rotation + utils.PI;
		this.sprites.stop.rotation	= this.rotation;
		this.sprites.excla.rotation	= this.rotation;
		
		this.prow.update(deltaMS);
		this.groundSensor.update(deltaMS);
	}
	
	destructor(options) {
		if (this._spawner != null) { this._spawner.removeFromSpawnList(this); }
		
		this.prow.destroy(true);
		this.groundSensor.destroy(true);
		if (super.destructor) super.destructor(options);
		let deathRot;
		if (this._deathAngle != null) {deathRot = this._deathAngle; }
		else {
			let linVel = this.body.getLinearVelocity();
			deathRot = Math.atan2(linVel.y, linVel.x);
		}
		visuals.enemy_death(this.GP, this.position, deathRot);
	}
}

prefabs.mixins['enemy_charger_prow'] = (superclass) => class extends superclass {
	setup(options) {
		this._parent = options.parentCharger;
		this.body.setFixedRotation(true);
		
		// Sensors
		this.sensors = {};
		
		this.sensors.cw = this.GP.makeObject('enemy_sensor', this.name + '_sensor_cw', this.position.clone().add(Vec2(-0.3125, 0.375)), 0);
		let joint1 = this.GP.world.createJoint(planck.WeldJoint({
			frequencyHz : 0.0,
			dampingRatio : 0.0,
			localAnchorA: Vec2(-0.3125, 0.375),
			localAnchorB: Vec2(0, 0),
			referenceAngle: 0
		}, this.body, this.sensors.cw.body));
		
		this.sensors.acw = this.GP.makeObject('enemy_sensor', this.name + '_sensor_acw', this.position.clone().add(Vec2(0.3125, 0.375)), 0);
		let joint2 = this.GP.world.createJoint(planck.WeldJoint({
			frequencyHz : 0.0,
			dampingRatio : 0.0,
			localAnchorA: Vec2(0.3125, 0.375),
			localAnchorB: Vec2(0, 0),
			referenceAngle: 0
		}, this.body, this.sensors.acw.body));
		
		if (super.setup) super.setup(options);
	}
	
	update(deltaMS) {
		this.sensors.cw.update(deltaMS);
		this.sensors.acw.update(deltaMS);
		if (super.update) super.update(deltaMS);
	}
	
	destructor(options) {
		this.sensors.cw.destroy(true);
		this.sensors.acw.destroy(true);
		if (super.destructor) super.destructor(options);
	}
}

//	***
//	UI
//	***

prefabs.mixins['ui_timer_skip'] = (superclass) => class extends superclass {
	setup(options) {
		if (super.setup) super.setup(options);
		
		this._charge = 0;
		this._cooloffCooldown = 0;
		
		this.sprites.main = this.sprites.children[0];
		this.sprites.main.interactive = true;
		
		this.sprites.main.mouseover = (mouseData) => {
			if (this._charge == 0) { this.sprites.main.tint = 0xff8181; }
		};
		this.sprites.main.mouseout = (mouseData) => {
			if (this._charge == 0) { this.sprites.main.tint = 0xffffff; }
		};
		this.sprites.main.click = (mouseData) => {
			this._charge += 600;
			this._cooloffCooldown = 1000;
		};
	}
	
	update(deltaMS) {
		if (super.update) super.update(deltaMS);
		
		if (this._charge > 1000) {
			this.GP.trigger_player_pressed_skip();
			this.sprites.main.tint = 0xff0000;
			this._cooloffCooldown = 30000;
		}
		else {
			if (this._cooloffCooldown > 0) {
				this._cooloffCooldown -= deltaMS;
				if (this._cooloffCooldown <= 0) { this._cooloffCooldown = 0; }
			}
			else if (this._charge > 0 ) {
				this._charge -= deltaMS;
				if (this._charge <= 0) {
					this._charge = 0;
					this.sprites.main.tint = 0xffffff;
				}
			}
			
			if (this._charge > 0) { this.sprites.main.tint = utils.linearColourInterpolation(0xffffff, 0xff0000, (this._charge * 0.001)); }
		}
	}
}

prefabs.mixins['ui_restart'] = (superclass) => class extends superclass {
	setup(options) {
		if (super.setup) super.setup(options);
		
		this._charge = 0;
		this._cooloffCooldown = 0;
		
		this.sprites.main = this.sprites.children[0];
		this.sprites.main.interactive = true;
		
		this.sprites.main.mouseover = (mouseData) => {
			if (this._charge == 0) { this.sprites.main.tint = 0xff8181; }
		};
		this.sprites.main.mouseout = (mouseData) => {
			if (this._charge == 0) { this.sprites.main.tint = 0xffffff; }
		};
		this.sprites.main.click = (mouseData) => {
			this._charge += 600;
			this._cooloffCooldown = 1000;
		};
	}
	
	update(deltaMS) {
		if (super.update) super.update(deltaMS);
		
		if (this._charge > 1000) {
			this.GP.trigger_player_pressed_restart();
			this.sprites.main.tint = 0xff0000;
			this._cooloffCooldown = 30000;
		}
		else {
			if (this._cooloffCooldown > 0) {
				this._cooloffCooldown -= deltaMS;
				if (this._cooloffCooldown <= 0) { this._cooloffCooldown = 0; }
			}
			else if (this._charge > 0 ) {
				this._charge -= deltaMS;
				if (this._charge <= 0) {
					this._charge = 0;
					this.sprites.main.tint = 0xffffff;
				}
			}
			
			if (this._charge > 0) { this.sprites.main.tint = utils.linearColourInterpolation(0xffffff, 0xff0000, (this._charge * 0.001)); }
		}
	}
}

//	_______________________________________________________

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
 *	64	:	0x0040	:	enviro fields
 *	128	:	0x0080	:	enemy sensors
 
 *	256	:	0x0100	:	interactables
 *	512	:	0x0200	:	doors
 *	1024:	0x0400	:	trigger projectiles
*/

//	***
//	Define environment prefabs.
//	***

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

prefabs.ramp = {
	name: "ramp",
	tags: ['static', 'terrain', 'rotatable'],
	zIndex: 35,
	sprites: [
		{
			tex: "__triangle",
			tint: 0x000000,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(1, 1),
			pos: Vec2(0, 0),
			rot: 0,
			points: [
				new PIXI.Point(-0.5, 0.5),
				new PIXI.Point(0.5, -0.5),
				new PIXI.Point(0.5, 0.5),
			]
		}
	],
	body: {
		type: 'static'//,
		//active: false
	},
	fixtures: [
		{
			name: 'Ramp',
			shape: planck.Polygon([
				Vec2(-0.5, -0.5),
				Vec2(0.5, 0.5),
				Vec2(0.5, -0.5)
			]),
			
			density: 5.0,
			friction: 0.75,
			restitution: 0.25,
			
			filterCategoryBits: 0x0020,
			//filterMaskBits: 0x60,
		}
	],
	mixins: [ 'loading_90rot' ]
};

prefabs.c_ramp_concave = {
	name: "c_ramp_concave",
	tags: ['static', 'terrain', 'rotatable', 'scalable'],
	zIndex: 35,
	sprites: [
		{
			tex: "terrain_curve_concave.png",
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
	],
	mixins: [ 'loading_90rot', 'loading_scale1to4', 'c_ramp_concave' ]
};

prefabs.c_ramp_convex = {
	name: "c_ramp_convex",
	tags: ['static', 'terrain', 'rotatable', 'scalable'],
	zIndex: 35,
	sprites: [
		{
			tex: "terrain_curve_convex.png",
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
	fixtures: [],
	mixins: [ 'loading_90rot', 'loading_scale1to4', 'c_ramp_convex' ]
};

prefabs.door_wall = {
	name: "door_wall",
	tags: ['static', 'terrain', 'door'],
	zIndex: 36,
	sprites: [
		{
			tex: "door_wall.png",
			tint: 0xffffff,
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
			
			density: 20.0,
			friction: 0.75,
			restitution: 0.25,
			
			filterCategoryBits: 0x0220,
			//filterMaskBits: 0x60,
		}
	],
	mixins: ['door_wall']
};

prefabs.door_key = {
	name: "door_key",
	tags: ['dynamic', 'gameplay', 'door', 'interactables', 'takes_damage'],
	zIndex: 35,
	sprites: [
		{
			tex: "door_key.png",
			tint: 0xffffff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(1, 1),
			pos: Vec2(0, 0),
			rot: 0
		}
	],
	body: {
		type: 'dynamic',
		gravityScale: 0.0//,
		//active: false
	},
	fixtures: [
		{
			name: 'Key',
			shape: planck.Circle(0.48),
			
			density: 20.0,
			friction: 0.75,
			restitution: 0.25,
			
			filterCategoryBits: 0x0300,
			//filterMaskBits: 0x60,
		}
	],
	mixins: [ 'door_key', 'takes_damage' ]
};

prefabs.field_kill = {
	name: "field_kill",
	tags: ['static', 'field'],
	zIndex: 30,
	sprites: [
		{
			tex: "__rect",
			tint: 0xff0000,
			alpha: 0.5,
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
			name: 'field',
			shape: planck.Box(0.5, 0.5),
			
			isSensor: true,
			
			density: 5.0,
			friction: 0.75,
			restitution: 0.25,
			
			filterCategoryBits: 0x0040
			//filterMaskBits: 0x0000
		}
	],
	mixins: []
};

prefabs.field_acc = {
	name: "field_acc",
	tags: ['static', 'field'],
	zIndex: 31,
	sprites: [
		{
			tex: "__rect",
			tint: 0x00ff00,
			alpha: 0.5,
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
			name: 'field',
			shape: planck.Box(0.5, 0.5),
			
			isSensor: true,
			
			density: 5.0,
			friction: 0.75,
			restitution: 0.25,
			
			filterCategoryBits: 0x0040
			//filterMaskBits: 0x0000
		}
	],
	mixins: []
};

prefabs.field_dec = {
	name: "field_dec",
	tags: ['static', 'field'],
	zIndex: 32,
	sprites: [
		{
			tex: "__rect",
			tint: 0x0000ff,
			alpha: 0.5,
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
			name: 'field',
			shape: planck.Box(0.5, 0.5),
			
			isSensor: true,
			
			density: 5.0,
			friction: 0.75,
			restitution: 0.25,
			
			filterCategoryBits: 0x0040
			//filterMaskBits: 0x0000
		}
	],
	mixins: []
};

prefabs.field_block = {
	name: "field_block",
	tags: ['static', 'terrain'],
	zIndex: 30,
	sprites: [
		{
			tex: "__rect",
			tint: 0xffdf00,
			alpha: 0.5,
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
			name: 'field',
			shape: planck.Box(0.5, 0.5),
			
			density: 5.0,
			friction: 0.75,
			restitution: 0.25,
			
			filterCategoryBits: 0x0040,
			filterMaskBits: 0x0001
		}
	],
	mixins: []
};

//	***
//	Define player and weapon prefabs.
//	***

prefabs.player = {
	name: "player",
	tags: ['dynamic', 'player' ],
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
		}/*,
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
		}*/
	],
	body: {
		type: 'dynamic'
	},
	fixtures: [
		{
			name: 'Body',
			shape: planck.Circle(0.48),
			
			density: 10.0,
			friction: 0.5,
			restitution: 0.25,
			
			filterCategoryBits: 0x0001,
			filterMaskBits: 0xff6d
		}/*,
		{
			name: 'jump_field',
			shape: planck.Circle(0.375),
			
			isSensor: true,
			
			density: 10.0,
			friction: 0.5,
			restitution: 0.25,
			
			filterCategoryBits: 0x0001,
			filterMaskBits: 0xf3b0
		},
		{
			name: 'pull_field',
			shape: planck.Circle(0.375),
			
			isSensor: true,
			
			density: 10.0,
			friction: 0.5,
			restitution: 0.25,
			
			filterCategoryBits: 0x0001,
			filterMaskBits: 0xf3b0
		}*/
	],
	mixins: [ 'leavestrail', 'player' ]
};

prefabs.player_field = {
	name: "player_field",
	tags: ['dynamic', 'player', 'subassembly'],
	zIndex: 23,
	sprites: [
		{
			tex: "circle_border.png",
			tint: 0xffffff,
			alpha: 1,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.75, 0.75),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 1
		}
	],
	body: {
		type: 'dynamic'
	},
	fixtures: [
		{
			name: 'field',
			shape: planck.Circle(0.375),
			
			isSensor: true,
			
			density: 0.0001,
			friction: 0.5,
			restitution: 0.25,
			
			filterCategoryBits: 0x0001,
			filterMaskBits: 0xf3b0
		}
	],
	mixins: [ 'player_field' ]
}

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
			filterMaskBits: 0xfb2e
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
			filterMaskBits: 0xfb2e
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

prefabs.proj_trigger = {
	name: "proj_trigger",
	tags: ['dynamic', 'trigger' ],
	zIndex: 15,
	sprites: [
		{
			tex: "__circle",
			tint: 0xffffff,
			alpha: 0.5,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.25, 0.25),
			pos: Vec2(0, 0),
			rot: 0
		}
	],
	body: {
		type: 'dynamic',
		gravityScale: 0
	},
	fixtures: [
		{
			name: 'projectile',
			shape: planck.Circle(0.125),
			
			density: 50,
			friction: 0.0,
			restitution: 0.9,
			
			filterCategoryBits: 0x0400,
			//filterMaskBits: 0x0200
		}                   
	],
	mixins: [ 'leavestrail', 'proj_trigger' ]
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
			filterMaskBits: 0xfbff
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
//	General Gameplay
//	***

prefabs.pull_bobble = {
	name: "pull_bobble",
	tags: ['dynamic', 'gameplay', 'interactables', 'takes_damage'],
	zIndex: 36,
	sprites: [
		{
			tex: "pull_bobble.png",
			tint: 0xffffff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(1, 1),
			pos: Vec2(0, 0),
			rot: 0
		}
	],
	body: {
		type: 'dynamic',
		gravityScale: 0.0
	},
	fixtures: [
		{
			name: 'Bobble',
			shape: planck.Circle(0.5),
			
			density: 20.0,
			friction: 0.5,
			restitution: 0.75,
			
			filterCategoryBits: 0x0120,
			//filterMaskBits: 0x60,
		}
	],
	mixins: [ 'takes_damage', 'pull_bobble' ]
};

prefabs.player_unlock = {
	name: "player_unlock",
	tags: ['dynamic', 'gameplay', 'powerup', 'interactables', 'takes_damage'],
	zIndex: 30,
	sprites: [
		{
			tex: "__triangle",
			tint: 0x000000,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(1, 1),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 10,
			points: [
				new PIXI.Point(0, 0.5),
				new PIXI.Point(0.5, 0),
				new PIXI.Point(0, -0.5),
				new PIXI.Point(-0.5, 0)
			]
		},
		{
			tex: "__triangle",
			tint: 0xffffff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.375, 0.375),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 15,
			points: [
				new PIXI.Point(0, 0.5),
				new PIXI.Point(0.5, 0),
				new PIXI.Point(0, -0.5),
				new PIXI.Point(-0.5, 0)
			]
		},
	],
	body: {
		type: 'dynamic',
		gravityScale: 0
	},
	fixtures: [
		{
			name: 'body',
			shape: planck.Polygon([
				Vec2(0, 0.5),
				Vec2(0.5, 0),
				Vec2(0, -0.5),
				Vec2(-0.5, 0)
			]),
			
			density: 20.0,
			friction: 0.75,
			restitution: 0.25,
			
			filterCategoryBits: 0x0100,
			//filterMaskBits: 0x60,
		}
	],
	mixins: [ 'takes_damage', 'player_unlock' ]
};

prefabs.player_ammo = {
	name: "player_ammo",
	tags: ['dynamic', 'gameplay', 'powerup', 'interactables', 'takes_damage'],
	zIndex: 30,
	sprites: [
		{
			tex: "__triangle",
			tint: 0x000000,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(1, 1),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 10,
			points: [
				new PIXI.Point(0, 0.5),
				new PIXI.Point(0.5, 0),
				new PIXI.Point(0, -0.5),
				new PIXI.Point(-0.5, 0)
			]
		},
		{
			tex: "__circle",
			tint: 0xffffff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.25, 0.25),
			pos: Vec2(0, 0.1875),
			rot: 0,
			zIndex: 15
		},
		{
			tex: "__circle",
			tint: 0xffffff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.25, 0.25),
			pos: Vec2(0, -0.1875),
			rot: 0,
			zIndex: 15
		}
	],
	body: {
		type: 'dynamic',
		gravityScale: 0
	},
	fixtures: [
		{
			name: 'body',
			shape: planck.Polygon([
				Vec2(0, 0.5),
				Vec2(0.5, 0),
				Vec2(0, -0.5),
				Vec2(-0.5, 0)
			]),
			
			density: 20.0,
			friction: 0.75,
			restitution: 0.25,
			
			filterCategoryBits: 0x0100,
			//filterMaskBits: 0x60,
		}
	],
	mixins: [ 'takes_damage', 'player_ammo' ]
};

prefabs.player_spawn = {
	name: "player_spawn",
	tags: ['static', 'spawnpoint'],
	maxCount: 1,
	zIndex: 15,
	sprites: [
		{
			tex: "__triangle",
			tint: 0xff81ff,
			alpha: 1,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(1, 1),
			pos: Vec2(0, 0),
			rot: utils.PI
		}
	],
	body: {
		type: 'static'//,
		//active: false
	},
	fixtures: [
		{
			name: 'field',
			shape: planck.Polygon(
				Vec2(0, -1.5),
				Vec2(2.25 * 0.57735026919, 0.75),
				Vec2(2.25 * -0.57735026919, 0.75)
			),
			
			isSensor: true,
			
			density: 5.0,
			friction: 0.75,
			restitution: 0.25,
			
			filterCategoryBits: 0x0000
			//filterMaskBits: 0x0000
		}
	],
	mixins: [ 'player_spawn' ]
};

prefabs.player_goal = {
	name: "player_goal",
	tags: ['static', 'exit'],
	zIndex: 15,
	sprites: [
		{
			tex: "__triangle",
			tint: 0xff81ff,
			alpha: 1,
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
			name: 'field',
			shape: planck.Polygon(
				Vec2(0, 1.5),
				Vec2(2.25 * 0.57735026919, -0.75),
				Vec2(2.25 * -0.57735026919, -0.75)
			),
			
			isSensor: true,
			
			density: 5.0,
			friction: 0.75,
			restitution: 0.25,
			
			filterCategoryBits: 0x0040
			//filterMaskBits: 0x0000
		}
	],
	mixins: [ 'player_goal' ]
};

//	***
//	Enemies
//	***

prefabs.spawner_enemy_walker = {
	name: "spawner_enemy_walker",
	tags: ['static', 'terrain'],
	zIndex: 36,
	sprites: [
		{
			tex: "spawner_walker.png",
			tint: 0xffffff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(1, 1),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 10
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
	mixins: [ 'loading_90rot', 'spawner_enemy_walker' ]
};

prefabs.enemy_sensor = {
	name: "enemy_sensor",
	tags: ['dynamic', 'enemy', 'subassembly'],
	zIndex: 21,
	sprites: [
		{
			tex: "__rect",
			tint: 0xff00ff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.5, 0.5),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 10,
			visible: false
		}
	],
	body: {
		type: 'dynamic'
	},
	fixtures: [
		{
			name: 'sensor',
			shape: planck.Box(0.25, 0.25),
			
			isSensor: true,
			
			density: 0.0001,
			friction: 0.5,
			restitution: 0.25,
			
			filterCategoryBits: 0x0004,
			filterMaskBits: 0xf020
		}
	],
	mixins: []
};

prefabs.enemy_walker = {
	name: "enemy_walker",
	tags: ['dynamic', 'gameplay', 'enemy', 'takes_damage'],
	zIndex: 21,
	sprites: [
		{
			tex: "__circle",
			tint: 0xff0000,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(1, 1),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 10
		},
		{
			tex: "enemy_symbol_arrow.png",
			tint: 0xffffff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.5, 0.5),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 15
		},
		{
			tex: "enemy_symbol_stop.png",
			tint: 0xffffff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.5, 0.5),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 16,
			visible: false
		}
	],
	body: {
		type: 'dynamic'
	},
	fixtures: [
		{
			name: 'body',
			shape: planck.Circle(0.48),
			
			density: 15.0,
			friction: 0.5,
			restitution: 0.25,
			
			filterCategoryBits: 0x0004,
			filterMaskBits: 0xf363
		}
	],
	mixins: [ 'leavestrail', 'takes_damage', 'enemy_walker' ]
};

prefabs.enemy_flier = {
	name: "enemy_flier",
	tags: ['dynamic', 'gameplay', 'enemy', 'takes_damage'],
	zIndex: 21,
	sprites: [
		{
			tex: "__triangle",
			tint: 0xff0000,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(1, 1),
			pos: Vec2(0, -0.125),
			rot: utils.PI,
			zIndex: 10
		},
		{
			tex: "__triangle",
			tint: 0x000000,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(1.0, 1.0),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 11,
			points:	[
				new PIXI.Point((0.57735026919 * 0.75),	-(0.25 + 0.125)),
				new PIXI.Point((-0.57735026919 * 0.75),	-(0.25 + 0.125)),
				new PIXI.Point(0,				-0.125)
			]
		},
		{
			tex: "enemy_symbol_arrow.png",
			tint: 0xffffff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.5, 0.5),
			pos: Vec2(0, -0.125),
			rot: 0,
			zIndex: 15
		},
		{
			tex: "enemy_symbol_stop.png",
			tint: 0xffffff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.5, 0.5),
			pos: Vec2(0, -0.125),
			rot: 0,
			zIndex: 16,
			visible: false
		}
	],
	body: {
		type: 'dynamic',
		gravityScale: 0
	},
	fixtures: [
		{
			name: 'body',
			shape: planck.Polygon([
				Vec2((0.57735026919  * 0.625),	0.25),
				Vec2((-0.57735026919 * 0.625),	0.25),
				Vec2(0,	(-0.5 + 0.125)),
			]),
			
			density: 15.0,
			friction: 0.5,
			restitution: 0.25,
			
			filterCategoryBits: 0x0004,
			filterMaskBits: 0xf363
		}
	],
	mixins: [ 'leavestrail', 'takes_damage', 'enemy_flier' ]
};

prefabs.enemy_flier_platform = {
	name: "enemy_flier_platform",
	tags: ['dynamic', 'gameplay', 'subassembly'],
	zIndex: 20,
	sprites: [],
	body: {
		type: 'dynamic',
		gravityScale: 0
	},
	fixtures: [
		{
			name: 'body',
			shape: planck.Polygon([
				Vec2((0.57735026919  * 0.625),	0.25),
				Vec2((-0.57735026919 * 0.625),	0.25),
				Vec2((-0.57735026919 * 0.75),	0.375),
				Vec2((0.57735026919  * 0.75),	0.375)
			]),
			
			density: 15.0,
			friction: 0.5,
			restitution: 0.25,
			
			filterCategoryBits: 0x0004,
			filterMaskBits: 0xf363
		}
	],
	mixins: [ 'enemy_flier_platform' ]
};

prefabs.enemy_charger = {
	name: "enemy_charger",
	tags: ['dynamic', 'gameplay', 'enemy', 'takes_damage'],
	zIndex: 22,
	sprites: [
		{
			tex: "enemy_charger_base.png",
			tint: 0xffffff,
			anchor: Vec2(0.5, 0.66666),
			scale: Vec2(1, 1.5),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 10
		},
		{
			tex: "enemy_symbol_arrow.png",
			tint: 0xffffff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.5, 0.5),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 15
		},
		{
			tex: "enemy_symbol_stop.png",
			tint: 0xffffff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.5, 0.5),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 16,
			visible: false
		},
		{
			tex: "enemy_symbol_exclamation.png",
			tint: 0xffffff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(0.5, 0.5),
			pos: Vec2(0, 0),
			rot: 0,
			zIndex: 17,
			visible: false
		}
	],
	body: {
		type: 'dynamic'
	},
	fixtures: [
		{
			name: 'body',
			shape: planck.Circle(0.48),
			
			density: 15.0,
			friction: 0.5,
			restitution: 0.25,
			
			filterCategoryBits: 0x0004,
			filterMaskBits: 0xf363
		}
	],
	mixins: [ 'leavestrail', 'takes_damage', 'enemy_charger' ]
};

prefabs.enemy_charger_prow = {
	name: "enemy_charger_prow",
	tags: ['dynamic', 'gameplay', 'subassembly'],
	zIndex: 21,
	sprites: [],
	body: {
		type: 'dynamic'
	},
	fixtures: [
		{
			name: 'body',
			shape: planck.Polygon([
				Vec2(-0.46,		0.5825),
				Vec2(0,			0.8125),
				Vec2(0.46,		0.5825),
				Vec2(0.46,		0.0),
				Vec2(-0.46,		0.0)
			]),
			
			density: 15.0,
			friction: 0.5,
			restitution: 0.25,
			
			filterCategoryBits: 0x0004,
			filterMaskBits: 0xf363
		}
	],
	mixins: [ 'enemy_charger_prow' ]
};

prefabs.symbol_display = {
	name: "symbol_display",
	tags: ['static'],
	zIndex: 45,
	sprites: [],
	body: {
		type: 'static'
	},
	fixtures: [],
	mixins: [ 'loading_90rot', 'symbol_display' ]
};

prefabs.ui_timer_skip = {
	name: "ui_timer_skip",
	tags: ['static'],
	maxCount: 1,
	zIndex: 99,
	sprites: [
		{
			tex: "ui_skip.png",
			tint: 0xffffff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(1, 1),
			pos: Vec2(0, 0),
			rot: 0
		}
	],
	body: {
		type: 'static'
	},
	fixtures: [],
	mixins: [ 'ui_timer_skip' ]
};

prefabs.ui_restart = {
	name: "ui_restart",
	tags: ['static'],
	maxCount: 1,
	zIndex: 99,
	sprites: [
		{
			tex: "ui_restart.png",
			tint: 0xffffff,
			anchor: Vec2(0.5, 0.5),
			scale: Vec2(1, 1),
			pos: Vec2(0, 0),
			rot: 0
		}
	],
	body: {
		type: 'static'
	},
	fixtures: [],
	mixins: [ 'ui_restart' ]
};

//	***
//	Level creation / reading
//	***

prefabs.map = {
	0:	'empty',
	
	//	Environment
	1:	'wall',
	2:	'ramp',
	3:	'c_ramp_concave',
	4:	'c_ramp_convex',
	5:	'door_wall',
	6:	'field_kill',
	7:	'field_acc',
	8:	'field_dec',
	9:	'field_block',
	
	//	Gameplay
	10:	'player_spawn',
	11:	'player_goal',
	12:	'enemy_walker',
	13:	'enemy_flier',
	14:	'enemy_charger',
	15:	'spawner_enemy_walker',
	16:	'door_key',
	17:	'pull_bobble',
	
	//	what are categories anyway?
	18:	'symbol_display',
	
	//	Powerups
	20:	'player_unlock',
	21:	'player_ammo',
	//22:	'player_powerup'
	
	//	UI
	22:	'ui_timer_skip',
	23:	'ui_restart'	
}

module.exports = prefabs;