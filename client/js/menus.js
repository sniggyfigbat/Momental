let Sprite = PIXI.Sprite,
	Vec2 = planck.Vec2,
	gameplayTex =	PIXI.Loader.shared.resources["assets/gameplay.json"].textures,
	particleTex =	PIXI.Loader.shared.resources["assets/particles.json"].textures,
	menuTex =		PIXI.Loader.shared.resources["assets/menu.json"].textures,
	resources =		PIXI.Loader.shared.resources;

let menus = {};

let defaultTextStyle = class {
	// I'm literally just using this as a easy way of making PIXI.TextStyle standins.
	constructor(pixelScaleFactor, sizePreset) {
		this.align = 'left';
		this.fontFamily = 'Moderna';
		
		let sizeFac = pixelScaleFactor / 16;
		if (sizePreset == 'small') { this.fontSize = sizeFac * 16; }
		if (sizePreset == 'large') { this.fontSize = sizeFac * 32; }
		else { /* sizePreset == 'medium' */ this.fontSize = sizeFac * 24; }
		
		// Anything else?
	}
}

let fadeData = class {
	constructor(sprite, fadeInTimeMS, fadeOutTimeMS) {
		this.sprite = sprite;
		this.active = true;
		this._triggered = false;
		this.counter = 0;
		this.fadeInTimeMS = fadeInTimeMS || 500;
		this.fadeOutTimeMS = fadeOutTimeMS || this.fadeInTimeMS;
	}
	
	get triggered() { return this._triggered; }
	
	set triggered(newState) {
		let flag = newState != null ? newState : true;
		if (flag != this._triggered) {
			this._triggered = flag;
			
			if (this.fadeInTimeMS != this.fadeOutTimeMS) {
				if (flag) { this.counter = (this.counter / this.fadeOutTimeMS) * this.fadeInTimeMS; }
				else { this.counter = (this.counter / this.fadeInTimeMS) * this.fadeOutTimeMS; }
			}
		}
	}
	
	updateFade(deltaMS) {
		if (this.active) {
			if (this._triggered && this.counter < this.fadeInTimeMS) {
				this.counter += deltaMS;
				if (this.counter >= this.fadeInTimeMS) { this.counter = this.fadeInTimeMS; }
				this.sprite.alpha = (this.counter / this.fadeInTimeMS);
			}
			else if (!this._triggered && this.counter > 0) {
				this.counter -= deltaMS;
				if (this.counter <= 0) { this.counter = 0; }
				this.sprite.alpha = (this.counter / this.fadeOutTimeMS);
			}
		}
	}
}

let fadeTintData = class {
	constructor(sprite, fadeInTimeMS, fadeInColourHex, fadeOutTimeMS, fadeOutColourHex) {
		this.sprite = sprite;
		this.active = true;
		this._triggered = false;
		this.counter = 0;
		
		this.fadeInTimeMS = fadeInTimeMS || 500;
		this.fadeInColourHex = fadeInColourHex || 0x000000;
		
		this.fadeOutTimeMS = fadeOutTimeMS || this.fadeInTimeMS;
		this.fadeOutColourHex = fadeOutColourHex || 0xffffff;
	}
	
	get triggered() { return this._triggered; }
	
	set triggered(newState) {
		let flag = newState != null ? newState : true;
		if (flag != this._triggered) {
			this._triggered = flag;
			
			if (this.fadeInTimeMS != this.fadeOutTimeMS) {
				if (flag) { this.counter = (this.counter / this.fadeOutTimeMS) * this.fadeInTimeMS; }
				else { this.counter = (this.counter / this.fadeInTimeMS) * this.fadeOutTimeMS; }
			}
		}
	}
	
	updateFade(deltaMS) {
		if (this.active) {
			if (this._triggered && this.counter < this.fadeInTimeMS) {
				this.counter += deltaMS;
				if (this.counter >= this.fadeInTimeMS) { this.counter = this.fadeInTimeMS; }
				
				let prop = (this.counter / this.fadeInTimeMS);
				let tint = utils.linearColourInterpolation(this.fadeOutColourHex, this.fadeInColourHex, prop);
				
				this.sprite.tint = tint;
			}
			else if (!this._triggered && this.counter > 0) {
				this.counter -= deltaMS;
				if (this.counter <= 0) { this.counter = 0; }
				
				let prop = (this.counter / this.fadeOutTimeMS);
				let tint = utils.linearColourInterpolation(this.fadeOutColourHex, this.fadeInColourHex, prop);
				
				this.sprite.tint = tint;
			}
		}
	}
}

menus.make_main = class {
	constructor (app, settings) {
		this.stage = new PIXI.Container();
		this.stage.sortableChildren = true;
		app.stage.addChildAt(this.stage, 0);
		this.stage.position.set(settings.pixelOffset.x, settings.pixelOffset.y);
		
		this.settings = settings;
		this._behaviour = "";
		this._behaviourTrigger = false;
		
		// Blackout visual
		let totalSize = this.settings.levelSize.clone().mul(this.settings.pixelScaleFactor);
		this._darkTimer = 500;
		this._blackIn = false;
		this.darkOverlay = new PIXI.Graphics;
		this.darkOverlay.lineStyle(0, 0, 0);
		this.darkOverlay.beginFill(0x000000, 1);
		this.darkOverlay.drawRect(0, 0, totalSize.x, totalSize.y);
		this.darkOverlay.visible = true;
		this.darkOverlay.zIndex = 101;
		this.stage.addChild(this.darkOverlay);
		
		// Visuals
		this.sprites = {};
		this.sprites.fadeables = [];
		
		let sprSF = (settings.pixelScaleFactor / 64),
			newSpr; // Assume all menu sprites done at 64 pixel psf.
		this.sprites.lightups = new PIXI.Container();
		this.sprites.lightups.zIndex = 5;
		this.stage.addChild(this.sprites.lightups);
		
		// decor
		this.sprites.decor = new Sprite(resources['assets/main_decor.png'].texture);
		//this.sprites.decor.tint = this.colour;
		//this.sprites.decor.anchor.set(0.0, 0.0);
		this.sprites.decor.scale.set(sprSF, sprSF);
		this.sprites.decor.zIndex = 10;
		//this.sprites.decor.position.set(sprSF * 1088, sprSF * 1088);
		this.stage.addChild(this.sprites.decor);
		
		// light-up bits
		this._lightupsDeltaS = 0;
		
		newSpr = new Sprite(menuTex['main_lightup1.png']);
		//newSpr.tint = this.colour;
		//newSpr.anchor.set(0.0, 0.0);
		newSpr.scale.set(sprSF, sprSF);
		newSpr.position.set(sprSF * 64, sprSF * 384);
		newSpr.tint = 0x8181ff;
		newSpr.alpha = 0;
		newSpr._sinFreqMul = 1;
		
		this.sprites.lightups.addChild(newSpr);
		this.sprites.lightup1 = newSpr;		

		newSpr = new Sprite(menuTex['main_lightup2.png']);
		//newSpr.tint = this.colour;
		//newSpr.anchor.set(0.0, 0.0);
		newSpr.scale.set(sprSF, sprSF);
		newSpr.position.set(sprSF * 2016, sprSF * 1088);
		newSpr.tint = 0xff8181;
		newSpr.alpha = 0;
		newSpr._sinFreqMul = 1.25;
		
		this.sprites.lightups.addChild(newSpr);
		this.sprites.lightup1 = newSpr;
		
		newSpr = new Sprite(menuTex['main_lightup3.png']);
		//newSpr.tint = this.colour;
		//newSpr.anchor.set(0.0, 0.0);
		newSpr.scale.set(sprSF, sprSF);
		newSpr.position.set(sprSF * 64, sprSF * 64);
		newSpr.tint = 0x81ff81;
		newSpr.alpha = 0;
		newSpr._sinFreqMul = 1.75;
		
		this.sprites.lightups.addChild(newSpr);
		this.sprites.lightup1 = newSpr;
		
		// Title
		this.sprites.title = new Sprite(menuTex['logo_medium.png']);
		//this.sprites.title.tint = this.colour;
		this.sprites.title.anchor.set(0.5, 0.5);
		this.sprites.title.scale.set(sprSF, sprSF);
		this.sprites.title.zIndex = 15;
		this.sprites.title.position.set(sprSF * 1088, sprSF * 576);
		this.stage.addChild(this.sprites.title);
		
		// buttons
		let buttonHitWidth = 640 * sprSF,
			buttonHitHeight = 128 * sprSF,
			buttonTextStye = new defaultTextStyle(settings.pixelScaleFactor, 'large');
		
		// Tutorial Button
		this.sprites.but_tut = new PIXI.Container();
		this.sprites.but_tut.zIndex = 16;
		this.stage.addChild(this.sprites.but_tut);
		this.sprites.but_tut.position.set(sprSF * 1088, sprSF * 928);
		
		this.sprites.but_tut.interactive = true;
		this.sprites.but_tut.hitArea = new PIXI.Rectangle(
			-0.5 * buttonHitWidth,
			-0.5 * buttonHitHeight,
			buttonHitWidth,
			buttonHitHeight
		);
		
		newSpr = new Sprite(menuTex['button_dot.png']);
		newSpr.tint = 0xffffff;
		newSpr.anchor.set(0.5, 0.5);
		newSpr.scale.set(sprSF, sprSF);
		newSpr.position.set(sprSF * -256, 0);
		
		newSpr._fadeTintData = new fadeTintData(newSpr, 500, 0x8181ff);
		
		this.sprites.but_tut.addChild(newSpr);
		this.sprites.but_tut.dot = newSpr;
		this.sprites.fadeables.push(newSpr);
		
		newSpr = new PIXI.Text('tutorial', buttonTextStye);
		newSpr.position.set(sprSF * -128, sprSF * -96);
		
		this.sprites.but_tut.addChild(newSpr);
		this.sprites.but_tut.textSpr = newSpr;
		
		this.sprites.but_tut.mouseover = (mouseData) => { this.sprites.but_tut.dot._fadeTintData.triggered = true; }
		this.sprites.but_tut.mouseout = (mouseData) => { this.sprites.but_tut.dot._fadeTintData.triggered = false; }
		
		// Play Button
		this.sprites.but_play = new PIXI.Container();
		this.sprites.but_play.zIndex = 17;
		this.stage.addChild(this.sprites.but_play);
		this.sprites.but_play.position.set(sprSF * 1088, sprSF * 1184);
		
		this.sprites.but_play.interactive = true;
		this.sprites.but_play.hitArea = new PIXI.Rectangle(
			-0.5 * buttonHitWidth,
			-0.5 * buttonHitHeight,
			buttonHitWidth,
			buttonHitHeight
		);
		
		newSpr = new Sprite(menuTex['button_dot.png']);
		newSpr.tint = 0xffffff;
		newSpr.anchor.set(0.5, 0.5);
		newSpr.scale.set(sprSF, sprSF);
		newSpr.position.set(sprSF * -256, 0);
		
		newSpr._fadeTintData = new fadeTintData(newSpr, 500, 0x81ff81);
		
		this.sprites.but_play.addChild(newSpr);
		this.sprites.but_play.dot = newSpr;
		this.sprites.fadeables.push(newSpr);
		
		newSpr = new PIXI.Text('play', buttonTextStye);
		newSpr.position.set(sprSF * -128, sprSF * -96);
		
		this.sprites.but_play.addChild(newSpr);
		this.sprites.but_play.textSpr = newSpr;
		
		this.sprites.but_play.mouseover = (mouseData) => { this.sprites.but_play.dot._fadeTintData.triggered = true; }
		this.sprites.but_play.mouseout = (mouseData) => { this.sprites.but_play.dot._fadeTintData.triggered = false; }
		
		// Options Button
		this.sprites.but_opt = new PIXI.Container();
		this.sprites.but_opt.zIndex = 16;
		this.stage.addChild(this.sprites.but_opt);
		this.sprites.but_opt.position.set(sprSF * 1088, sprSF * 1632);
		
		this.sprites.but_opt.interactive = true;
		this.sprites.but_opt.hitArea = new PIXI.Rectangle(
			-0.5 * buttonHitWidth,
			-0.5 * buttonHitHeight,
			buttonHitWidth,
			buttonHitHeight
		);
		
		newSpr = new Sprite(menuTex['button_dot.png']);
		newSpr.tint = 0xffffff;
		newSpr.anchor.set(0.5, 0.5);
		newSpr.scale.set(sprSF, sprSF);
		newSpr.position.set(sprSF * -256, 0);
		
		newSpr._fadeTintData = new fadeTintData(newSpr, 500, 0xff8181);
		
		this.sprites.but_opt.addChild(newSpr);
		this.sprites.but_opt.dot = newSpr;
		this.sprites.fadeables.push(newSpr);
		
		newSpr = new PIXI.Text('options', buttonTextStye);
		newSpr.position.set(sprSF * -128, sprSF * -96);
		
		this.sprites.but_opt.addChild(newSpr);
		this.sprites.but_opt.textSpr = newSpr;
		
		this.sprites.but_opt.mouseover = (mouseData) => { this.sprites.but_opt.dot._fadeTintData.triggered = true; }
		this.sprites.but_opt.mouseout = (mouseData) => { this.sprites.but_opt.dot._fadeTintData.triggered = false; }
	}
	
	update(deltaMS) {
		let deltaS = deltaMS * 0.001;
		
		if (!this._blackIn &&  this._darkTimer > 0) {
			this._darkTimer -= deltaMS;
			
			this.darkOverlay.visible = true;
			this.darkOverlay.alpha = this._darkTimer / 500;
			
			if (this._darkTimer <= 0) {
				this._darkTimer = 0;
				this.darkOverlay.visible = false;
			}
		}
		else if (this._blackIn &&  this._darkTimer < 500) {
			this._darkTimer += deltaMS;
			
			this.darkOverlay.visible = true;
			this.darkOverlay.alpha = this._darkTimer / 500;
			
			if (this._darkTimer >= 500) {
				this._darkTimer = 500;
				// Phased out of the menu. Trigger the set behaviour.
				this._behaviourTrigger = true;
			}
		}
		
		if (this._behaviourTrigger && this._behaviour != "") {
			this[this._behaviour]();
		}
		
		this._lightupsDeltaS += deltaS;
		this.sprites.lightups.children.forEach((element) => {
			// Actually uses neg cos. Not sin. Oops.
			let temp = -Math.cos(this._lightupsDeltaS / element._sinFreqMul);
			temp = (temp + 1) * 0.5;
			element.alpha = temp;
		});
		if (this._lightupsDeltaS > 20000) { this._lightupsDeltaS = 0; } // Always catch edge cases, my dude.
		
		// Button fading
		this.sprites.fadeables.forEach((element) => {
			if (element._fadeData) { element._fadeData.updateFade(deltaMS); }
			if (element._fadeTintData) { element._fadeTintData.updateFade(deltaMS); }
		});
	}
}

module.exports = menus;