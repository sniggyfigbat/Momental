/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto
// implementation. Also, find the complete implementation of crypto on IE11.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}


/***/ }),
/* 1 */
/***/ (function(module, exports) {

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([bth[buf[i++]], bth[buf[i++]], 
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]]]).join('');
}

module.exports = bytesToUuid;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

let Sprite = PIXI.Sprite,
	Vec2 = planck.Vec2,
	gameplayTex = PIXI.Loader.shared.resources["assets/gameplay.json"].textures,
	particleTex = PIXI.Loader.shared.resources["assets/particles.json"].textures;


	
let visuals = {};

visuals.launcher_explosion = (GP, pos, radius, rot) => {
	// Four types of triangles! Debris / Shrapnel.
	let scaleTo1 = utils.getSpriteScale(GP, 128, 1);
	let scaleTo5 = utils.getSpriteScale(GP, 128, 0.5);
	let triMinScaleMult = 0.25;
	let triSpeed = radius * 3;
	let triMinSpeedMult = 0.5;
	let triStartColour =	"ff6600";
	let triEndColour =		"883300";
	
	let emitter = new PIXI.particles.Emitter(
		GP.particleStageLower,
		particleTex['equilateral.png'],
		{
			alpha: {
				list: [
					{ value: 1, time: 0 },
					{ value: 0.0, time: 1 }
				],
				isStepped: false
			},
			scale: {
				list: [
					{ value: scaleTo5, time: 0 },
					{ value: scaleTo5, time: 1 }
				],
				minimumScaleMultiplier: triMinScaleMult
			},
			color: {
				list: [
					{ value: triStartColour, time: 0 },
					{ value: triEndColour, time: 1 }
				],
				isStepped: false
			},
			speed: {
				list: [
					{ value: triSpeed, time: 0 },
					{ value: triSpeed/2, time: 1 }
				],
				minimumSpeedMultiplier: triMinSpeedMult,
				isStepped: false
			},
			startRotation: { min: 0, max: 360 },
			rotationSpeed: { min: 0, max: 0 },
			lifetime: { min: 0.5, max: 0.5 },
			frequency: 0.016,
			spawnChance: 10,
			particlesPerWave: 4,
			emitterLifetime: 0.25,
			maxParticles: 1000,
			pos: { x: pos.x, y: pos.y },
			addAtBack: false,
			spawnType: "circle",
			spawnCircle: {
				x: 0,
				y: 0,
				r: 0
			}
		}
	);
	emitter._lifetimed = true; // Marked as being auto-destroyable upon completion.
	emitter._lifetimer = 2; // emitterLifetime + lifetime.max + a bit.
	emitter._markedForDeath = false;
	GP.visuals.push(emitter);
	
	/*emitter = new PIXI.particles.Emitter(
		GP.particleStageLower,
		particleTex['triangle0.png'],
		{
			alpha: {
				list: [
					{ value: 1, time: 0 },
					{ value: 0.0, time: 1 }
				],
				isStepped: false
			},
			scale: {
				list: [
					{ value: scaleTo5, time: 0 },
					{ value: scaleTo5, time: 1 }
				],
				minimumScaleMultiplier: triMinScaleMult
			},
			color: {
				list: [
					{ value: triStartColour, time: 0 },
					{ value: triEndColour, time: 1 }
				],
				isStepped: false
			},
			speed: {
				list: [
					{ value: triSpeed, time: 0 },
					{ value: triSpeed/2, time: 1 }
				],
				minimumSpeedMultiplier: triMinSpeedMult,
				isStepped: false
			},
			startRotation: { min: 0, max: 360 },
			rotationSpeed: { min: 0, max: 0 },
			lifetime: { min: 0.5, max: 0.5 },
			frequency: 0.016,
			spawnChance: 10,
			particlesPerWave: 1,
			emitterLifetime: 0.25,
			maxParticles: 1000,
			pos: { x: pos.x, y: pos.y },
			addAtBack: false,
			spawnType: "circle",
			spawnCircle: {
				x: 0,
				y: 0,
				r: 0
			}
		}
	);
	emitter._lifetimed = true; // Marked as being auto-destroyable upon completion.
	emitter._lifetimer = 2; // emitterLifetime + lifetime.max + a bit.
	emitter._markedForDeath = false;
	GP.visuals.push(emitter);
	
	emitter = new PIXI.particles.Emitter(
		GP.particleStageLower,
		particleTex['triangle1.png'],
		{
			alpha: {
				list: [
					{ value: 1, time: 0 },
					{ value: 0.0, time: 1 }
				],
				isStepped: false
			},
			scale: {
				list: [
					{ value: scaleTo5, time: 0 },
					{ value: scaleTo5, time: 1 }
				],
				minimumScaleMultiplier: triMinScaleMult
			},
			color: {
				list: [
					{ value: triStartColour, time: 0 },
					{ value: triEndColour, time: 1 }
				],
				isStepped: false
			},
			speed: {
				list: [
					{ value: triSpeed, time: 0 },
					{ value: triSpeed/2, time: 1 }
				],
				minimumSpeedMultiplier: triMinSpeedMult,
				isStepped: false
			},
			startRotation: { min: 0, max: 360 },
			rotationSpeed: { min: 0, max: 0 },
			lifetime: { min: 0.5, max: 0.5 },
			frequency: 0.016,
			spawnChance: 10,
			particlesPerWave: 1,
			emitterLifetime: 0.25,
			maxParticles: 1000,
			pos: { x: pos.x, y: pos.y },
			addAtBack: false,
			spawnType: "circle",
			spawnCircle: {
				x: 0,
				y: 0,
				r: 0
			}
		}
	);
	emitter._lifetimed = true; // Marked as being auto-destroyable upon completion.
	emitter._lifetimer = 2; // emitterLifetime + lifetime.max + a bit.
	emitter._markedForDeath = false;
	GP.visuals.push(emitter);
	
	emitter = new PIXI.particles.Emitter(
		GP.particleStageLower,
		particleTex['triangle2.png'],
		{
			alpha: {
				list: [
					{ value: 1, time: 0 },
					{ value: 0.0, time: 1 }
				],
				isStepped: false
			},
			scale: {
				list: [
					{ value: scaleTo5, time: 0 },
					{ value: scaleTo5, time: 1 }
				],
				minimumScaleMultiplier: triMinScaleMult
			},
			color: {
				list: [
					{ value: triStartColour, time: 0 },
					{ value: triEndColour, time: 1 }
				],
				isStepped: false
			},
			speed: {
				list: [
					{ value: triSpeed, time: 0 },
					{ value: triSpeed/2, time: 1 }
				],
				minimumSpeedMultiplier: triMinSpeedMult,
				isStepped: false
			},
			startRotation: { min: 0, max: 360 },
			rotationSpeed: { min: 0, max: 0 },
			lifetime: { min: 0.5, max: 0.5 },
			frequency: 0.016,
			spawnChance: 10,
			particlesPerWave: 1,
			emitterLifetime: 0.25,
			maxParticles: 1000,
			pos: { x: pos.x, y: pos.y },
			addAtBack: false,
			spawnType: "circle",
			spawnCircle: {
				x: 0,
				y: 0,
				r: 0
			}
		}
	);
	emitter._lifetimed = true; // Marked as being auto-destroyable upon completion.
	emitter._lifetimer = 2; // emitterLifetime + lifetime.max + a bit.
	emitter._markedForDeath = false;
	GP.visuals.push(emitter);*/
	
	// The actual explosion
	emitter = new PIXI.particles.Emitter(
		GP.particleStageMid,
		particleTex['equilateral.png'],
		{
			alpha: {
				list: [
					{ value: 1, time: 0 },
					{ value: 0.0, time: 1 }
				],
				isStepped: false
			},
			scale: {
				list: [
					{ value: scaleTo1 * 2, time: 0 },
					{ value: scaleTo1, time: 1 }
				],
				minimumScaleMultiplier: 0.5
			},
			color: {
				list: [
					{ value: "000000", time: 0 },
					{ value: "ff6600", time: 1 }
				],
				isStepped: false
			},
			speed: {
				list: [
					{ value: radius/16, time: 0 },
					{ value: 0, time: 1 }
				],
				isStepped: false
			},
			startRotation: { min: 0, max: 360 },
			rotationSpeed: { min: 0, max: 0 },
			lifetime: { min: 0.5, max: 0.5 },
			frequency: 0.008,
			spawnChance: 10,
			particlesPerWave: 2,
			emitterLifetime: 0.25,
			maxParticles: 1000,
			pos: { x: pos.x, y: pos.y },
			addAtBack: false,
			spawnType: "circle",
			spawnCircle: {
				x: 0,
				y: 0,
				r: radius / 4
			}
		}
	);
	emitter._lifetimed = true; // Marked as being auto-destroyable upon completion.
	emitter._lifetimer = 2; // emitterLifetime + lifetime.max + a bit.
	emitter._markedForDeath = false;
	GP.visuals.push(emitter);
	
	// Finally, create actual shrapnel
	posGU = GP.absP2GU(pos);
	for (let i = 0; i < 8; i++) {
		let locRot = rot + (i * utils.PI / 4);
		let imp = Vec2(-Math.cos(locRot), -Math.sin(locRot));
		let offset = imp.clone().mul(0.5);
		imp.mul(10);
		offset.add(posGU);
		let temp = GP.makeObject('gibs_launcher', null, offset, locRot);
		temp.body.applyLinearImpulse(imp, offset, true);
	}	
}

visuals.trail = class {
	constructor(parent, thickness, lifespan, colour, alpha) {
		console.assert(parent/* instanceof GameObject*/ != null, 'ERROR: visuals.trail created without a valid parent.')
		this.parent = parent;
		this._deadParent = false;
		
		this.thickness = thickness || 0.5;
		this.lifespan = 0.5;
		this.colour = colour || 0xff0000;
		this.alpha = alpha || 0.25;
		
		this._thicknessP = parent.GP.relGU2P(this.thickness);
		
		// Admin
		this._lifetimed = false;
		this._lifetimer = -1;
		this._markedForDeath = false;
		parent.GP.visuals.push(this);
		
		// Sprite
		this.sprite = new PIXI.Container();
		this.sprite.zIndex = 5;
		parent.GP.stage.addChild(this.sprite);
		
		// Points
		let posP = parent.GP.absGU2P(parent.position);
		let rot;
		if (parent.body != null) {
			let vel = parent.body.getLinearVelocity();
			rot = -Math.atan2(vel.y, vel.y);
		} else { rot = -parent.rotation; }
		
		this.drawStart = new visuals._trailPoint(this, null, posP, rot, 0, this.colour, this.alpha); // A point that exactly tracks the parent, updated every turn. Where drawing starts.
		this.points = []; // array of visuals._trailPoints, added to to create tail.
		this.points.push(this.drawStart.splitSegment(this));
		
		// Internal
		this._timeSinceLastPoint = 0;
		this.maxTimeSinceLastPoint = 0.2;
		this._lastPoint = this.parent.position;
		this._distSinceLastPoint = 0;
		this.maxDistSinceLastPoint = 0.25;
		this._maxDistSinceLastPointSq = this.maxDistSinceLastPoint * this.maxDistSinceLastPoint;
	}
	
	setColour(colour) {
		this.colour = colour;
		this.drawStart.colour = colour;
	}
	
	update(deltaS) {
		// Update this.drawStart, create new point if necessary:
		this.drawStart.deltaS += deltaS;
		this._timeSinceLastPoint += deltaS;
		
		// Check if parent still exists.
		if (!this._deadParent && this.parent != null && !this.parent._markedForDeath) {
			let makeNewPoint = false;
			
			// Check time.
			if (this._timeSinceLastPoint > this.maxTimeSinceLastPoint) { makeNewPoint = true; }
			
			// Check dist.
			let currentPos = this.parent.position;
			let relative = currentPos.clone().sub(this._lastPoint);
			let distSq = relative.lengthSquared();
			if (distSq > this._maxDistSinceLastPointSq) { makeNewPoint = true; }
			
			let posP = this.parent.GP.absGU2P(currentPos);				
			this.drawStart.pos = posP;
			this.drawStart.rot = -Math.atan2(relative.y, relative.x);
			
			// If necessary, make new point.
			if (makeNewPoint) {
				this.points.push(this.drawStart.splitSegment(this));
				
				this._timeSinceLastPoint = 0;
				this._lastPoint = currentPos;
				
				let pl = this.points.length;
				if (pl > 1) { this.points[pl - 2].update(); }
				if (pl > 0) { this.points[pl - 1].update(); }
				this.drawStart.update()
			}
			else {
				let pl = this.points.length;
				if (pl > 0) { this.points[pl - 1].update(); }
				this.drawStart.update()
			}
		}
		else {
			this.parent = null;
			this._deadParent = true;
		}
		
		// Redraw trail:
		
		let reachedArrayStart = false;
		let reachedTailEnd = false;
		
		let lastUnusedIndex = -1;
		
		let currentIndex = this.points.length - 1;
		let remainingLifespan = this.lifespan;
		
		// Start at this.drawStart, go all the way down the tail to the end, and then back up again on the other side.
		while (!reachedArrayStart && !reachedTailEnd) {
			let thickness1 = (remainingLifespan / this.lifespan) * this._thicknessP;
			remainingLifespan -= this.points[currentIndex]._next.deltaS;
			let thickness2 = (remainingLifespan / this.lifespan) * this._thicknessP;
			
			this.points[currentIndex].draw(thickness2, thickness1);
			
			currentIndex--;
			if (remainingLifespan < 0) {
				lastUnusedIndex = currentIndex;
				reachedTailEnd = true;
			}
			if (currentIndex < 0) { reachedArrayStart = true; }
		}
		
		// Cleanup dead points.
		if (reachedTailEnd && lastUnusedIndex > -1) {
			let lastUsedIndex = lastUnusedIndex + 1;
			
			for (let i = 0; i < lastUsedIndex; i++) {
				this.points[i].destroy();
			}
			
			this.points[lastUsedIndex]._previous = null;
			this.points[lastUsedIndex].update();
			
			this.points.splice(0, lastUsedIndex);
		}
		
		// Check for death.
		if (this._deadParent && this.drawStart.deltaS > this.lifespan) { this._markedForDeath = true; }
	}
	
	destroy() {
		for (let i = 0; i < this.points.length; i++) {
			this.points[i].destroy();
		}
		
		this.sprite.parent.removeChild(this.sprite);
		this.sprite.destroy({children:true, texture:false, baseTexture:false});
		this.points.length = 0;
	}
}

visuals._trailPoint = class {
	constructor(parent, previous, pos, rot, deltaS, colour, alpha) {
		this.pos = pos;
		this.rot = rot;
		this.deltaS = deltaS;
		this.colour = colour;
		this.alpha = alpha;
		
		this._previous = (previous != null) ? previous : null;
		this._next = null;
		
		this._isEndPoint = true;
		this._isHarshCorner = false;
		this._inAngle = this.rot; // Only updated/used if this._isHarshCorner
		this._outAngle = this.rot; // Only updated/used if this._isHarshCorner
		
		this.sprite = new PIXI.Graphics();
		parent.sprite.addChild(this.sprite);
	}
	
	update() {
		let prevNull = this._previous == null;
		let nextNull = this._next == null;
		
		this._isEndPoint = false;
		this._isHarshCorner = false;
		
		// is Single point?
		if (prevNull && nextNull) {
			this._isEndPoint = true;
			return;
		}
		
		// Calculate angles
		let inAngle, outAngle;
		if (!prevNull) {
			let relative = this.pos.clone();
			relative.x -= this._previous.pos.x;
			relative.y -= this._previous.pos.y;
			
			inAngle = Math.atan2(relative.y, relative.x);
		}
		if (!nextNull) {
			let relative = this._next.pos.clone();
			relative.x -= this.pos.x;
			relative.y -= this.pos.y;
			
			outAngle = Math.atan2(relative.y, relative.x);
		}
		
		// is Endpoint?
		if (prevNull) {
			this._isEndPoint = true;
			this.rot = outAngle;
			return;
		}
		if (nextNull) {
			this._isEndPoint = true;
			this.rot = inAngle;
			return;
		}
		
		// Middle point.
		// Node has both previous and next.
		// Check if needs a harsh break.
		
		let deltaRot = utils.bearingDelta(inAngle, outAngle);
		
		if (deltaRot == Infinity || deltaRot == -Infinity || deltaRot == undefined || isNaN(deltaRot)) {
			let temp = 1; // Put a breakpoint here.
		}
		
		if (Math.abs(deltaRot) > utils.PI/6) {
			this._isHarshCorner = true;
			this._inAngle = inAngle;
			this._outAngle = outAngle;
			return;
		}
		else {
			this.rot = inAngle + (deltaRot / 2);
			return;
		}
	}
	
	draw(thicknessHere, thicknessNext) {
		this.sprite.clear();
		this.sprite.tint = this.colour;
		this.sprite.lineStyle(0, 0, 0);
		this.sprite.beginFill(0xffffff, this.alpha);
		
		if (this._isEndPoint || this._isHarshCorner) {
			this.sprite.drawCircle(this.pos.x, this.pos.y, thicknessHere * 0.5);
		}
		
		if ((this.pos.x == Infinity || this.pos.x == -Infinity || this.pos.x == undefined || this.pos.x == 0 || isNaN(this.pos.x)) ||
			(this.pos.y == Infinity || this.pos.y == -Infinity || this.pos.y == undefined || this.pos.y == 0 || isNaN(this.pos.y)) || this.pos == null) {
			let temp = 1; // Put a breakpoint here.
		}
		
		if (this._next == null) { return; }
		
		if ((this._next.pos.x == Infinity || this._next.pos.x == -Infinity || this._next.pos.x == undefined || this._next.pos.x == 0 || isNaN(this._next.pos.x)) ||
			(this._next.pos.y == Infinity || this._next.pos.y == -Infinity || this._next.pos.y == undefined || this._next.pos.y == 0 || isNaN(this._next.pos.y)) || this._next.pos == null) {
			let temp = 1; // Put a breakpoint here.
		}
		
		let points = [];
		
		// Points here
		if (thicknessHere > 0) {
			// Normal segment
			
			let angleChoice = (this._isHarshCorner) ? 2 : 0;
			points.push(this.getOffsetPoint(thicknessHere, true, angleChoice));
			points.push(this.getOffsetPoint(thicknessHere, false, angleChoice));
		}
		else {
			if (thicknessHere == thicknessNext) {
				let t = 0;
			}
			
			let prop = thicknessNext / (thicknessNext - thicknessHere);
			let relative = this.pos.clone();
			
			relative.x -= this._next.pos.x;
			relative.y -= this._next.pos.y;
			
			let tailTip = this._next.pos.clone();
			tailTip.x += relative.x * prop;
			tailTip.y += relative.y * prop;
			
			points.push(tailTip);
		}
		
		// Points next
		let angleChoice = (this._next._isHarshCorner) ? 1 : 0;
		points.push(this._next.getOffsetPoint(thicknessHere, false, angleChoice));
		points.push(this._next.getOffsetPoint(thicknessHere, true, angleChoice));
		
		//this.sprite.beginFill(0xffffff, 0.25);
		this.sprite.drawPolygon(points);
		
		return;
	}
	
	getOffsetPoint(thicknessP, inPositive, angleChoice) {
		let factor = inPositive ? thicknessP * 0.5 : thicknessP * -0.5;
		let retPoint = this.pos.clone();
		
		angleChoice = angleChoice || 0;
		let rotation;
		
		if (angleChoice === 1) { rotation = this._inAngle; }
		else if (angleChoice === 2) { rotation = this._outAngle; }
		else if (angleChoice === 0) { rotation = this.rot; }
		
		let offset = new PIXI.Point();
		
		offset.x = Math.sin(this.rot);
		offset.y = -Math.cos(this.rot);
		
		offset.x *= factor;
		offset.y *= factor;
		
		retPoint.x += offset.x;
		retPoint.y += offset.y;
		
		if ((retPoint.x == Infinity || retPoint.x == -Infinity || retPoint.x == undefined || retPoint.x == 0 || isNaN(retPoint.x)) ||
			(retPoint.y == Infinity || retPoint.y == -Infinity || retPoint.y == undefined || retPoint.y == 0 || isNaN(retPoint.y)) || retPoint == null) {
			let temp = 1; // Put a breakpoint here.
		}
		
		/*retPoint.x += factor * Math.sin(this.rot);
		retPoint.y += factor * Math.cos(this.rot)*/
		return retPoint;
	}
	
	splitSegment(parent) {
		let retObj = new visuals._trailPoint(parent, this._previous, this.pos.clone(), this.rot, this.deltaS, this.colour, this.alpha);
		retObj._next = this;
		
		if (this._previous != null) { this._previous._next = retObj; }
		
		this._previous = retObj;
		this.deltaS = 0;
		
		return retObj;
	}
	
	destroy() {
		this._previous = null;
		this._next = null;
		
		this.sprite.parent.removeChild(this.sprite);
		this.sprite.destroy({children:true, texture:false, baseTexture:false});
	}
}

visuals.tesla_beam = class {
	constructor(GP, startGU, endGU) {
		this.totalLifespan = 0.5;
		this.lifespan = this.totalLifespan;
		this.alpha = 1;
		let thickness = GP.relGU2P(0.0625);
		
		// Admin
		this._lifetimed = false;
		this._lifetimer = -1;
		this._markedForDeath = false;
		GP.visuals.push(this);
		
		// Basic stuff
		let relative = endGU.clone().sub(startGU),
			relativeAngle = Math.atan2(relative.y, relative.x),
			dist = relative.length(),
			relN = relative.clone();
		relN.normalize();
		
		// Gen Points and draw beam
		let pointCount = Math.ceil(dist),
			subSegment = dist / pointCount;
		
		this.sprite = new PIXI.Graphics();
		this.sprite.zIndex = 29;
		GP.stage.addChild(this.sprite);
		
		this.sprite.lineStyle(thickness, 0x00ff00, 1, 0.5);
		this.sprite.beginFill(0x00ff00, 0);
		
		let startP = GP.absGU2P(startGU);
		this.sprite.moveTo(startP.x, startP.y); // Why the flying fuck does PIXI not let me input points into half its damn calls?
		for (let i = 1; i < pointCount; i++) {
			let offset = Vec2(-relN.y, relN.x),
				offsetFactor = Math.random() - 0.5;
			offset.mul(offsetFactor);
			let temp = relN.clone().mul(i * subSegment).add(offset);
			temp = startGU.clone().add(temp);
			temp = GP.absGU2P(temp);
			this.sprite.lineTo(temp.x, temp.y);
		}
		let endP = GP.absGU2P(endGU);
		this.sprite.lineTo(endP.x, endP.y);
		
		// Put some nice circles at the endpoints
		this.sprite.beginFill(0x00ff00, 1);
		this.sprite.drawCircle(startP.x, startP.y, thickness);
		this.sprite.drawCircle(endP.x, endP.y, thickness);
		
		// Particles?
		let scaleTo025 = utils.getSpriteScale(GP, 128, .25),
			speed = GP.relGU2P(0.125),
			radius = GP.relGU2P(0.5),
			emitter;
	
		emitter = new PIXI.particles.Emitter(
			GP.particleStageMid,
			particleTex['diamond.png'],
			{
				alpha: {
					list: [
						{ value: 1, time: 0 },
						{ value: 0, time: 1 }
					],
					isStepped: false
				},
				scale: {
					list: [
						{ value: scaleTo025, time: 0 },
						{ value: scaleTo025, time: 1 }
					],
					minimumScaleMultiplier: 0.5
				},
				color: {
					list: [
						{ value: "00ff00", time: 0 },
						{ value: "ffffff", time: 1 }
					],
					isStepped: false
				},
				speed: {
					list: [
						{ value: speed, time: 0 },
						{ value: speed, time: 1 }
					],
					isStepped: false
				},
				startRotation: { min: 0, max: 0 },
				rotationSpeed: { min: 0, max: 0 },
				lifetime: { min: 0.5, max: 0.5 },
				frequency: 0.1,
				spawnChance: 10,
				particlesPerWave: 5,
				emitterLifetime: 0.25,
				maxParticles: 1000,
				pos: { x: endP.x, y: endP.y },
				addAtBack: false,
				spawnType: "circle",
				spawnCircle: {
					x: 0,
					y: 0,
					r: radius
				}
			}
		);
		emitter._lifetimed = true; // Marked as being auto-destroyable upon completion.
		emitter._lifetimer = 2; // emitterLifetime + lifetime.max + a bit.
		emitter._markedForDeath = false;
		GP.visuals.push(emitter);
	
	}
	
	update(deltaS) {
		this.lifespan -= deltaS;
		if (this.lifespan < 0) {
			this.lifespan = 0;
			this._markedForDeath = true;
		}
		
		this.sprite.alpha = this.lifespan / this.totalLifespan;
	}
	
	destroy() {
		this.sprite.parent.removeChild(this.sprite);
		this.sprite.destroy({children:true, texture:false, baseTexture:false});
	}
}

visuals.proj_shotgun_death = function(GP, posGU, dealtDamage) {
	let posP = GP.absGU2P(posGU);
	let colour = dealtDamage ? 'ff6600' : '000000';
	
	let scale = utils.getSpriteScale(GP, 128, .25),
		speed = GP.relGU2P(0.5);
	
	let emitter = new PIXI.particles.Emitter(
		GP.particleStageUpper,
		particleTex['equilateral.png'],
		{
			alpha: {
				list: [
					{ value: 1, time: 0 },
					{ value: 1, time: 0.5 },
					{ value: 0, time: 1 }
				],
				isStepped: false
			},
			scale: {
				list: [
					{ value: scale, time: 0 },
					{ value: scale, time: 1 }
				],
				minimumScaleMultiplier: 0.5
			},
			color: {
				list: [
					{ value: colour, time: 0 },
					{ value: colour, time: 1 }
				],
				isStepped: false
			},
			speed: {
				list: [
					{ value: speed * 2, time: 0 },
					{ value: speed, time: 1 }
				],
				minimumSpeedMultiplier: 0.75,
				isStepped: false
			},
			startRotation: { min: 0, max: 360 },
			rotationSpeed: { min: 0, max: 0 },
			lifetime: { min: 0.5, max: 0.5 },
			frequency: 0.08,
			spawnChance: 10,
			particlesPerWave: 4,
			emitterLifetime: 0.2,
			maxParticles: 1000,
			pos: { x: posP.x, y: posP.y },
			addAtBack: false,
			spawnType: "circle",
			spawnCircle: {
				x: 0,
				y: 0,
				r: 0
			}
		}
	);
	emitter._lifetimed = true; // Marked as being auto-destroyable upon completion.
	emitter._lifetimer = 2; // emitterLifetime + lifetime.max + a bit.
	emitter._markedForDeath = false;
	GP.visuals.push(emitter);
}

visuals.door_key_death = function(GP, posGU, colour) {
	let posP = GP.absGU2P(posGU);
	
	// Why doesn't PIXI particles take normal hex values? We may never know...
	if (colour == 'red') { colour = 'ff0000'; }
	else if (colour == 'green') { colour = '00ff00'; }
	else if (colour == 'blue') { colour = '0000ff'; }
	else { colour = 'ffffff'; }
	
	let scale = utils.getSpriteScale(GP, 128, .5),
		speed = GP.relGU2P(2);
	
	let emitter = new PIXI.particles.Emitter(
		GP.particleStageUpper,
		particleTex['squares.png'],
		{
			alpha: {
				list: [
					{ value: 1, time: 0 },
					{ value: 0, time: 1 }
				],
				isStepped: false
			},
			scale: {
				list: [
					{ value: scale, time: 0 },
					{ value: scale, time: 1 }
				],
				minimumScaleMultiplier: 0.5
			},
			color: {
				list: [
					{ value: '000000', time: 0 },
					{ value: colour, time: 1 }
				],
				isStepped: false
			},
			speed: {
				list: [
					{ value: speed, time: 0 },
					{ value: 0, time: 1 }
				],
				minimumSpeedMultiplier: 0.25,
				isStepped: false
			},
			startRotation: { min: 0, max: 360 },
			rotationSpeed: { min: 0, max: 0 },
			lifetime: { min: 0.5, max: 1 },
			frequency: 0.08,
			spawnChance: 10,
			particlesPerWave: 10,
			emitterLifetime: 0.2,
			maxParticles: 1000,
			pos: { x: posP.x, y: posP.y },
			addAtBack: false,
			spawnType: "circle",
			spawnCircle: {
				x: 0,
				y: 0,
				r: 0
			}
		}
	);
	emitter._lifetimed = true; // Marked as being auto-destroyable upon completion.
	emitter._lifetimer = 2; // emitterLifetime + lifetime.max + a bit.
	emitter._markedForDeath = false;
	GP.visuals.push(emitter);
}

visuals.proj_key = class {
	constructor(projectile) {
		this.parent = projectile;
		
		let posP = projectile.GP.absGU2P(projectile.position);
		
		// Why doesn't PIXI particles take normal hex values? We may never know...
		let colour;
		if (projectile.colour == 'red') { colour = 'ff0000'; }
		else if (projectile.colour == 'green') { colour = '00ff00'; }
		else if (projectile.colour == 'blue') { colour = '0000ff'; }
		else { colour = 'dddddd'; }
		
		let scale = utils.getSpriteScale(projectile.GP, 128, .25),
			radius = projectile.GP.relGU2P(1);
		
		this.emitter = new PIXI.particles.Emitter(
			projectile.GP.particleStageLower,
			particleTex['squares.png'],
			{
				alpha: {
					list: [
						{ value: 1, time: 0 },
						{ value: 0, time: 1 }
					],
					isStepped: false
				},
				scale: {
					list: [
						{ value: scale, time: 0 },
						{ value: scale, time: 1 }
					],
					minimumScaleMultiplier: 0.25
				},
				color: {
					list: [
						{ value: colour, time: 0 },
						{ value: colour, time: 1 }
					],
					isStepped: false
				},
				speed: {
					list: [
						{ value: 0, time: 0 },
						{ value: 0, time: 1 }
					],
					isStepped: false
				},
				startRotation: { min: 0, max: 360 },
				rotationSpeed: { min: 0, max: 0 },
				lifetime: { min: 0.5, max: 1 },
				frequency: 0.1,
				spawnChance: 10,
				particlesPerWave: 1,
				emitterLifetime: -1,
				maxParticles: 1000,
				pos: { x: posP.x, y: posP.y },
				addAtBack: false,
				spawnType: "circle",
				spawnCircle: {
					x: 0,
					y: 0,
					r: radius
				}
			}
		);
		
		this._lifetimed = false; // Marked as being auto-destroyable upon completion.
		this._lifetimer = -1; // emitterLifetime + lifetime.max + a bit.
		this._markedForDeath = false;
		projectile.GP.visuals.push(this);
	}
	
	update(deltaS) {
		if (this.parent != null && !this.parent._markedForDeath) {
			let posP = this.parent.GP.absGU2P(this.parent.position);
			this.emitter.updateSpawnPos(posP.x, posP.y);
		}
		this.emitter.update(deltaS);
	}
	
	stopEmitting() {
		this.emitter.emit = false;
		this._lifetimed = true; // Marked as being auto-destroyable upon completion.
		this._lifetimer = 5; // emitterLifetime + lifetime.max + a bit.
	}
	
	destroy() {
		this.emitter.destroy();
	}
}

module.exports = visuals;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

//	***
//	app.js start
//	***

//var planck = require('../node_modules/planck-js/dist/planck');
//require('../node_modules/pixi.js/dist/pixi');
//require('../node_modules/pixi-particles/dist/pixi-particles');

let Gameplay;
var GP;
var utils = __webpack_require__(4);

let type = "WebGL";

if(!PIXI.utils.isWebGLSupported()) {
	type = "canvas";
}

// Aliases
let Application = PIXI.Application,
	loader = PIXI.Loader.shared,
	resources = PIXI.Loader.shared.resources,
	Sprite = PIXI.Sprite,
	Vec2 = planck.Vec2;
	
let gameplayTex;

// Create basic Planck/Box2D vars.
let world = planck.World({
  gravity: Vec2(0, -10)
});

//	***
//	Window setup
//	***

let winInSize, app, bucket;

function setupApp() {
	// Useful code stolen from https://andylangton.co.uk/blog/development/get-viewportwindow-size-width-and-height-javascript , many thanks.
	let w = window,
		d = document,
		e = d.documentElement,
		g = d.getElementsByTagName('body')[0],
		winX = w.innerWidth		|| e.clientWidth	|| g.clientWidth,
		winY = w.innerHeight	|| e.clientHeight	|| g.clientHeight;
	winInSize = Vec2(winX, winY);

	// Make a big PIXI canvas that will take up the whole screen, then put an appropriately-sized game in the middle of it.
		
	// Start by deciding on an appropriate bucket to apply to this screen.
	let minDim = (winInSize.x < winInSize.y) ? winInSize.x : winInSize.y;
	if (minDim >= 2176) {	// I can dream, right?
		bucket = {
			width: 2176,
			height: 2176,
			pixelScaleFactor: 64,
			//cursorIconSize: "url('cursors/cursor_64p.png') 32 32,auto"
		};
	}
	else if (minDim >= 1632) {	// Unlikely, but possible. 4K?
		bucket = {
			width: 1632,
			height: 1632,
			pixelScaleFactor: 48,
			//cursorIcon: "url('cursors/cursor_48p.png') 24 24,auto"
		};
	}
	else if (minDim >= 1088) {	// Still quite unlikely. 1440p, I guess?
		bucket = {
			width: 1088,
			height: 1088,
			pixelScaleFactor: 32,
			//cursorIcon: "url('cursors/cursor_32p.png') 16 16,auto"
		};
	}
	else if (minDim >= 816) {	// Most likely to be used. Good ol' 1080p.
		bucket = {
			width: 816,
			height: 816,
			pixelScaleFactor: 24,
			//cursorIcon: "url('cursors/cursor_24p.png') 12 12,auto"
		};
	}
	else {						// Minimum pixelScaleFactor is 16. Honestly, what are they using, a fucking smart-toaster?
		bucket = {
			width: 544,
			height: 544,
			pixelScaleFactor: 16,
			//cursorIcon: "url('cursors/cursor_16p.png') 8 8,auto"
		};
	}
		
	// Create a Pixi Application
	//let app = new Application({width: 544, height: 544, backgroundColor: 0xffffff});
	app = new Application({width: winInSize.x, height: winInSize.y, backgroundColor: 0xffffff});

	// Add the canvas that Pixi automatically created for you to the HTML document
	document.body.appendChild(app.view);
	
	// Make rectangles to fill in the sides.
	let oddWidth = (winInSize.x % 2 !== 0), // If I don't check I just know some bastard will be all like 'o no i made my window 1079p and now everything's blurry'.
		oddHeight = (winInSize.y % 2 !== 0),
		sideWidth = oddWidth	? (winInSize.x - 1 - bucket.width) * 0.5	: (winInSize.x - bucket.width) * 0.5,
		topsHeight = oddHeight	? (winInSize.y - 1 - bucket.height) * 0.5	: (winInSize.y - bucket.height) * 0.5,
		borderCol = 0x000000;	
	
	let upper = new PIXI.Graphics();
	upper.lineStyle(0, 0, 0);	
	upper.beginFill(borderCol, 1);
	upper.drawRect(
		0,				// x
		0,				// y
		winInSize.x,	// width
		topsHeight		// height
	);
	app.stage.addChild(upper);
	
	let lower = new PIXI.Graphics();
	lower.lineStyle(0, 0, 0);	
	lower.beginFill(borderCol, 1);
	lower.drawRect(
		0,										// x
		topsHeight + bucket.height,				// y
		winInSize.x,							// width
		oddHeight ? topsHeight + 1 : topsHeight	// height
	);
	app.stage.addChild(lower);
	
	let left = new PIXI.Graphics();
	left.lineStyle(0, 0, 0);	
	left.beginFill(borderCol, 1);
	left.drawRect(
		0,				// x
		0,				// y
		sideWidth,		// width
		winInSize.y		// height
	);
	app.stage.addChild(left);
	
	let right = new PIXI.Graphics();
	right.lineStyle(0, 0, 0);	
	right.beginFill(borderCol, 1);
	right.drawRect(
		sideWidth + bucket.width,				// x
		0,										// y
		oddWidth ? sideWidth + 1 : sideWidth,	// width
		winInSize.y								// height
	);
	app.stage.addChild(right);

	bucket.xOffset = sideWidth;
	bucket.yOffset = topsHeight;
	
	let halfPSF = bucket.pixelScaleFactor / 2;
	app.renderer.plugins.interaction.cursorStyles.default	= "url('cursors/cursor_white_" + bucket.pixelScaleFactor + "p.png') " + halfPSF + " " + halfPSF + ",auto";
	app.renderer.plugins.interaction.cursorStyles.white		= "url('cursors/cursor_white_" + bucket.pixelScaleFactor + "p.png') " + halfPSF + " " + halfPSF + ",auto";
	app.renderer.plugins.interaction.cursorStyles.red		= "url('cursors/cursor_red_" + bucket.pixelScaleFactor + "p.png') " + halfPSF + " " + halfPSF + ",auto";
	app.renderer.plugins.interaction.cursorStyles.green		= "url('cursors/cursor_green_" + bucket.pixelScaleFactor + "p.png') " + halfPSF + " " + halfPSF + ",auto";
	app.renderer.plugins.interaction.cursorStyles.blue		= "url('cursors/cursor_blue_" + bucket.pixelScaleFactor + "p.png') " + halfPSF + " " + halfPSF + ",auto";
}

setupApp();

loader
	.add([ // Add assets to import below:
		"assets/gameplay.json",
		"assets/particles.json",
		"TestLevel.png"
	])
	.on("progress", loadProgressHandler)
	.load(setup);

function loadProgressHandler(loader, resource) {
	console.log("Loading (" + loader.progress + "%): " + resource.url);
}
	
function setup() {
	console.log("Asset loading complete.");
	
	// More Aliases
	gameplayTex = resources["assets/gameplay.json"].textures;
	
	loadLevel("");
	
	app.ticker.add(delta => gameLoop(delta));
}

function loadLevel(levelData) {
	/*let sprite1 = new Sprite(
		gameplayTex["player_body.png"]
	);

	app.stage.addChild(sprite1);
	sprite1.anchor.set(0.5, 0.5);
	sprite1.scale.set(0.25, 0.25);
	sprite1.position.set(272, 272);

	let sprite2 = new Sprite(
		gameplayTex["player_weapon.png"]
	);

	app.stage.addChild(sprite2);
	sprite2.tint = 0xff0000;
	sprite2.anchor.set(0.5, 0.5);
	sprite2.scale.set(0.25, 0.25);
	sprite2.position.set(272, 272);*/
	
	Gameplay = __webpack_require__(5);
	const IH = __webpack_require__(11);
	
	IH.setup(app.view);
	
	GP = new Gameplay(world, app, IH, {
		autoReload: true,
		autoSlowAim: true,
		
		pixelOffset:		new PIXI.Point(bucket.xOffset, bucket.yOffset),
		
		pixelScaleFactor:	bucket.pixelScaleFactor,	// 1 game unit (tile / GU) translated to PIXI units (pixels).
		meterScaleFactor:	1,							// 1 game unit (tile / GU) translated to 1 box2D units (meters).
		levelSize:			Vec2(34, 34),				// In GU. Note, origin is in bottom left.
		pixelOrigin:		Vec2(0, 34),				// In GU. PIXI's origin is in the top left of the screen, this is the location of that point in gameplay space.
		meterOrigin:		Vec2(0, 0)					// In GU. box2D's origin is in the bottom left of the level, this is the location of that point in gameplay space.
	});
	
	GP.loadLevel(resources["TestLevel.png"].texture);
	
	/*for (let i = 0; i < 34; i++) {
		let walli = GP.makeObject('wall', 'wall_base_' + i, Vec2(i + 0.5, 0.5), 0);
	}
	
	for (let i = 0; i < 34; i++) {
		let walli = GP.makeObject('wall', 'wall_top_' + i, Vec2(i + 0.5, 33.5), 0);
	}
	
	for (let i = 1; i < 33; i++) {
		let walli = GP.makeObject('wall', 'wall_left_' + i, Vec2(0.5, i + 0.5), 0);
	}
	
	for (let i = 1; i < 33; i++) {
		let walli = GP.makeObject('wall', 'wall_right_' + i, Vec2(33.5, i + 0.5), 0);
	}
	
	let wall1 = GP.makeObject('wall', 'wall01', Vec2(6.5, 9.5), 0);
	//player1 = GP.makeObject('player', 'player01', Vec2(0.5, 7.5), 0);
	
	let wall2 = GP.makeObject('wall', 'wall02', Vec2(1.5, 8.5), 0);
	let wall3 = GP.makeObject('wall', 'wall03', Vec2(2.5, 8.5), 0);
	let wall4 = GP.makeObject('wall', 'wall04', Vec2(3.5, 8.5), 0);*/
	let player = GP.makeObject('player', 'player02', Vec2(18.5, 21.5), 0, {
		hasJumpField: true,
		hasPullField: true,
		//canSlowTime: true, Don't have enough bits for this. Assume always true.
		
		hasShotgun: true,
		shotgunStartsWithAmmo: true,
		hasLauncher: true,
		launcherStartsWithAmmo: true,
		hasTesla: true,
		teslaStartsWithAmmo: true,
		
		startingAmmo: 6	// 3 bits, 0-7. In-game-max of 6?
		});
	/*//player3 = GP.makeObject('player', 'player03', Vec2(3, 11.5), 0);
	
	let wall5 = GP.makeObject('wall', 'wall05', Vec2(4.5, 8.75), utils.PI/6);
	//player4 = GP.makeObject('player', 'player04', Vec2(3.5, 11.5), 0);
	
	let wall6 = GP.makeObject('wall', 'wall06', Vec2(5.5, 8.75), -utils.PI/6);
	
	//let test = GP.makeObject('test', 'test', Vec2(17, 17), 0);
	//wall1.foo().bar();
	//player1.bar().baz();*/
	
	/*for (let i = 0; i < 10; i++) {
		let pos = Vec2((Math.random() * 31) + 1.5, (Math.random() * 31) + 1.5);
		let test = GP.makeObject('test', 'test_' + i, pos, 0, {maxHP: (Math.random() * 80) + 20});
	}*/
	
}

function gameLoop(delta) {
	let deltaMS = app.ticker.deltaMS;	
	GP.update(deltaMS);
}

/***/ }),
/* 4 */
/***/ (function(module, exports) {

//	***
//	utils.js start
//	***

utils = {};

utils.PI =	3.1415926535897932384626433832795028841971693993751058209749445923078164062;
utils.TAU =	6.2831853071795864769252867665590057683943387987502116419498891846156328125;

utils.getSpriteScale = (GP, originalPixelSize, desiredGUSize) => (GP.settings.pixelScaleFactor * desiredGUSize / originalPixelSize);

utils.rotateToPoint = (mxOrM, myOrP, px, py) => {  
	// M is dest (look-at)
	// P is start (look-from)

	// Code adapted from 'http://proclive.io/shooting-tutorial/'. Many thanks!

	let dist_Y, dist_X;
	
	if ((mxOrM.x != null) && (mxOrM.y != null) && (myOrP.x != null) && (myOrP.y != null)) {
		// Two points.
		dist_Y = mxOrM.y - myOrP.y;
		dist_X = mxOrM.x - myOrP.x;
	}
	else {
		// Four vals
		dist_Y = myOrP - py;
		dist_X = mxOrM - px;
	}

	let angle = Math.atan2(dist_Y,dist_X);
	return angle;
}

utils.linearColourInterpolation = function(startColour, endColour, factor){
	let start	= (startColour instanceof this.Colour)	? startColour	: new this.Colour(startColour);
	let end 	= (endColour instanceof this.Colour)	? endColour		: new this.Colour(endColour);
	let out		= new this.Colour();
	
	out.r = Math.round( ((end.r - start.r) * factor) + start.r );
	out.g = Math.round( ((end.g - start.g) * factor) + start.g );
	out.b = Math.round( ((end.b - start.b) * factor) + start.b );
	
	return out.asRGBNum();
}

utils.Colour = class {
	constructor(RGBnum) {
		if (RGBnum == null) {
			this.r = 0;
			this.g = 0;
			this.b = 0;
		}
		else {
			let r0 = (RGBnum & 0xff0000);
			this.r = r0 >>> 16;
			
			let g0 = (RGBnum & 0x00ff00);
			this.g = g0 >>> 8;
			
			this.b = (RGBnum & 0x0000ff);
		}
	}
	
	asRGBNum() {
		let r0 = this.r << 16;
		let g0 = this.g << 8;
		let b0 = this.b;
		
		return (r0 | g0 | b0);
	}
}

utils.bearingDelta = (ar, br) => {
	// from https://rosettacode.org/wiki/Angle_difference_between_two_bearings#JavaScript
	const [ax, ay] = [Math.sin(ar), Math.cos(ar)],
		[bx, by] = [Math.sin(br), Math.cos(br)],

	// Cross-product > 0 ?
	sign = ((ay * bx) - (by * ax)) > 0 ? +1 : -1;

	// Sign * dot-product
	return sign * Math.acos((ax * bx) + (ay * by));
};

utils.setCursorIcon = (GP, colourName) => {
	//	Stupid but necessary workaround. Cursor gets reset to default constantly, by everything (wtf pixi?),
	//	but doesn't detect changes in the default.
	//	So you have to change the cursor mode AND the default, so that it'll update default properly.
	
	if (colourName == null) { colourName = "white"; }
	let halfPSF = GP.settings.pixelScaleFactor / 2;
	GP.app.renderer.plugins.interaction.cursorStyles.default = "url('cursors/cursor_" + colourName + "_" + GP.settings.pixelScaleFactor + "p.png') " + halfPSF + " " + halfPSF + ",auto";
	
	GP.app.renderer.plugins.interaction.setCursorMode(colourName);
}

module.exports = utils;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

//	***
//	gameplay.js start
//	***

//const planck = require('../../node_modules/planck-js/dist/planck');
//const PIXI = require('../../node_modules/pixi.js/dist/pixi');
const uuid = __webpack_require__(6);
const mix = __webpack_require__(9);
const prefabs = __webpack_require__(10);
const visuals = __webpack_require__(2);

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
	
	world.on('pre-solve', (contact) => {
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
		
		if (!isGOA && !isGOB) {
			
		}
		else {
			// proj_key
			let aProjK = typeA === 'proj_key';
			let bProjK = typeB === 'proj_key';
			if (aProjK || bProjK) {
				let projK = (aProjK) ? goA : goB,
					other = (aProjK) ? goB : goA;
				
				if (projK.target === other) {
					projK.destroy(false);
					other.destroy(false);
				}
				else { contact.setEnabled(false); }
			}
		}
	});
	
	world.on('begin-contact', (contact) => {
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
		
		if (!isGOA && !isGOB) {
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
	
	world.on('post-solve', (contact, impulse) => {
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

		if (!isGOA && !isGOB) {
			// Probably nothing?
		}
		else {
			
			// door_key
			let aDoorK = typeA === 'door_key';
			let bDoorK = typeB === 'door_key';
			let aProjS = typeA === 'proj_shotgun';
			let bProjS = typeB === 'proj_shotgun';
			if (aDoorK && !bProjS && Math.abs(totalNormalImpulse) > 50) { goA._deathTrigger = true; }
			if (bDoorK && !aProjS && Math.abs(totalNormalImpulse) > 50) { goB._deathTrigger = true; }
			
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
						this.makeObject(type, null, Vec2(i + 0.5, (34 - j) - 0.5), null, null, pixels[offsetIndex], pixels[offsetIndex + 1]);
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
			(!this._accelerated ||
			!this._decelerated ||
			!killed);
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
	
	if (areStatic === false) {
		this.dynamicObjects.forEach((element) => {
			if (element.type === type) { retObjs.push(element); }
		})
	}
	
	if (areStatic === true) {
		this.staticObjects.forEach((element) => {
			if (element.type === type) { retObjs.push(element); }
		})
	}
	
	return retObjs;
}

Gameplay.prototype.getObjectsOfName = function(name, areStatic) {
	// areStatic is optional. If true, will only check statics, if false dynamics, if undef the both.
	retObjs = [];
	
	if (areStatic === false) {
		this.dynamicObjects.forEach((element) => {
			if (element.name === name) { retObjs.push(element); }
		})
	}
	
	if (areStatic === true) {
		this.staticObjects.forEach((element) => {
			if (element.name === name) { retObjs.push(element); }
		})
	}
	
	return retObjs;
}

Gameplay.prototype.getObjectsWithTag = function(tag, areStatic) {
	// areStatic is optional. If true, will only check statics, if false dynamics, if undef the both.
	retObjs = [];
	
	if (areStatic === false) {
		this.dynamicObjects.forEach((element) => {
			if (element.hasTag(tag)) { retObjs.push(element); }
		})
	}
	
	if (areStatic === true) {
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
	
	// Pre-update. I thought I'd end up using this way more than I have.
	
	this.dynamicObjects.forEach((element) => {
		element.updateFieldLogic(deltaS);
		if (element.preupdate) { element.preupdate(deltaMS); }
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





































/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var v1 = __webpack_require__(7);
var v4 = __webpack_require__(8);

var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;

module.exports = uuid;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var rng = __webpack_require__(0);
var bytesToUuid = __webpack_require__(1);

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

var _nodeId;
var _clockseq;

// Previous uuid creation time
var _lastMSecs = 0;
var _lastNSecs = 0;

// See https://github.com/broofa/node-uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189
  if (node == null || clockseq == null) {
    var seedBytes = rng();
    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [
        seedBytes[0] | 0x01,
        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
      ];
    }
    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  }

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : bytesToUuid(b);
}

module.exports = v1;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var rng = __webpack_require__(0);
var bytesToUuid = __webpack_require__(1);

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;


/***/ }),
/* 9 */
/***/ (function(module, exports) {

//	***
//	mixinbuilder.js start
//	***

// Code courtesy of http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/

let mix = (superclass) => new MixinBuilder(superclass);

class MixinBuilder {
	constructor(superclass) {
		this.superclass = superclass;
	}

	with(...mixins) { 
		return mixins.reduce((c, mixin) => mixin(c), this.superclass);
	}
	
	witheach(mixins) {
		return mixins.reduce((c, mixin) => mixin(c), this.superclass);
	}
}

module.exports = mix;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

//	***
//	prefabs.js start
//	***

let Sprite = PIXI.Sprite,
	Vec2 = planck.Vec2,
	gameplayTex = PIXI.Loader.shared.resources["assets/gameplay.json"].textures,
	particleTex = PIXI.Loader.shared.resources["assets/particles.json"].textures;

const visuals = __webpack_require__(2);
	
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
		
		if (super.setup) super.setup(options);
	}
	
	damage(lostHP) {
		this._timeSinceLastDamage = 0;
		if (this.maxHP > 0) {
			this.HP -= lostHP;
			if (this.HP < 0) {
				this.HP = 0;
				this._deathTrigger = true;
			}
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
				this.HP += 20 * deltaS; // That's right! It regens 20HP a second! Yikes!
				if (this.HP > this.maxHP) { this.HP = this.maxHP; }
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
		
		this.colour = (options.colour != null) ? options.colour : 'white';
		
		if (this.colour === 'red') { this.tint = 0xff0000; }
		else if (this.colour === 'green') { this.tint = 0x00ff00; }
		else if (this.colour === 'blue') { this.tint = 0x0000ff; }
		else {
			this.colour = 'white';
			this.tint = 0xffffff;
		}
		
		//this._trailColour = this.tint;
		
		this.keyCount = (options.keyCount != null) ? options.keyCount : 0;
		this._deathTrigger = false;
		
		this.sprites.children[0].tint = this.tint;
	}
	
	update(deltaMS) {
		if (super.update) super.update(deltaMS);
	}
	
	destroy(immediate) {
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
		let angle = 0,
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
		}
		
		super.destroy(immediate);
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
		this.sprites.jumpField = this.sprites.children[1];
		this.sprites.pullField = this.sprites.children[2];
		
		// Field checks
		this._field_kill_applicable = true;
		
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
		}
		
		// Torque
		let angVel = this.body.getAngularVelocity();
		if (left && !right && angVel < (6 * utils.PI * this.fieldImpFac)) { this.body.applyTorque(2 * deltaMS * this.fieldImpFac, true); }
		if (right && !left && angVel > (-6 * utils.PI * this.fieldImpFac)) { this.body.applyTorque(-2 * deltaMS * this.fieldImpFac, true); }
		if (left && right) {
			// brake
			if (angVel > 0) {
				let factor = 2;
				if (angVel < 2) { factor = angVel; }
				this.body.applyTorque(-factor * deltaMS * this.fieldImpFac, true);
			}
			
			if (angVel < 0) {
				let factor = 2;
				if (angVel > -2) { factor = -angVel; }
				this.body.applyTorque(factor * deltaMS * this.fieldImpFac, true);
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
		if (this.launcher) this.shotgun.destroy(true);
		if (this.tesla) this.shotgun.destroy(true);
		
		// TODO: inform gameplay?
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
			if (fixture.m_filterCategoryBits & 0xff15) {
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

prefabs.mixins['proj_key'] = (superclass) => class extends superclass {
	setup(options) {
		this.colour = options.colour;
		this.tint = options.tint;
		this.target = options.target;
		
		this.sprites.children[0].tint = this.tint;
		
		this._trailThickness = 0.25;
		this._trailLifespan	= 0.5;
		this._trailColour = this.tint;
		this._trailAlpha = 0.5;
		
		let facing = Vec2(Math.cos(this.rotation) * 25, Math.sin(this.rotation) * 25);
		this.body.applyLinearImpulse(facing, this.position, true);
		
		this.visual = new visuals.proj_key(this);
		
		if (super.setup) super.setup(options);
	}
	
	update(deltaMS) {
		let deltaS = deltaMS * 0.001,
			myPos = this.position,
			myRot = this.rotation,
			destPos = this.target.position,
			relative = destPos.clone().sub(myPos),
			relAng = Math.atan2(relative.y, relative.x),
			deltaAng = utils.bearingDelta(myRot, relAng);
		
		/*let torque,
			angVel = this.body.getAngularVelocity();
		
		if (angVel > (utils.PI / 4)) { torque = -(utils.PI / 8) * deltaS; }
		else if (angVel < -(utils.PI / 4)) { torque = (utils.PI / 8) * deltaS; }
		else { torque = (deltaAng > 0) ? deltaS * 5 : deltaS * -5; }
				
		this.body.applyTorque(torque, true);*/
		
		let linVel = this.body.getLinearVelocity().clone();
		linVel.normalize();
		linVel.mul(deltaS * -10);
			/*linVelAng = Math.atan2(linVel.y, linVel.x),
			deltaLinVelAng = utils.bearingDelta(relAng, linVelAng);*/
			
		/*let factor = ((Math.abs(deltaLinVelAng) / utils.PI) * 0.5) + 0.5;
		factor *= deltaS * 5;*/
			
		let facing = relative.clone();
		facing.normalize();
		facing.mul(deltaS * 20).add(linVel);
		this.body.applyLinearImpulse(facing, myPos, true);
		
		if (super.update) super.update(deltaMS);
	}
	
	destroy(immediate) {
		this.visual.stopEmitting();
		
		super.destroy(immediate);
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
 *	64	:	0x0040	:	enviro fields
 *	128	:	0x0080	:	enemy sensors
 
 *	256	:	0x0100	:	interactables
 *	512	:	0x0200	:	doors
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
			
			density: 5.0,
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
	tags: ['static', 'gameplay', 'door', 'interactables', 'takes_damage'],
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
			shape: planck.Circle(0.5),
			
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

//	***
//	Define player and weapon prefabs.
//	***

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
			filterMaskBits: 0xff6c
		}
	],
	mixins: [ 'leavestrail', 'player' ]
};

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
			filterMaskBits: 0xff2e
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
			filterMaskBits: 0xff2e
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

prefabs.proj_key = {
	name: "proj_key",
	tags: ['dynamic', 'door' ],
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
			
			filterCategoryBits: 0x0010,
			filterMaskBits: 0x0200
		}                   
	],
	mixins: [ 'leavestrail', 'proj_key' ]
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
	3:	'c_ramp_concave',
	4:	'c_ramp_convex',
	5:	'door_wall',
	6:	'field_kill',
	7:	'field_acc',
	8:	'field_dec',
	
	//	Gameplay
	10:	'player_spawn',
	11:	'player_goal',
	12:	'enemy_walker',
	13:	'enemy_flier',
	14:	'enemy_charger',
	15:	'enemy_walker_spawner',
	16:	'door_key',
	17:	'pull_bobble',
	
	//	Powerups
	20:	'player_unlock',
	21:	'player_ammo',
	22:	'player_powerup'
}

module.exports = prefabs;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

//	***
//	inputhandler.js start
//	***

const makeKey = __webpack_require__(12);

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

/***/ }),
/* 12 */
/***/ (function(module, exports) {

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

/***/ })
/******/ ]);