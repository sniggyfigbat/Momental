//const planck = require('planck-js');
//const PIXI = require('pixi.js');
//const uuid = require('uuid');
//const fs = require('fs');
//const PNG = require('pngjs');

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
		this.sprite.zIndex = 20;
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
		particleTex['square.png'],
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

/*visuals.proj_key = class {
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
}*/

visuals.pull_bobble_tether = class {
	constructor(bobble) {
		this.alpha = 0.5;
		this.thickness = bobble.GP.relGU2P(0.125);
		this.bobble = bobble;
		
		// Admin
		this._lifetimed = false;
		this._lifetimer = -1;
		this._markedForDeath = false;
		bobble.GP.visuals.push(this);
		
		// Setup
		this.sprite = new PIXI.Graphics();
		this.sprite.zIndex = 9;
		bobble.GP.stage.addChild(this.sprite);
		
		// Toggles
		this._drewLastTick = false;
	}
	
	updatePosition(bobblePos, tetherPos) {
		if (this._drewLastTick) { this.sprite.clear(); }
		
		if (bobblePos.x == tetherPos.x && bobblePos.y == tetherPos.y) {
			// Don't bother drawing, bobble is exactly on top of tether.
			this._drewLastTick = false;
			return;
		}
		
		this._drewLastTick = true;
		
		// Draw cool purple crackly line
		let GP = this.bobble.GP;
		let relative = tetherPos.clone().sub(bobblePos),
			dist = relative.length(),
			relN = relative.clone();
		relN.normalize();
			
		// Gen Points and draw beam
		let pointCount = Math.ceil(dist),
			subSegment = dist / pointCount;
			
		this.sprite.lineStyle(this.thickness, 0xd7afff, this.alpha, 0.5);
		this.sprite.beginFill(0xd7afff, 0);
		
		let startP = GP.absGU2P(bobblePos);
		this.sprite.moveTo(startP.x, startP.y); // Why the flying fuck does PIXI not let me input points into half its damn calls?
		for (let i = 1; i < pointCount; i++) {
			let offset = Vec2(-relN.y, relN.x),
				offsetFactor = (Math.random() - 0.5) * 0.5;
			offset.mul(offsetFactor);
			let temp = relN.clone().mul(i * subSegment).add(offset);
			temp = bobblePos.clone().add(temp);
			temp = GP.absGU2P(temp);
			this.sprite.lineTo(temp.x, temp.y);
		}
		let endP = GP.absGU2P(tetherPos);
		this.sprite.lineTo(endP.x, endP.y);
		this.sprite.endFill();
		
		// Put a nice diamond at the tether point.
		this.sprite.beginFill(0xd7afff, 1);
		this.sprite.drawCircle(endP.x, endP.y, this.thickness);
	}
	
	update(deltaS) {}
	
	destroy() {
		this.sprite.parent.removeChild(this.sprite);
		this.sprite.destroy({children:true, texture:false, baseTexture:false});
	}
}

visuals.proj_trigger = class {
	constructor(projectile) {
		this.parent = projectile;
		
		let posP = projectile.GP.absGU2P(projectile.position);
		
		// Why doesn't PIXI particles take normal hex values? We may never know...
		let colour = projectile.tintString;
		
		let scale = utils.getSpriteScale(projectile.GP, 128, .25),
			radius = projectile.GP.relGU2P(1);
		
		this.emitter = new PIXI.particles.Emitter(
			projectile.GP.particleStageLower,
			particleTex[projectile.particleName],
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
				frequency: 0.5,
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

visuals.proj_trigger_death = function(GP, posGU, tintString, particleName) {
	let posP = GP.absGU2P(posGU);
	let colour = tintString;
	
	let scale = utils.getSpriteScale(GP, 128, .25),
		speed = GP.relGU2P(0.5);
	
	let emitter = new PIXI.particles.Emitter(
		GP.particleStageUpper,
		particleTex[particleName],
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
			particlesPerWave: 8,
			emitterLifetime: 0.25,
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

visuals.powerup_death = function(GP, posGU, particleCount, tintString) {
	let posP = GP.absGU2P(posGU);
	let colour = tintString;
	
	let scale = utils.getSpriteScale(GP, 128, .5),
		speed = GP.relGU2P(2);
	
	let emitter = new PIXI.particles.Emitter(
		GP.particleStageUpper,
		particleTex['equilateral.png'],
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
			particlesPerWave: particleCount,
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

visuals.player_spawn_and_goal = function(GP, posGU, rotationOffset) {
	let posP = GP.absGU2P(posGU);
	let colour = 'ff81ff';
	let minRot = rotationOffset - 5,
		maxRot = rotationOffset + 5;
	
	let scale = utils.getSpriteScale(GP, 128, 3);
	
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
				minimumScaleMultiplier: 0.95
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
			startRotation: { min: minRot, max: maxRot },
			rotationSpeed: { min: -3, max: 3 },
			lifetime: { min: 3.5, max: 3.5 },
			frequency: 1.5,
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
				r: 0
			}
		}
	);
	emitter._lifetimed = false; // Marked as being auto-destroyable upon completion.
	emitter._lifetimer = -1; // emitterLifetime + lifetime.max + a bit.
	emitter._markedForDeath = false;
	GP.visuals.push(emitter);
	
	return emitter;
}

visuals.player_ascension = function(GP, posGU) {
	let posP = GP.absGU2P(posGU);
	let colour = 'ff81ff';
	
	let scale = utils.getSpriteScale(GP, 128, .5),
		startSpeed = GP.relGU2P(10),
		midSpeed = GP.relGU2P(0.5),
		endSpeed = GP.relGU2P(20);
	
	let emitter = new PIXI.particles.Emitter(
		GP.particleStageUpper,
		particleTex['equilateral.png'],
		{
			alpha: {
				list: [
					{ value: 1, time: 0 },
					{ value: 1, time: 0.75 },
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
					{ value: startSpeed, time: 0 },
					{ value: midSpeed, time: 0.5 },
					{ value: endSpeed, time: 1 }
				],
				minimumSpeedMultiplier: 0.75,
				isStepped: false
			},
			startRotation: { min: 0, max: 360 },
			rotationSpeed: { min: -15, max: 15 },
			lifetime: { min: 2.5, max: 2.5 },
			frequency: 0.08,
			spawnChance: 10,
			particlesPerWave: 50,
			emitterLifetime: 0.25,
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
	emitter._lifetimer = 3; // emitterLifetime + lifetime.max + a bit.
	emitter._markedForDeath = false;
	GP.visuals.push(emitter);
}

visuals.player_death = function(GP, posGU) {
	let posP = GP.absGU2P(posGU);
	let red		= 'ff0000',
		green	= '00ff00',
		blue	= '0000ff';
	
	let scale = utils.getSpriteScale(GP, 128, .5),
		speed = GP.relGU2P(5),
		particleCount = 15;
	
	// Red
	let emitter = new PIXI.particles.Emitter(
		GP.particleStageUpper,
		particleTex['diamondfade.png'],
		{
			alpha: {
				list: [
					{ value: 1, time: 0 },
					{ value: 0.75, time: 0.7 },
					{ value: 0, time: 1 }
				],
				isStepped: false
			},
			scale: {
				list: [
					{ value: scale, time: 0 },
					{ value: scale, time: 1 }
				],
				minimumScaleMultiplier: 0.75
			},
			color: {
				list: [
					{ value: red, time: 0 },
					{ value: '000000', time: 0.5 },
					{ value: '000000', time: 1 }
				],
				isStepped: false
			},
			speed: {
				list: [
					{ value: speed, time: 0 },
					{ value: 0, time: 1 }
				],
				minimumSpeedMultiplier: 0.875,
				isStepped: false
			},
			startRotation: { min: 0, max: 360 },
			rotationSpeed: { min: 0, max: 0 },
			lifetime: { min: 0.75, max: 0.75 },
			frequency: 0.08,
			spawnChance: 10,
			particlesPerWave: particleCount,
			emitterLifetime: 0.25,
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
	emitter._lifetimer = 3; // emitterLifetime + lifetime.max + a bit.
	emitter._markedForDeath = false;
	GP.visuals.push(emitter);
	
	// Green
	emitter = new PIXI.particles.Emitter(
		GP.particleStageUpper,
		particleTex['diamondfade.png'],
		{
			alpha: {
				list: [
					{ value: 1, time: 0 },
					{ value: 0.75, time: 0.7 },
					{ value: 0, time: 1 }
				],
				isStepped: false
			},
			scale: {
				list: [
					{ value: scale, time: 0 },
					{ value: scale, time: 1 }
				],
				minimumScaleMultiplier: 0.75
			},
			color: {
				list: [
					{ value: green, time: 0 },
					{ value: '000000', time: 0.5 },
					{ value: '000000', time: 1 }
				],
				isStepped: false
			},
			speed: {
				list: [
					{ value: speed, time: 0 },
					{ value: 0, time: 1 }
				],
				minimumSpeedMultiplier: 0.875,
				isStepped: false
			},
			startRotation: { min: 0, max: 360 },
			rotationSpeed: { min: 0, max: 0 },
			lifetime: { min: 0.75, max: 0.75 },
			frequency: 0.08,
			spawnChance: 10,
			particlesPerWave: particleCount,
			emitterLifetime: 0.25,
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
	emitter._lifetimer = 3; // emitterLifetime + lifetime.max + a bit.
	emitter._markedForDeath = false;
	GP.visuals.push(emitter);
	
	// Blue
	emitter = new PIXI.particles.Emitter(
		GP.particleStageUpper,
		particleTex['diamondfade.png'],
		{
			alpha: {
				list: [
					{ value: 1, time: 0 },
					{ value: 0.75, time: 0.7 },
					{ value: 0, time: 1 }
				],
				isStepped: false
			},
			scale: {
				list: [
					{ value: scale, time: 0 },
					{ value: scale, time: 1 }
				],
				minimumScaleMultiplier: 0.75
			},
			color: {
				list: [
					{ value: blue, time: 0 },
					{ value: '000000', time: 0.5 },
					{ value: '000000', time: 1 }
				],
				isStepped: false
			},
			speed: {
				list: [
					{ value: speed, time: 0 },
					{ value: 0, time: 1 }
				],
				minimumSpeedMultiplier: 0.875,
				isStepped: false
			},
			startRotation: { min: 0, max: 360 },
			rotationSpeed: { min: 0, max: 0 },
			lifetime: { min: 0.75, max: 0.75 },
			frequency: 0.08,
			spawnChance: 10,
			particlesPerWave: particleCount,
			emitterLifetime: 0.25,
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
	emitter._lifetimer = 3; // emitterLifetime + lifetime.max + a bit.
	emitter._markedForDeath = false;
	GP.visuals.push(emitter);
}

visuals.enemy_death = function(GP, posGU, angleRad) {
	let posP = GP.absGU2P(posGU),
		angleDeg = -angleRad * 180 / utils.PI;
	
	let colour = 'ff0000'
	
	let scale = utils.getSpriteScale(GP, 128, .5),
		speed = GP.relGU2P(5),
		particleCount = 10;
	
	// splatter
	let emitter = new PIXI.particles.Emitter(
		GP.particleStageUpper,
		particleTex['diamondfade.png'],
		{
			alpha: {
				list: [
					{ value: 1, time: 0 },
					{ value: 0.75, time: 0.7 },
					{ value: 0, time: 1 }
				],
				isStepped: false
			},
			scale: {
				list: [
					{ value: scale, time: 0 },
					{ value: scale, time: 1 }
				],
				minimumScaleMultiplier: 0.75
			},
			color: {
				list: [
					{ value: colour, time: 0 },
					{ value: '000000', time: 0.5 },
					{ value: '000000', time: 1 }
				],
				isStepped: false
			},
			speed: {
				list: [
					{ value: speed, time: 0 },
					{ value: 0, time: 1 }
				],
				minimumSpeedMultiplier: 0.875,
				isStepped: false
			},
			startRotation: { min: angleDeg - 20, max: angleDeg + 20},
			rotationSpeed: { min: -30, max: 30 },
			lifetime: { min: 1.5, max: 1.5 },
			frequency: 0.08,
			spawnChance: 10,
			particlesPerWave: particleCount,
			emitterLifetime: 0.25,
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
	emitter._lifetimer = 3; // emitterLifetime + lifetime.max + a bit.
	emitter._markedForDeath = false;
	GP.visuals.push(emitter);
	
	// bang
	emitter = new PIXI.particles.Emitter(
		GP.particleStageUpper,
		particleTex['equilateral.png'],
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
				minimumScaleMultiplier: 0.75
			},
			color: {
				list: [
					{ value: colour, time: 0 },
					{ value: '000000', time: 0.5 },
					{ value: '000000', time: 1 }
				],
				isStepped: false
			},
			speed: {
				list: [
					{ value: speed/2, time: 0 },
					{ value: 0, time: 1 }
				],
				minimumSpeedMultiplier: 0.875,
				isStepped: false
			},
			startRotation: { min: 0, max: 360},
			rotationSpeed: { min: 0, max: 0 },
			lifetime: { min: 0.75, max: 0.75 },
			frequency: 0.08,
			spawnChance: 10,
			particlesPerWave: 5,
			emitterLifetime: 0.25,
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
	emitter._lifetimer = 3; // emitterLifetime + lifetime.max + a bit.
	emitter._markedForDeath = false;
	GP.visuals.push(emitter);
}

module.exports = visuals;