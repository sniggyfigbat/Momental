//	***
//	gameplay.js start
//	***

//const planck = require('../../node_modules/planck-js/dist/planck');
//const PIXI = require('../../node_modules/pixi.js/dist/pixi');
const uuid = require('uuid');
const mix = require('./mixinbuilder');
const prefabs = require('./prefabs');

'use strict'

let Sprite = PIXI.Sprite,
	Vec2 = planck.Vec2,
	gameplayTex = PIXI.Loader.shared.resources["assets/gameplay.json"].textures;

function Gameplay(world, app, IH, settings) {
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
	
	// Box2D world.	
	console.assert(world != null, 'ERROR: Gameplay object created with null world!'); 
	this.world = world;

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
	
	this.particleStageLower = new PIXI.Container();
	this.stage.addChild(this.particleStageLower);
	this.particleStageLower.zIndex = 10;
	
	this.particleStageMid = new PIXI.Container();
	this.stage.addChild(this.particleStageMid);
	this.particleStageMid.zIndex = 30;
	
	this.particleStageUpper = new PIXI.Container();
	this.stage.addChild(this.particleStageUpper);
	this.particleStageUpper.zIndex = 50;
	
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
	
	world.on('begin-contact', (contact) => {
		let fixtureA = contact.getFixtureA();
		let fixtureB = contact.getFixtureB();

		let bodyA = contact.getFixtureA().getBody();
		let bodyB = contact.getFixtureB().getBody();
		
		let goA = bodyA.gameobject;
		let goB = bodyB.gameobject;
		
		if (goA == null || goB == null) {
			// Probably nothing?
		}
		else {
			let aEnviro = fixtureA.getFilterCategoryBits() & 0x0020;
			let bEnviro = fixtureB.getFilterCategoryBits() & 0x0020;
			
			// proj_shotgun
			let aProjS = goA.type == 'proj_shotgun';
			let bProjS = goB.type == 'proj_shotgun';
			
			if ((aProjS || bProjS) && (aEnviro || bEnviro) && (!aProjS || !bProjS)) {
				// Ricochets
				let projS = (aProjS) ? goA : goB;
				projS._hasRicocheted = true;
				if (projS._canRicochet) { projS.body.setGravityScale(0.5); }
			}
			let aTakesDamage = goA.hasTag('takes_damage');
			let bTakesDamage = goB.hasTag('proj_shotgun');
			if ((aProjS || bProjS) && (!aProjS || !bProjS)) {
				let projS = (aProjS) ? goA : goB;
				let other = (aProjS) ? goB : goA;
				let takesDamage = (aProjS) ? bTakesDamage : aTakesDamage;
				
				if (takesDamage) {
					other.damage(15);
					projS.destroy(false);
				}
				else {
					let vel = this.relM2GU(projS.body.getLinearVelocity());
					if (vel.lengthSquared() < 100) { projS.destroy(false); }
				}
			}
			
			// TODO: Damage / Deletion
			
			// proj_launcher
			let aProjL = goA.type == 'proj_launcher';
			let bProjL = goB.type == 'proj_launcher';
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
	//	x11:	options bits. Usually the first two are rotation.
	
	// Allows for two objects per space.
	
	pixels = this.app.renderer.plugins.extract.pixels(new PIXI.Sprite(level));
	
	if (pixels.length !== (34 * 34 * 4)) {
		console.log("ERROR: Cannot load level, wrong size!");
		return false;
	}
	
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
						this.makeObject(type, null, Vec2(i + 0.5, j + 0.5), null, null, pixels[offsetIndex], pixels[offsetIndex + 1]);
					}
				} 
			}
		}
	}
	
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
	
	update( deltaMS ) {
		// Literally just update sprites to match body.
		if ((this.body) && (this.sprites)) {
			let bodPos = this.body.getPosition();
			let sprPos = this.GP.absM2P(bodPos);
			this.sprites.position.set(sprPos.x, sprPos.y);
			let rot = this.body.getAngle();
			this.sprites.rotation = -rot;
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
			
			let tint	= (element.tint != null)	? element.tint		: 0xffffff;
			let alpha	= (element.alpha != null)	? element.alpha		: 1;
			let anchor	= (element.anchor != null)	? element.anchor	: Vec2(0.5, 0.5);
			let scale	= (element.scale != null)	? element.scale		: Vec2(0.25, 0.25);
			let pos		= (element.pos != null)		? element.pos		: Vec2(0, 0);
			let rot		= (element.rot != null)		? element.rot		: 0;
			let zIndex	= (element.zIndex != null)	? element.zIndex	: 0;
			let visible	= (element.visible != null)	? element.visible	: true;
			
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
				// triangle (well, actually any complex cocave polygon)
				
				let points;
				if (element.points) {
					points = [...element.points];
					points.forEach((element) => {
						element.x *= this.settings.pixelScaleFactor * scale.x;
						element.y *= this.settings.pixelScaleFactor * scale.y;
					});
				}
				else {
					let halfWidth = scale.x * this.settings.pixelScaleFactor * 0.75;
					let halfHeight = scale.y * this.settings.pixelScaleFactor * 0.5;
					
					points = [];
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
	
	if (!areStatic === true) {
		this.dynamicObjects.forEach((element) => {
			if (element.type === type) { retObjs.push(element); }
		})
	}
	
	if (!areStatic === false) {
		this.staticObjects.forEach((element) => {
			if (element.type === type) { retObjs.push(element); }
		})
	}
	
	return retObjs;
}

Gameplay.prototype.getObjectsOfName = function(name, areStatic) {
	// areStatic is optional. If true, will only check statics, if false dynamics, if undef the both.
	retObjs = [];
	
	if (!areStatic === true) {
		this.dynamicObjects.forEach((element) => {
			if (element.name === name) { retObjs.push(element); }
		})
	}
	
	if (!areStatic === false) {
		this.staticObjects.forEach((element) => {
			if (element.name === name) { retObjs.push(element); }
		})
	}
	
	return retObjs;
}

Gameplay.prototype.getObjectsWithTag = function(tag, areStatic) {
	// areStatic is optional. If true, will only check statics, if false dynamics, if undef the both.
	retObjs = [];
	
	if (!areStatic === true) {
		this.dynamicObjects.forEach((element) => {
			if (element.hasTag(tag)) { retObjs.push(element); }
		})
	}
	
	if (!areStatic === false) {
		this.staticObjects.forEach((element) => {
			if (element.hasTag(tag)) { retObjs.push(element); }
		})
	}
	
	return retObjs;
}

//	***
//	Core functionality
//	***

Gameplay.prototype.update = function(deltaMS) {
	// Update cursor stage position
	let mousePos = this.app.renderer.plugins.interaction.mouse.global;
	this.cursorStage.position.set(mousePos.x, mousePos.y);
	
	let bounds = this.app.stage.getBounds();
	let mouseInFrame = ((mousePos.x >= 0 && mousePos.x < bounds.width) && (mousePos.y >= 0 && mousePos.y < bounds.height));
	this.cursorStage.visible = mouseInFrame;
	
	let realDeltaMS = deltaMS;
	
	deltaMS *= this.timeFactor;
	let deltaS = deltaMS / 1000;
	
	this.world.step(deltaS);
	
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
	
	this.IH.update(deltaMS);
	
	this.cleanup();
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

module.exports = Gameplay;



































