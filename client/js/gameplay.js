//	***
//	gameplay.js start
//	***

//const planck = require('planck-js');
//const PIXI = require('pixi.js');
const uuid = require('uuid');
//const fs = require('fs');
const PNG = require('pngjs').PNG;

const mix = require('./mixinbuilder');
const prefabs = require('./prefabs');
const visuals = require('./visuals');

'use strict'

let Sprite = PIXI.Sprite,
	Vec2 = planck.Vec2,
	gameplayTex = PIXI.Loader.shared.resources["assets/gameplay.json"].textures;

function Gameplay(app, IH, settings, runData) {
	this._levelLoaded = false;
	
	this.settings = (settings != null) ? settings : {
		autoReload: true,
		autoSlowAim: true,
		
		pixelOffset:		new PIXI.Point(0, 0),
		
		pixelScaleFactor:	16,				// 1 game unit (tile / GU) translated to PIXI units (pixels).
		meterScaleFactor:	1,				// 1 game unit (tile / GU) translated to 1 box2D units (meters).
		levelSize:			Vec2(34, 34),	// In GU. Note, origin is in bottom left.
		pixelOrigin:		Vec2(0, 34),	// In GU. PIXI's origin is in the top left of the screen, this is the location of that point in gameplay space.
		meterOrigin:		Vec2(0, 0)		// In GU. box2D's origin is in the bottom left of the level, this is the location of that point in gameplay space.
	}
	this.runData = runData;
	
	// Handler functions
	this._behaviour = null; // Holds state for activating handler functions.
	this._behaviourTrigger = false;
	this.trigger_end_victory	= null;
	this.trigger_end_defeat		= null;
	
	this._gameEnded = false;
	this._afterEndTime = 0;
	this._endState = 0;
	this.trigger_player_death = (playerPosGU) => {
		if (!this._gameEnded) {
			this._gameEnded = true;
			this._afterEndTime = 1500;
			this._endState = 0;
			
			visuals.player_death(this, playerPosGU.clone());
		}
	}
	this.trigger_player_reached_goal = (goal) => {
		if (!this._gameEnded) {
			this._gameEnded = true;
			this._afterEndTime = 3500;
			this._endState = 1;
			
			this.getObjectsOfType("player")[0].destroy(false);
			visuals.player_ascension(this, goal.position);
		}
	}
	this.trigger_player_pressed_skip = () => {
		if (!this._gameEnded) {
			this._gameEnded = true;
			this._afterEndTime = 1500;
			this._endState = 2;
			
			let player = this.getObjectsOfType("player")[0];
			
			visuals.player_death(this, player.position);
			player.destroy(false);
		}
	}
	this.trigger_player_pressed_restart = () => {
		if (!this._gameEnded) {
			this._gameEnded = true;
			this._afterEndTime = 1500;
			this._endState = 0;
			
			let player = this.getObjectsOfType("player")[0];
			
			visuals.player_death(this, player.position);
			player.destroy(false);
		}
	}
	
	// Box2D world.	
	this.world = planck.World({
		gravity: Vec2(0, -10)
	});

	// Pixi.js application.
	console.assert(app != null, 'ERROR: Gameplay object created with null PIXI app!'); 
	this.app = app;
	
	// Create a local stage, a cursor stage, and various particle stages (so we don't have to sort individual particles.).
	this.stage = new PIXI.Container();
	this.stage.sortableChildren = true;
	app.stage.addChildAt(this.stage, 0);
	this.stage.position.set(this.settings.pixelOffset.x, this.settings.pixelOffset.y);
	
	this.cursorStage = new PIXI.Container();
	this.cursorStage.sortableChildren = true;
	app.stage.addChild(this.cursorStage);
	this.cursorStage.stateData = {
		tint: null,
		weapon:	null,
		clip:		0,
		maxClip:	0,
		ammo:		0,
		maxAmmo:	6	// Assume mas is always six?
	}
	this.mousePosGU = Vec2(0, 0);
	
	this.particleStageLower = new PIXI.Container();
	this.particleStageLower.zIndex = 10;
	this.stage.addChild(this.particleStageLower);
	
	this.particleStageMid = new PIXI.Container();
	this.particleStageMid.zIndex = 30;
	this.stage.addChild(this.particleStageMid);
	
	this.particleStageUpper = new PIXI.Container();
	this.particleStageUpper.zIndex = 50;
	this.stage.addChild(this.particleStageUpper);
	
	// Background
	let totalSize = this.settings.levelSize.clone().mul(this.settings.pixelScaleFactor);
	this.background = new PIXI.Graphics;
	this.background.lineStyle(0, 0, 0);
	this.background.beginFill(0xffffff, 1);
	this.background.drawRect(0, 0, totalSize.x, totalSize.y);
	this.background.zIndex = -1;
	this.stage.addChild(this.background);
	
	// Slowdown visual
	this.slowOverlay = new PIXI.Graphics;
	this.slowOverlay.lineStyle(0, 0, 0);
	this.slowOverlay.beginFill(0xd9e2ff, 1);
	this.slowOverlay.drawRect(0, 0, totalSize.x, totalSize.y);
	this.slowOverlay.visible = false;
	this.slowOverlay.zIndex = 11;
	this.stage.addChild(this.slowOverlay);
	
	// Blackout visual
	this._startDarkTimer = 500;
	this.darkOverlay = new PIXI.Graphics;
	this.darkOverlay.lineStyle(0, 0, 0);
	this.darkOverlay.beginFill(0x000000, 1);
	this.darkOverlay.drawRect(0, 0, totalSize.x, totalSize.y);
	this.darkOverlay.visible = true;
	this.darkOverlay.zIndex = 101;
	this.stage.addChild(this.darkOverlay);
	
	// Input Handler
	console.assert(IH != null, 'ERROR: Gameplay object created with null Input Handler!'); 
	this.IH = IH;
	
	this.timeFactor = 1.0;
	this._spawnCounts = {};
	
	this.staticObjects = [];
	this.dynamicObjects = [];
	this.visuals = [];
    
	this._markedForDeath = [];
	this._markedForDeathVisuals = [];
	
	this.objClasses = {};
	
	// Stats
	this.runTimeS = 0;
	
	this.world.on('pre-solve', (contact) => {
		// Admin / Setup:
		
		let fixtureA = contact.getFixtureA();
		let fixtureB = contact.getFixtureB();
		
		let catA = fixtureA.getFilterCategoryBits();
		let catB = fixtureB.getFilterCategoryBits();

		let bodyA = contact.getFixtureA().getBody();
		let bodyB = contact.getFixtureB().getBody();
		
		let isGOA = (bodyA.gameobject != null);
		let isGOB = (bodyB.gameobject != null);
		
		let goA = (isGOA) ? bodyA.gameobject : null;
		let goB = (isGOB) ? bodyB.gameobject : null;
		
		let typeA = (isGOA) ? goA.type : null;
		let typeB = (isGOB) ? goB.type : null;
		
		if (!isGOA || !isGOB) {
			
		}
		else {
			// proj_key
			/*let aProjK = typeA === 'proj_key';
			let bProjK = typeB === 'proj_key';
			if (aProjK || bProjK) {
				let projK = (aProjK) ? goA : goB,
					other = (aProjK) ? goB : goA;
				
				if (projK.target === other) {
					projK.destroy(false);
					other.destroy(false);
				}
				else { contact.setEnabled(false); }
			}*/
			
			
			// proj_trigger
			let aProjT = typeA === 'proj_trigger';
			let bProjT = typeB === 'proj_trigger';
			if (aProjT && isGOB) {
				if (goA.target === goB) { goA._triggered = true; }
				contact.setEnabled(false);
			}
			if (bProjT && isGOA) {
				if (goB.target === goA) { goB._triggered = true; }
				contact.setEnabled(false);
			}
			
			
			// ...
		}
	});
	
	this.world.on('begin-contact', (contact) => {
		// Admin / Setup:
		
		let fixtureA = contact.getFixtureA();
		let fixtureB = contact.getFixtureB();
		
		let catA = fixtureA.getFilterCategoryBits();
		let catB = fixtureB.getFilterCategoryBits();

		let bodyA = contact.getFixtureA().getBody();
		let bodyB = contact.getFixtureB().getBody();
		
		let isGOA = (bodyA.gameobject != null);
		let isGOB = (bodyB.gameobject != null);
		
		let goA = (isGOA) ? bodyA.gameobject : null;
		let goB = (isGOB) ? bodyB.gameobject : null;
		
		let typeA = (isGOA) ? goA.type : null;
		let typeB = (isGOB) ? goB.type : null;
		
		// Vars
		
		let aEnviro = catA & 0x0020;
		let bEnviro = catB & 0x0020;
		
		let aTakesDamage = (isGOA) ? goA.hasTag('takes_damage') : false;
		let bTakesDamage = (isGOB) ? goB.hasTag('takes_damage') : false;
		
		// Tests / Logic
		
		if (!isGOA || !isGOB) {
			// Probably nothing?
		}
		else {
			
			// proj_shotgun
			let aProjS = typeA === 'proj_shotgun';
			let bProjS = typeB === 'proj_shotgun';
			
			if ((aProjS || bProjS) && (aEnviro || bEnviro) && (!aProjS || !bProjS)) {
				// Ricochets
				let projS = (aProjS) ? goA : goB;
				projS._hasRicocheted = true;
				if (projS._canRicochet) { projS.body.setGravityScale(0.5); }
			}
			
			if ((aProjS || bProjS) && (!aProjS || !bProjS)) {
				let projS = (aProjS) ? goA : goB;
				let other = (aProjS) ? goB : goA;
				let takesDamage = (aProjS) ? bTakesDamage : aTakesDamage;
				
				if (takesDamage) {
					other.damage(15);
					projS.destroy(false);
					visuals.proj_shotgun_death(this, projS.position, true);
					
					if (other._deathTrigger === true && other._deathAngle !== undefined) {
						let dir = projS.body.getLinearVelocity().clone();
						other._deathAngle = Math.atan2(dir.y, dir.x);
					}
				}
				else {
					let vel = this.relM2GU(projS.body.getLinearVelocity());
					if (vel.lengthSquared() < 100) {
						projS.destroy(false);
						visuals.proj_shotgun_death(this, projS.position, false);
					}
				}
			}
			
			
			// proj_launcher
			let aProjL = typeA === 'proj_launcher';
			let bProjL = typeB === 'proj_launcher';
			if ((aProjL || bProjL) && (aEnviro || bEnviro) && (!aProjL || !bProjL)) {
				// One projectile, one wall. Kinky.
				let projL = (aProjL) ? goA : goB;
				if (projL.mode === 1) {
					projL.hitWall = true;
					
					let poc = contact.getWorldManifold();
					
					//contact.setEnabled(false);
					contact.setRestitution(0.0);
					//projL.desiredPos = poc.points[0].clone();
					projL.desiredPos = projL.body.getPosition();
				}
			}
			
			// enemies and player
			let aPlayer = typeA === 'player';
			let bPlayer = typeB === 'player';
			let aEnemy = (typeA === 'enemy_walker') || (typeA === 'enemy_flier') || (typeA === 'enemy_charger');
			let bEnemy = (typeB === 'enemy_walker') || (typeB === 'enemy_flier') || (typeB === 'enemy_charger');
			// Check for charger prow relative speed.
			if (typeA === 'enemy_charger_prow' && bPlayer) {
				if (goA._parent._state === 3 || goA._parent._state === 4) {
					let linVelA = goA.body.getLinearVelocity();
					let linVelB = goB.body.getLinearVelocity();
					let relative = linVelA.clone().sub(linVelB);
					if (relative.lengthSquared() > (7.5 * 7.5)) { aEnemy = true; }
				}
				else { goA._parent._stunContact = true; }
			}
			if (typeB === 'enemy_charger_prow' && aPlayer) {
				if (goB._parent._state === 3 || goB._parent._state === 4) {
					let linVelA = goA.body.getLinearVelocity();
					let linVelB = goB.body.getLinearVelocity();
					let relative = linVelB.clone().sub(linVelA);
					if (relative.lengthSquared() > (7.5 * 7.5)) { bEnemy = true; }
				}
				else { goB._parent._stunContact = true; }
			}
			
			if ((aPlayer ? !bPlayer : bPlayer) && (aEnemy || bEnemy)) {
				let player	= aPlayer ? goA : goB;
				player.destroy(false);
			}
			
			
			// field_kill
			let aFieldK = typeA === 'field_kill';
			let bFieldK = typeB === 'field_kill';
			let aKillable = (goA != null) ? goA._field_kill_applicable : false;
			let bKillable = (goB != null) ? goB._field_kill_applicable : false;
			if (aFieldK && bKillable) { goB._fieldKillTrigger = true; }
			if (bFieldK && aKillable) { goA._fieldKillTrigger = true; }
			// ...
		}
	});
	
	this.world.on('post-solve', (contact, impulse) => {
		// Admin / Setup:
		
		let totalNormalImpulse = 0;
		impulse.normalImpulses.forEach((element) => { totalNormalImpulse += element; }); // I don't really understand how contact impulses work, so, fuck it.
		
		let fixtureA = contact.getFixtureA();
		let fixtureB = contact.getFixtureB();
		
		let catA = fixtureA.getFilterCategoryBits();
		let catB = fixtureB.getFilterCategoryBits();

		let bodyA = contact.getFixtureA().getBody();
		let bodyB = contact.getFixtureB().getBody();
		
		let isGOA = (bodyA.gameobject != null);
		let isGOB = (bodyB.gameobject != null);
		
		let goA = (isGOA) ? bodyA.gameobject : null;
		let goB = (isGOB) ? bodyB.gameobject : null;
		
		let typeA = (isGOA) ? goA.type : null;
		let typeB = (isGOB) ? goB.type : null;
		
		// Vars
		
		/*let aEnviro = catA & 0x0020;
		let bEnviro = catB & 0x0020;
		
		let aTakesDamage = (isGOA) ? goA.hasTag('takes_damage') : false;
		let bTakesDamage = (isGOB) ? goB.hasTag('takes_damage') : false;*/
		
		// Tests / Logic

		if (!isGOA || !isGOB) {
			// Probably nothing?
		}
		else {
			
			// smashables (door_key, player_unlock, player_ammo)
			let aSmash = typeA === 'door_key' || typeA === 'player_unlock' || typeA === 'player_ammo';
			let bSmash = typeB === 'door_key' || typeB === 'player_unlock' || typeB === 'player_ammo';
			let aProjS = typeA === 'proj_shotgun';
			let bProjS = typeB === 'proj_shotgun';
			if (aSmash && !bProjS && Math.abs(totalNormalImpulse) > 50) { goA.destroy(false); }
			if (bSmash && !aProjS && Math.abs(totalNormalImpulse) > 50) { goB.destroy(false); }
			
			
			// enemy_walker / enemy_flier / enemy_charger(_prow)
			let aEnemy = typeA === 'enemy_walker' || typeA === 'enemy_flier' || typeA === 'enemy_charger';
			let bEnemy = typeB === 'enemy_walker' || typeB === 'enemy_flier' || typeB === 'enemy_charger';
			
			let aProw = typeA === 'enemy_charger_prow';
			let bProw = typeB === 'enemy_charger_prow';
			let aPlayer = typeA === 'player';
			let bPlayer = typeB === 'player';
			
			if (aEnemy || bEnemy || aProw || bProw) {
				let worldMan = {points: [], separations: []};
				contact.getWorldManifold(worldMan);
				
				if ((Math.abs(worldMan.normal.x) - 0.05) > Math.abs(worldMan.normal.y)) {
					let normPos = (worldMan.normal.x > 0);
					// Normal points from A to B.
					if (aEnemy) {
						if (normPos) { goA._rightContact = true; }
						else { goA._leftContact = true; }
					}
					else if (bEnemy) {
						if (normPos) { goB._leftContact = true; }
						else { goB._rightContact = true; }
					}
					else if (aProw && !bPlayer) {
						if (normPos) { goA._parent._rightContact = true; }
						else { goA._parent._leftContact = true; }
					}
					else if (bProw && !aPlayer) {
						if (normPos) { goB._parent._leftContact = true; }
						else { goB._parent._rightContact = true; }
					}
				}
			}
			
			// enemy_flier_platform
			
			let aEnemyP = typeA === 'enemy_flier_platform';
			let bEnemyP = typeB === 'enemy_flier_platform';
			
			if (aEnemyP || bEnemyP) {
				let P = (aEnemyP) ? goA : goB,
					O = (aEnemyP) ? goB : goA;
				
				let worldMan = {points: [], separations: []};
				contact.getWorldManifold(worldMan);
				let testY = (aEnemyP) ? -worldMan.normal.y : worldMan.normal.y;
				
				if (testY > -0.5) {
					let relX = O.position.x - P.position.x;
					if (relX < -0.125) { P._parent._leftContact = true; }
					else if (relX > 0.125) { P._parent._rightContact = true; }
				}
				else if (O.type === 'player') { P._parent._stunContact = true; }
			}
			
			// ...
		}
	});
}



//	***
//	Utilities
//	***

Gameplay.prototype.loadLevel = function(level) {
	// Byte map
	// Each pixel is actually 4 bytes, or 32 bits:
	
	//	x5:		0-32 type id
	//	x11:	options bits. Often the first two are rotation, the next two are sometime scale.
	
	// Allows for two objects per space.
	
	//pixels = this.app.renderer.plugins.extract.pixels(new PIXI.Sprite(level));
	pixels = level.data;
	
	if (pixels.length !== (34 * 34 * 4)) {
		console.log("ERROR: Cannot load level, wrong size!");
		return false;
	}
	
	let restartButton = false,
		skipButton = false;
	
	for (let i = 0; i < 34; i++) {	// x
		for (let j = 0; j < 34; j++) {	// y
			let index = ((j * 34) + i) * 4;
			for (k = 0; k < 2; k++) {
				let offsetIndex = index + (2 * k);
				let typeID = pixels[offsetIndex] >>> 3;
				if (typeID !== 0) {
					type = prefabs.map[typeID];
					if (type == null) { console.log("ERROR: Invalid typeID (" + typeID + ") detected when reading level!"); }
					else {
						this.makeObject(type, null, Vec2(i + 0.5, (34 - j) - 0.5), null, null, pixels[offsetIndex], pixels[offsetIndex + 1]);
					}
				}
				
				if (typeID == 22) { skipButton = true; }
				if (typeID == 23) { restartButton = true; }
			}
		}
	}
	
	// UI
	if (!restartButton) { this.makeObject('ui_restart', null, Vec2(32.5, 33.5), 0); }
	if (!skipButton) { this.makeObject('ui_timer_skip', null, Vec2(33.5, 33.5), 0); }
	
	// Kill-borders.
	for (let x = 0; x < 35; x++) {
		this.makeObject('field_kill', null, Vec2(x, 0), 0);
		this.makeObject('field_kill', null, Vec2(x, 34), 0);
	}
	for (let y = 1; y < 34; y++) {
		this.makeObject('field_kill', null, Vec2(0, y), 0);
		this.makeObject('field_kill', null, Vec2(34, y), 0);
	}
	
	this._levelLoaded = true;
}

/*
 *	IMPORTANT!
 *	Internal transform data is handled using the Box2D Vec2 object, in 'Game Units', where 1 GU is a tile.
 *	Internal rotation is handled in radians.
*/

//	***	Relative unit conversion

Gameplay.prototype.relGU2P = function(GU) {
	if (GU instanceof Vec2) {
		P1 = GU.clone().mul(this.settings.pixelScaleFactor);
		P2 = new PIXI.Point(P1.x, -P1.y); // Convert to PIXI structure. PIXI has an inverted Y axis, in which going down the screen is equivalent to positive Y movement.
		return P2;
	}
	else { return (GU * this.settings.pixelScaleFactor); }
}
Gameplay.prototype.relP2GU = function(P) {
	let GU;
	if (P.x != null && P.y != null) {
		GU = Vec2(P.x, -P.y).mul(1 / this.settings.pixelScaleFactor); // Convert to Box2D structure. PIXI has an inverted Y axis, in which going down the screen is equivalent to positive Y movement.
		if (!Vec2.isValid(GU)) { GU.setZero(); } // Check for division-by-zero/NaN/weird-shit.
		return GU;
	}
	else {
		GU = (P / this.settings.pixelScaleFactor);
		GU = (Math.isFinite(GU)) ? GU : 0;
		return GU;
	}
}

Gameplay.prototype.relGU2M = function(GU) {
	if (GU instanceof Vec2) { return GU.clone().mul(this.settings.meterScaleFactor); }
	else { return (GU * this.settings.meterScaleFactor); }
}
Gameplay.prototype.relM2GU = function(M) {
	let GU;
	if (M instanceof Vec2) {
		GU = M.clone().mul(1 / this.settings.meterScaleFactor);
		if (!Vec2.isValid(GU)) { GU.setZero(); } // Check for division-by-zero/NaN/weird-shit.
		return GU;
	}
	else {
		GU = (M / this.settings.meterScaleFactor);
		GU = (Math.isFinite(GU)) ? GU : 0;
		return GU;
	}
}

Gameplay.prototype.relP2M = function(P) { return this.relGU2M(this.relP2GU(P)); }
Gameplay.prototype.relM2P = function(M) { return this.relGU2P(this.relM2GU(M)); }

//	***	Absolute unit conversion

Gameplay.prototype.absGU2P = function(GU) {
	if (!(GU instanceof Vec2)) { console.log("ERROR: Gameplay absGU2P called with invalid input."); return Vec2(0, 0); }
	P = GU.clone().sub(this.settings.pixelOrigin);
	P = this.relGU2P(P);
	return P;
}
Gameplay.prototype.absP2GU = function(P) {
	if (!(P.x != null && P.y != null)) { console.log("ERROR: Gameplay absP2GU called with invalid input."); return Vec2(0, 0); }
	GU = this.relP2GU(P);
	GU.x += this.settings.pixelOrigin.x;
	GU.y += this.settings.pixelOrigin.y;
	return GU;
}

Gameplay.prototype.absGU2M = function(GU) {
	if (!(GU instanceof Vec2)) { console.log("ERROR: Gameplay absGU2M called with invalid input."); return Vec2(0, 0); }
	M = GU.clone().sub(this.settings.meterOrigin);
	M = this.relGU2M(M);
	return M;
}
Gameplay.prototype.absM2GU = function(M) {
	if (!(M instanceof Vec2)) { console.log("ERROR: Gameplay absM2GU called with invalid input."); return Vec2(0, 0); }
	GU = this.relM2GU(M);
	GU.add(this.settings.meterOrigin);
	return GU;
}

Gameplay.prototype.absP2M = function(P) { return this.absGU2M(this.absP2GU(P)); }
Gameplay.prototype.absM2P = function(M) { return this.absGU2P(this.absM2GU(M)); }

//	***
//	Game Objects
//	***

Gameplay.prototype.object = class GameObject {
	constructor(GP) {
		// Do not call this directly! Only through makeObject()!
		this.id = uuid.v4();	// Unique ID
		this.name = null;		// Non-unique string name.
		this.type = null;		// The specific object type of this instance. Eg. 'player', 'enemyFlier', 'wallTile'
		this.tags = [];			// Anything we might use to create groups across multiple types for various purposes. Eg. 'danger', 'static', 'invisible', 'aesthetic'.
		this.GP = GP;			// Reference to the gameplay object.
		
		this.sprites = null;	// PIXI.Container, the object's Sprites within.
		this.body = null;		// Box2D Body.
		
		this._markedForDeath = false;
		this._midDestruction = false;
		
		// Field effects
		this._field_kill_applicable = false;
		this._field_acc_applicable = true;
		this._field_dec_applicable = true;
		
		this._accelerated = false;
		this._decelerated = false;
		
		this._fieldImpulseFactor = 1;
		this._fieldVelFactor = 1;
		this._fieldKillTrigger = false;
	}
	
	get position() {
		if (this.body) {
			return this.GP.absM2GU(this.body.getPosition().clone());
		}
		else if (this.sprites) {
			return this.GP.absP2GU(this.sprites.position.clone());
		}
		else { return Vec2(0, 0); }
	}
	
	set position(P) {
		if (this.body) { this.body.setPosition(this.GP.absGU2M(P)); }
		if (this.sprites) {
			let Ps = this.GP.absGU2P(P);
			this.sprites.position.set(Ps.x, Ps.y);
		}
	}
	
	get rotation() {
		if (this.body) {
			return this.body.getAngle();
		}
		else if (this.sprites) {
			return -this.sprites.rotation;
		}
		else { return 0; }
	}
	
	set rotation(R) {
		if (this.body) { this.body.setAngle(R); }
		if (this.sprites) { this.sprites.rotation = -R; }
	}
	
	updateFieldLogic(deltaS) {
		if (this.body == null || this.body.m_type === 'static') {
			this._field_updatedThisTick = true;
			return;
		}
		
		this._accelerated = !this._field_acc_applicable;
		this._decelerated = !this._field_dec_applicable;
		for (let overlap = this.body.getContactList();
			overlap != null &&
			(!this._accelerated || !this._decelerated);
			overlap = overlap.next) {
			if (overlap.other.gameobject != null) {
				let other = overlap.other.gameobject;
				
				if (other.type === 'field_acc') { this._accelerated = true; }
				if (other.type === 'field_dec') { this._decelerated = true; }
			}
		}
		
		if (!this._field_kill_applicable) { this._fieldKillTrigger = false; }
		if (!this._field_acc_applicable) { this._accelerated = false; }
		if (!this._field_dec_applicable) { this._decelerated = false; }
		
		this._fieldImpulseFactor = 1;
		this._fieldVelFactor = 0;

		if (this._accelerated) {
			this._fieldImpulseFactor += 1;
			this._fieldVelFactor += 1.5;
		}
		if (this._decelerated) {
			this._fieldImpulseFactor -= 0.5;
			this._fieldVelFactor -= 0.9;
		}
		
		this._fieldVelFactor *= deltaS;
		this._fieldVelFactor += 1;
		
		if (this._fieldKillTrigger) { this.destroy(false); }
	}
	
	get fieldImpFac() {
		let copy = this._fieldImpulseFactor;
		return copy;
	}
	
	update( deltaMS ) {
		// Update sprites to match body.
		if ((this.body) && (this.sprites)) {
			let bodPos = this.body.getPosition();
			let sprPos = this.GP.absM2P(bodPos);
			this.sprites.position.set(sprPos.x, sprPos.y);
			let rot = this.body.getAngle();
			this.sprites.rotation = -rot;
		}
		
		if (this.body && this._fieldVelFactor !== 1) {
			let linVel = this.body.getLinearVelocity(),
				velSq = linVel.lengthSquared();
			if (velSq < 400) { linVel.mul(this._fieldVelFactor); }
		}
	}
	
	hasTag(tagString) {
		let tagIndex = this.tags.findIndex((element) => (element === tagString));
		if (tagIndex != null && tagIndex != -1) { return true; }
		return false;
	}
	
	destroy(immediate) {
		immediate = (immediate == null) ? false : immediate;
		
		if (immediate) {
			this.GP.deleteObject(this);
		}
		else {
			this._markedForDeath = true;
			this.GP._markedForDeath.push(this);
		}
	}
	
	translateOptions(bitA, bitB) { return {}; }
}

Gameplay.prototype.makeObject = function(type, name, position, rotation, options, bitA, bitB) {
	if (!(type)) {
		console.log("ERROR: No type specified to makeObject()!");
		return {};
	}
	
	// Start by getting the prefab settings and object class.
	let prefab = null;
	if (prefabs[type]) { prefab = prefabs[type]; }
	else {
		console.log("ERROR: No prefab of type '" + type + "' found.");
		return {};
	}
	
	if (prefab.maxCount != null && prefab.maxCount < 1) { console.log("WARNING: Illegal creation of gameobject type '" + type + "' detected; No such entities may be created."); return; }
	else if (this._spawnCounts[type] == null) { this._spawnCounts[type] = 1; }
	else if (prefab.maxCount != null && this._spawnCounts[type] + 1 > prefab.maxCount) { console.log("WARNING: Illegal creation of gameobject type '" + type + "' detected; Max entites of type already instantiated."); return; }
	else { this._spawnCounts[type]++; }
	
	let objectClass = null;
	if (!(this.objClasses[type])) {
		// Build a class-type from the specified mixins.
		// This essentially replicates a component-based model.
		
		let mixins = [];
		prefab.mixins.forEach((element) => {
			if (prefabs.mixins[element]) { mixins.push(prefabs.mixins[element]);}
			else { console.log("ERROR: No mixin of type '" + element + "' found when building gameobject subclass '" + type + "'."); }
		});
		this.objClasses[type] = class extends mix(this.object).witheach(mixins) {
			/*
				May need to put something here at some point.
			*/
		}
	}
	objectClass = this.objClasses[type];
	
	// If we have a viable object class, make one.
	if (!objectClass) {
		// TimE tO CoMpLaIN!1
		console.log("ERROR: No valid object class available when constructing type '" + type + "'.");
	}
	else {
		let retObj = new objectClass( this );
		retObj.name = (name) ? name : type;
		retObj.type = type;
		retObj.tags = [...prefab.tags];
		
		if (options == null && (bitA != null || bitB != null)) { options = retObj.translateOptions(bitA, bitB); }
		if (options != null && options.rotation != null) { rotation = options.rotation; }
		
		// Make sprites
		retObj.sprites = new PIXI.Container();
		retObj.sprites.zIndex = (prefab.zIndex != null) ? prefab.zIndex : 0;
		retObj.sprites.sortableChildren = true;
		prefab.sprites.forEach((element) => {
			// 'this' is gameplay. (Probably?)
			if (!(element.tex)) {
				console.log("ERROR: Sprite parameters in prefab '" + type + "' has no texture string!");
				return;
			}
			
			let tint	= (element.tint != null)	? element.tint			: 0xffffff;
			let alpha	= (element.alpha != null)	? element.alpha			: 1;
			let anchor	= (element.anchor != null)	? element.anchor		: Vec2(0.5, 0.5);
			let scale	= (element.scale != null)	? element.scale.clone()	: Vec2(0.25, 0.25);
			let pos		= (element.pos != null)		? element.pos.clone()	: Vec2(0, 0);
			let rot		= (element.rot != null)		? element.rot			: 0;
			let zIndex	= (element.zIndex != null)	? element.zIndex		: 0;
			let visible	= (element.visible != null)	? element.visible		: true;
			
			pos.mul(this.settings.pixelScaleFactor);
			
			let newSpr = null;
			if (element.tex === '__rect') {
				// Element is a single-colour rectangle
				let width = scale.x * this.settings.pixelScaleFactor;
				let height = scale.y * this.settings.pixelScaleFactor;
				
				newSpr = new PIXI.Graphics();
				newSpr.lineStyle(0, 0, 0);
				
				newSpr.beginFill(0xffffff, alpha);
				newSpr.drawRect(
					(width * -anchor.x),	// x
					(height * -anchor.y),	// y
					width,					// width
					height					// height
				);
				
				// This says to pivot around the center.
				newSpr.pivot = new PIXI.Point(0, 0);
				newSpr.rotation = rot;
				
				newSpr.tint = tint;
				
				newSpr.position.x = pos.x;
				newSpr.position.y = pos.y;
			}
			else if (element.tex === '__circle') {
				// Element is a single-colour circle or ellipse
				let width = scale.x * this.settings.pixelScaleFactor;
				let height = scale.y * this.settings.pixelScaleFactor;
				let isCircle = (width === height);
				
				newSpr = new PIXI.Graphics();
				newSpr.lineStyle(0, 0, 0);
				
				newSpr.beginFill(0xffffff, alpha);
				if (isCircle) {
					newSpr.drawCircle(
						0,				// x
						0,				// y
						(width * 0.5)	// rad
					);
				}
				newSpr.drawEllipse(
					0,				// x
					0,				// y
					(width * 0.5),	// half-width
					(height * 0.5)	// half-height
				);
				
				// This says to pivot around the center.
				newSpr.pivot = new PIXI.Point(0, 0);
				newSpr.rotation = rot;
				
				newSpr.tint = tint;
				
				newSpr.position.x = pos.x;
				newSpr.position.y = pos.y;
			}
			else if (element.tex === '__triangle') {
				// triangle (well, actually any complex convex polygon)
				
				let points = [];
				if (element.points) {
					element.points.forEach((element1) => {
						let p1 = element1.clone();
						p1.x *= this.settings.pixelScaleFactor * scale.x;
						p1.y *= this.settings.pixelScaleFactor * scale.y;
						points.push(p1);
					});
				}
				else {
					let halfWidth = scale.x * this.settings.pixelScaleFactor * 0.75;
					let halfHeight = scale.y * this.settings.pixelScaleFactor * 0.5;
					
					points.push(new PIXI.Point(0, -halfHeight));
					points.push(new PIXI.Point((halfWidth * 0.57735026919),	(halfHeight * 0.5)));
					points.push(new PIXI.Point((halfWidth * -0.57735026919),	(halfHeight * 0.5)));
				}
				
				newSpr = new PIXI.Graphics();
				newSpr.lineStyle(0, 0, 0);
				
				newSpr.beginFill(0xffffff, alpha);
				newSpr.drawPolygon(points);

				
				// This says to pivot around the center.
				newSpr.pivot = new PIXI.Point(0, 0);
				newSpr.rotation = rot;
				
				newSpr.tint = tint;
				
				newSpr.position.x = pos.x;
				newSpr.position.y = pos.y;
			}
			else {
				let sprTex = gameplayTex[element.tex];
				let sprSize = Vec2(sprTex.width, sprTex.y);
				
				newSpr = new Sprite(sprTex);
				newSpr.tint = tint;
				newSpr.alpha = alpha;
				newSpr.anchor.set(anchor.x, anchor.y);
				newSpr.scale.set(utils.getSpriteScale(this, sprSize.x, scale.x), utils.getSpriteScale(this, sprSize.y, scale.y));
				newSpr.rotation = rot;
				newSpr.position.set(pos.x, pos.y);
			}
			
			if (newSpr) { 
				newSpr.zIndex = zIndex;
				newSpr.visible = visible;
				retObj.sprites.addChild(newSpr);
			}
			else { console.log("ERROR: Failed to construct sprite of texture '" + element.tex + "' whilst constructing type '" + type + "'."); }
		}, this);
		let sprPos = this.absGU2P(position);
		retObj.sprites.position.set(sprPos.x, sprPos.y);
		retObj.sprites.rotation = -rotation;
		this.stage.addChild(retObj.sprites);
		
		// Make Box2D stuff
		let bodyType = retObj.hasTag('static') ? 'static' : 'dynamic';
		if (!retObj.hasTag('no-box2D')) {
			bodDef = {};
			if (prefab.body != null) {
				// Copy definition, add position and angle, make bodyDef.
				for (var attr in prefab.body) { bodDef[attr] = prefab.body[attr]; }
			}
			
			if (!(bodDef.type)) {
				bodDef.type = 'dynamic';
			}
			
			bodyType = bodDef.type;
			bodDef.position = this.absGU2M(position);
			bodDef.angle = rotation;
			retObj.body = this.world.createBody( bodDef );
			retObj.body.gameobject = retObj;
				
			if (prefab.fixtures) {
				// Make fixtures.
				prefab.fixtures.forEach((element) => {
					retObj.body.createFixture(element);
				}, this);
			}
		}
		
		// Run object's setup function, add it to appropriate array, then return it.
		if (options == null) { options = {}; }
		if (retObj.setup) { retObj.setup(options); }
		if (!retObj.hasTag('subassembly')) {
			if (bodyType == 'static') {this.staticObjects.push(retObj); } else { this.dynamicObjects.push(retObj); }
		}
		return retObj;
	}
}

Gameplay.prototype.deleteObject = function(gameobject, options) {
	gameobject._markedForDeath = true;
	
	// Prevent circular chaining
	if (gameobject._midDestruction !== true) {
		gameobject._midDestruction = true;
		
		this._spawnCounts[gameobject.type]--;
		
		// Let it chain
		if (gameobject.destructor != null) { gameobject.destructor(options); }
		
		// Delete body
		if (gameobject.body != null) { this.world.destroyBody(gameobject.body); }
		
		// Delete sprites
		if (gameobject.sprites != null) {
			gameobject.sprites.parent.removeChild(gameobject.sprites);
			gameobject.sprites.destroy({children:true, texture:false, baseTexture:false});
		}
		
		// Remove from arrays, including checking for duplicates.
		
		// Static Objects
		let foundIndex = 1;
		let foundOnce = false;
		while (foundIndex !== -1) {
			foundIndex = this.staticObjects.findIndex((element) => element.id === gameobject.id);
			if (foundIndex !== -1) {
				if (foundOnce) { console.log('WARNING: Object "' + gameobject.name + '" was found multiple times in Gameplay.staticObjects during deletion. Indicates a bug.'); }
				else { foundOnce = true; }
				
				this.staticObjects.splice(foundIndex, 1);
			}
		}
		
		// Dynamic Objects
		foundIndex = 1;
		foundOnce = false;
		while (foundIndex !== -1) {
			foundIndex = this.dynamicObjects.findIndex((element) => element.id === gameobject.id);
			if (foundIndex !== -1) {
				if (foundOnce) { console.log('WARNING: Object "' + gameobject.name + '" was found multiple times in Gameplay.dynamicObjects during deletion. Indicates a bug.'); }
				else { foundOnce = true; }
				
				this.dynamicObjects.splice(foundIndex, 1);
			}
		}
	}
}

//	***
//	Getters
//	***

Gameplay.prototype.getObjectsOfType = function(type, areStatic) {
	// areStatic is optional. If true, will only check statics, if false dynamics, if undef the both.
	retObjs = [];
	
	if (this._spawnCounts[type] == null || this._spawnCounts[type] === 0) { return retObjs; }
	
	if (!(areStatic === true)) {
		this.dynamicObjects.forEach((element) => {
			if (element.type === type) { retObjs.push(element); }
		})
	}
	
	if (!(areStatic === false)) {
		this.staticObjects.forEach((element) => {
			if (element.type === type) { retObjs.push(element); }
		})
	}
	
	return retObjs;
}

Gameplay.prototype.getObjectsOfName = function(name, areStatic) {
	// areStatic is optional. If true, will only check statics, if false dynamics, if undef the both.
	retObjs = [];
	
	if (!(areStatic === true)) {
		this.dynamicObjects.forEach((element) => {
			if (element.name === name) { retObjs.push(element); }
		})
	}
	
	if (!(areStatic === false)) {
		this.staticObjects.forEach((element) => {
			if (element.name === name) { retObjs.push(element); }
		})
	}
	
	return retObjs;
}

Gameplay.prototype.getObjectsWithTag = function(tag, areStatic) {
	// areStatic is optional. If true, will only check statics, if false dynamics, if undef the both.
	retObjs = [];
	
	if (!(areStatic === true)) {
		this.dynamicObjects.forEach((element) => {
			if (element.hasTag(tag)) { retObjs.push(element); }
		})
	}
	
	if (!(areStatic === false)) {
		this.staticObjects.forEach((element) => {
			if (element.hasTag(tag)) { retObjs.push(element); }
		})
	}
	
	return retObjs;
}

//	***
//	Core functionality
//	***

Gameplay.prototype.checkReady = function() {
	return (this._levelLoaded && (this.IH.mode == 'input' || this.IH.ready));
}

Gameplay.prototype.update = function(deltaMS) {
	if (this._gameEnded != false) {
		this._afterEndTime -= deltaMS;
		
		if (this._afterEndTime < 500) {
			this.darkOverlay.visible = true;
			this.darkOverlay.alpha = 1 - (this._afterEndTime / 500);
		}
		
		if (this._afterEndTime < 0) {
			if (this._endState == 1) {
				this._behaviourTrigger = true;
				this._behaviour = "trigger_end_victory";
				this._behaviourOptions = { runTime: this.runTimeS };
				if (this.IH.mode == 'input') { this._behaviourOptions.inputEvents = this.IH.events; }
			}
			else if (this._endState == 2) {
				this._behaviourTrigger = true;
				this._behaviour = "trigger_end_skip";
				this._behaviourOptions = {
					runTime: this.runTimeS
				};
			}
			else {
				this._behaviourTrigger = true;
				this._behaviour = "trigger_end_defeat";
				this._behaviourOptions = {
					runTime: this.runTimeS
				};
			}
		}
	}
	else {
		if (this.checkReady() && this._startDarkTimer > 0) {
			this._startDarkTimer -= deltaMS;
			this.darkOverlay.alpha = this._startDarkTimer / 500;
			if (this._startDarkTimer <= 0) {
				this._startDarkTimer = 0;
				this.darkOverlay.visible = false;
			}
		}
	}
	
	// Update runTimeS
	if (this.runTimeS < 300) { this.runTimeS += deltaMS * 0.001; }
	
	let realDeltaMS = deltaMS;
	
	let player = this.getObjectsOfType('player', false)[0];
	if (player == null && this.timeFactor < 1) {
		this.timeFactor += deltaMS / 1000;
		this.timeFactor = (this.timeFactor < 1) ? this.timeFactor : 1;
	}
	
	deltaMS *= this.timeFactor;
	let deltaS = deltaMS / 1000;
	
	if (this.timeFactor !== 1) {
		this.slowOverlay.visible = true;
		this.slowOverlay.alpha = 1 - this.timeFactor;
	}
	else {
		this.slowOverlay.visible = false;
		this.slowOverlay.alpha = 0;
	}
	
	// Update InputHandler, cursor stage position
	let mousePos = new PIXI.Point(0, 0);
	if (this.IH.mode == 'input') {
		mousePos = this.app.renderer.plugins.interaction.mouse.global;
		
		let stageGlobalPos = new PIXI.Point(0, 0);
		this.stage.getGlobalPosition(stageGlobalPos, false);
		
		let relativeMousePos = new PIXI.Point(mousePos.x - stageGlobalPos.x, mousePos.y - stageGlobalPos.y);
		this.mousePosGU = this.absP2GU(relativeMousePos);
	}
	else { this.IH.update(deltaS, this.mousePosGU); }
	this.cursorStage.position.set(mousePos.x, mousePos.y);
	
	let bounds = this.app.stage.getBounds();
	let mouseInFrame = ((mousePos.x >= 0 && mousePos.x < bounds.width) && (mousePos.y >= 0 && mousePos.y < bounds.height));
	this.cursorStage.visible = mouseInFrame;
	
	// World Step
	this.world.step(deltaS);
	
	// Pre-update. I thought I'd end up using this way more than I have.
	
	this.dynamicObjects.forEach((element) => {
		element.updateFieldLogic(deltaS);
		if (element.preupdate) { element.preupdate(deltaMS); }
		if (element.position.lengthSquared() > 1000000) { element.destroy(false); } // Out of bounds destruction.
	}, this);
	
	this.staticObjects.forEach((element) => {
		if (element.preupdate) { element.preupdate(deltaMS); }		
	}, this);
	
	// Update proper
	
	this.dynamicObjects.forEach((element) => {
		if (element.update) { element.update(deltaMS); }	
	}, this);
	
	this.staticObjects.forEach((element) => {
		if (element.update) { element.update(deltaMS); }		
	}, this);
	
	this.visuals.forEach((element) => {
		if (element.update) { element.update(deltaS); }
		
		// Autokill
		if (element._lifetimed === true) {
			element._lifetimer -= deltaS;
			if (element._lifetimer < 0) { element._markedForDeath = true; }
		}
		
		// Flag for cleanup
		if (element._markedForDeath) {this._markedForDeathVisuals.push(element);}
	}, this);
	
	//if (this.IH.isTriggered('test')) {console.log('Test key pressed.');}
	
	if (this.IH.mode == 'input') { this.IH.update(deltaS, this.mousePosGU); }
	
	this.cleanup();
	
	if (this._behaviourTrigger && this._behaviour != "" && this[this._behaviour] != null) {
		this[this._behaviour](this._behaviourOptions);
	}
}

Gameplay.prototype.cleanup = function() {
	// GameObjects
	this._markedForDeath.forEach((element) => {
		if (element._markedForDeath) { this.deleteObject(element); }
	}, this);
	
	this._markedForDeath.length = 0;
	
	// Visuals
	this._markedForDeathVisuals.forEach((element) => {
		// Remove from array, including checking for duplicates.
		let foundIndex = 1;
		let foundOnce = false;
		while (foundIndex !== -1) {
			foundIndex = this.visuals.findIndex((element1) => element1 === element);
			if (foundIndex !== -1) {
				if (foundOnce) { console.log('WARNING: Visual was found multiple times in Gameplay.visuals during deletion. Indicates a bug.'); }
				else { foundOnce = true; }
				
				this.visuals.splice(foundIndex, 1);
			}
		}
		
		if (element._markedForDeath) { element.destroy(); }
	}, this);
	
	this._markedForDeathVisuals.length = 0;
}

Gameplay.prototype.destroy = function() {
	this.stage.destroy({ children: true });
	this.cursorStage.destroy({ children: true });
	delete this.world;
	this.IH.deleteAllKeys();
}

module.exports = Gameplay;



































