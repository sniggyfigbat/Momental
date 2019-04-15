let Sprite = PIXI.Sprite,
	Vec2 = planck.Vec2,
	gameplayTex =	PIXI.Loader.shared.resources["assets/gameplay.json"].textures,
	particleTex =	PIXI.Loader.shared.resources["assets/particles.json"].textures,
	menuTex =		PIXI.Loader.shared.resources["assets/menu.json"].textures,
	resources =		PIXI.Loader.shared.resources;

let menus = {};

let defaultTextStyle = class {
	// I'm literally just using this as a easy way of making PIXI.TextStyle standins.
	constructor(pixelScaleFactor, sizePreset, family) {
		this.align = 'left';
		this.fontFamily = family || 'Moderna';
		
		let sizeFac = pixelScaleFactor / 16;
		if (sizePreset == 'vsmall') { this.fontSize = sizeFac * 8; }
		else if (sizePreset == 'small') { this.fontSize = sizeFac * 16; }
		else if (sizePreset == 'large') { this.fontSize = sizeFac * 32; }
		else if (sizePreset == 'vlarge') { this.fontSize = sizeFac * 48; }
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
	
	set triggered(flag) {
		flag = flag !== false;
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
	
	set triggered(flag) {
		flag = flag !== false;
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

let radioController = class {
	constructor(titleString, parentPIXIContainer, position, pixelScaleFactor, optionCount, explaText) {
		this.titleString = titleString || 'default';
		this.optionCount = optionCount || 5;
		this.explaText = explaText || null;
		
		if (position == null) { position = new PIXI.Point(0, 0); }
		if (pixelScaleFactor == null) { pixelScaleFactor = 16; }
		
		let sprSF = (pixelScaleFactor / 64);
		let xOff, yOff;
		
		this.sprites = new PIXI.Container();
		this.sprites.position = position;
		this.sprites.zIndex = 15;
		parentPIXIContainer.addChild(this.sprites);
		
		this.options = [];
		this._selectedIndex = null;
		
		let step = 1 / (this.optionCount - 1),
			spreadWidth = sprSF * 1024,
			dotHeight = sprSF * 64;
		for (let i = 0; i < this.optionCount; i++) {
			let stop = i * step,
			hexAct, hexMO;
			
			if (stop < 0.5) {
				let prop = stop / 0.5;
				hexMO =	utils.linearColourInterpolation(0xff8181, 0xffef81, prop);
				hexAct =		utils.linearColourInterpolation(0xff0000, 0xffdf00, prop);
			}
			else {
				let prop = (stop - 0.5) / 0.5;
				hexMO =	utils.linearColourInterpolation(0xffef81, 0x81ff81, prop);
				hexAct =		utils.linearColourInterpolation(0xffdf00, 0x00bf00, prop);
			}
			
			let xVal = (-0.5 + stop) * spreadWidth,
				dotPos = new PIXI.Point(xVal, dotHeight);
			
			this.options.push(new radioButton(this, stop, this.sprites, hexAct, hexMO, dotPos, sprSF));
		}
		
		let titleTextOpts = new defaultTextStyle(pixelScaleFactor, 'medium');
		this.title = new PIXI.Text(this.titleString, titleTextOpts);
		//this.title.anchor.set(0.5, 0.5);
		xOff = Math.round(this.title.width * -0.5);
		yOff = Math.round(this.title.height * -0.5);
		this.title.position.set(xOff, sprSF * -96 + yOff);
		this.sprites.addChild(this.title);
		
		// Hover-over text
		if (this.explaText) {
			this.hoverContainer = new PIXI.Container();
			this.hoverContainer.zIndex = 30;
			this.hoverContainer.position.set(0, sprSF * 96);
			
			this.sprites.addChild(this.hoverContainer);
			this.hoverContainer.alpha = 0;
			this.hoverContainer._fadeData = new fadeData(this.hoverContainer, 500);
			
			this.hoverPanel = new Sprite(menuTex['textbox_medium.png']);
			this.hoverPanel.anchor.set(0.5, 0.5);
			this.hoverPanel.scale.set(sprSF, sprSF);
			this.hoverPanel.zIndex = 30;
			this.hoverContainer.addChild(this.hoverPanel);
			
			let hoverTextOpts = new defaultTextStyle(pixelScaleFactor, 'vsmall', 'Roboto');
			hoverTextOpts.wordWrap = true;
			hoverTextOpts.wordWrapWidth = sprSF * 1024;
			
			this.hoverText = new PIXI.Text(this.explaText, hoverTextOpts);
			xOff = Math.round(this.hoverText.width * -0.5);
			yOff = Math.round(this.hoverText.height * -0.5);
			this.hoverText.position.set(xOff, yOff);
			this.hoverContainer.addChild(this.hoverText);
			
			// Setup title as trigger
			this.title.interactive = true;
			/*this.title.hitArea = new PIXI.Rectangle(
				-0.5 * this.title.width,
				-0.5 * this.title.height,
				this.title.width,
				this.title.height
			);*/
			
			this.title._mouseOvered = false;
			this.title._mouseOverCountdown = 1000;
			
			this.title.mouseover = (mouseData) => { this.title._mouseOvered = true; }
			this.title.mouseout = (mouseData) => {
				this.title._mouseOvered = false;
				this.title._mouseOverCountdown = 1000;
				this.hoverContainer._fadeData.triggered = false;
			}
			
			this.title.update = (deltaMS) => {
				if (this.title._mouseOvered && this.title._mouseOverCountdown > 0) {
					this.title._mouseOverCountdown -= deltaMS;
					if (this.title._mouseOverCountdown <= 0) {
						this.title._mouseOverCountdown = 0;
						this.hoverContainer._fadeData.triggered = true;
					}
				}
			}
		}
	}
	
	wasSelected(value) {
		let newSelectedIndex = -1;
		for (let i = 0; i < this.options.length && newSelectedIndex == -1; i++) {
			if (this.options[i].value == value) { newSelectedIndex = i; }
		}
		
		if (this._selectedIndex != null) { this.options[this._selectedIndex].selected = false; }
		this.options[newSelectedIndex].selected = true;
		this._selectedIndex = newSelectedIndex;
	}
	
	get value() {
		if (this._selectedIndex == null) { return -1; }
		else {
			return this.options[this._selectedIndex].value;
		}
	}
}

let radioButton = class {
	constructor(parent, value, parentPIXIContainer, colourHexSelect, colourHexMO, position, sprSF) {
		this.parent = parent;
		this.value = value;
		
		this.colourHexSelect = (colourHexSelect != null) ? colourHexSelect : 0x000000;
		this.colourHexMO = (colourHexMO != null) ? colourHexMO : 0x818181;
		position = position || new PIXI.Point(0, 0);
		sprSF = sprSF || 1;
		
		this.sprite = new Sprite(menuTex['button_dot.png']);
		this.sprite.tint = 0xffffff;
		this.sprite.anchor.set(0.5, 0.5);
		this.sprite.scale.set(sprSF, sprSF);
		this.sprite.position.set(position.x, position.y);
		this.sprite.zIndex = 15;
		
		parentPIXIContainer.addChild(this.sprite);
		
		this.sprite.interactive = true;
		this.sprite.hitArea = new PIXI.Circle(0, 0, 64);
		
		this.sprite._fadeTintData = new fadeTintData(this.sprite, 500, colourHexMO);
		
		this.sprite.mouseover = (mouseData) => { this.sprite._fadeTintData.triggered = true; }
		this.sprite.mouseout = (mouseData) => { this.sprite._fadeTintData.triggered = false; }
		this.sprite.click = (mouseData) => { this.selected = true; }
		
		this._selected = false;
	}
	
	get selected() { return this._selected; }
	
	set selected(flag) {
		flag = flag !== false;
		
		if (flag != this._selected) {
			if (flag) {
				this._selected = true;
				this.sprite._fadeTintData.active = false;
				this.sprite.tint = this.colourHexSelect;
				
				this.parent.wasSelected(this.value);
			}
			else {
				this._selected = false;
				this.sprite._fadeTintData.active = true;
				this.sprite.tint = this.colourHexMO;
				
				this.sprite._fadeTintData._triggered = false;
				this.sprite._fadeTintData.counter = this.sprite._fadeTintData.fadeOutTimeMS;
			}
		}
	}
}

let checkboxButton = class {
	constructor(titleString, parentPIXIContainer, position, pixelScaleFactor, colourHexSelect, colourHexMO) {
		this.titleString = titleString || 'default';
		
		if (position == null) { position = new PIXI.Point(0, 0); }
		if (pixelScaleFactor == null) { pixelScaleFactor = 16; }
		
		let sprSF = (pixelScaleFactor / 64);
		let xOff, yOff;
		
		this._selected = false;
		
		this.sprites = new PIXI.Container();
		this.sprites.position.set(position.x, position.y);
		
		// Button
		this.colourHexSelect = (colourHexSelect != null) ? colourHexSelect : 0x000000;
		this.colourHexMO = (colourHexMO != null) ? colourHexMO : 0x818181;
		sprSF = sprSF || 1;
		
		this.button = new Sprite(menuTex['button_square.png']);
		this.button.tint = 0xffffff;
		this.button.anchor.set(0.5, 0.5);
		this.button.position.set(sprSF * 96, 0)
		this.button.scale.set(sprSF, sprSF);
		this.button.zIndex = 15;
		
		this.button._fadeTintData = new fadeTintData(this.button, 500, colourHexMO);
		
		this.sprites.addChild(this.button);
		
		// Text
		let titleTextOpts = new defaultTextStyle(pixelScaleFactor, 'small', 'Roboto');
		titleTextOpts.wordWrap = true;
		titleTextOpts.wordWrapWidth = 512 * sprSF;
		
		this.title = new PIXI.Text(this.titleString, titleTextOpts);
		yOff = Math.round(this.title.height * -0.5);
		this.title.position.set(192 * sprSF, yOff);
		this.title.tint = 0x000000;
		
		this.sprites.addChild(this.title);
		
		// Interaction
		this.sprites.interactive = true;
		
		this.sprites.mouseover = (mouseData) => { this.button._fadeTintData.triggered = true; }
		this.sprites.mouseout = (mouseData) => { this.button._fadeTintData.triggered = false; }
		this.sprites.click = (mouseData) => { this.selected = !this.selected; }
		
		parentPIXIContainer.addChild(this.sprites);
	}
	
	get selected() { return this._selected; }
	
	set selected(flag) {
		flag = flag !== false;
		
		if (flag != this._selected) {
			if (flag) {
				this._selected = true;
				this.button._fadeTintData.active = false;
				this.button.tint = this.colourHexSelect;
			}
			else {
				this._selected = false;
				this.button._fadeTintData.active = true;
				this.button.tint = this.colourHexMO;
				
				this.button._fadeTintData._triggered = false;
				this.button._fadeTintData.counter = this.button._fadeTintData.fadeOutTimeMS;
			}
		}
	}
}

menus.main = class {
	constructor (app, settings) {
		this.stage = new PIXI.Container();
		this.stage.sortableChildren = true;
		app.stage.addChildAt(this.stage, 0);
		this.stage.position.set(settings.pixelOffset.x, settings.pixelOffset.y);
		
		this.settings = settings;
		this._behaviour = "";
		this._behaviourTrigger = false;
		this._behaviourOptions = null;
		
		// Background
		let totalSize = this.settings.levelSize.clone().mul(this.settings.pixelScaleFactor);
		this.background = new PIXI.Graphics;
		this.background.lineStyle(0, 0, 0);
		this.background.beginFill(0xffffff, 1);
		this.background.drawRect(0, 0, totalSize.x, totalSize.y);
		this.background.zIndex = -1;
		this.stage.addChild(this.background);
		
		// Blackout visual
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
			buttonTextStyle = new defaultTextStyle(settings.pixelScaleFactor, 'large');
		
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
		
		newSpr = new PIXI.Text('tutorial', buttonTextStyle);
		newSpr.position.set(sprSF * -128, sprSF * -96);
		
		this.sprites.but_tut.addChild(newSpr);
		this.sprites.but_tut.textSpr = newSpr;
		
		this.sprites.but_tut.mouseover = (mouseData) => { this.sprites.but_tut.dot._fadeTintData.triggered = true; }
		this.sprites.but_tut.mouseout = (mouseData) => { this.sprites.but_tut.dot._fadeTintData.triggered = false; }
		this.sprites.but_tut.click = (mouseData) => {
			this._blackIn = true;
			this._behaviour = "b_tutorial";
		}
		
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
		
		newSpr = new PIXI.Text('play', buttonTextStyle);
		newSpr.position.set(sprSF * -128, sprSF * -96);
		
		this.sprites.but_play.addChild(newSpr);
		this.sprites.but_play.textSpr = newSpr;
		
		this.sprites.but_play.mouseover = (mouseData) => { this.sprites.but_play.dot._fadeTintData.triggered = true; }
		this.sprites.but_play.mouseout = (mouseData) => { this.sprites.but_play.dot._fadeTintData.triggered = false; }
		this.sprites.but_play.click = (mouseData) => {
			this._blackIn = true;
			this._behaviour = "b_play";
		}
		
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
		
		newSpr = new PIXI.Text('options', buttonTextStyle);
		newSpr.position.set(sprSF * -128, sprSF * -96);
		
		this.sprites.but_opt.addChild(newSpr);
		this.sprites.but_opt.textSpr = newSpr;
		
		this.sprites.but_opt.mouseover = (mouseData) => { this.sprites.but_opt.dot._fadeTintData.triggered = true; }
		this.sprites.but_opt.mouseout = (mouseData) => { this.sprites.but_opt.dot._fadeTintData.triggered = false; }
		this.sprites.but_opt.click = (mouseData) => {
			this._blackIn = true;
			this._behaviour = "b_options";
		}
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
		
		if (this._behaviourTrigger && this._behaviour != "" && this[this._behaviour] != null) {
			this[this._behaviour](this._behaviourOptions);
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
	
	destroy() {
		this.stage.destroy({ children: true });
	}
}

menus.options = class {
	constructor (app, settings) {
		this.stage = new PIXI.Container();
		this.stage.sortableChildren = true;
		app.stage.addChildAt(this.stage, 0);
		this.stage.position.set(settings.pixelOffset.x, settings.pixelOffset.y);
		
		this.settings = settings;
		this._behaviour = "";
		this._behaviourTrigger = false;
		this._behaviourOptions = null;
		
		// Background
		let totalSize = this.settings.levelSize.clone().mul(this.settings.pixelScaleFactor);
		this.background = new PIXI.Graphics;
		this.background.lineStyle(0, 0, 0);
		this.background.beginFill(0xffffff, 1);
		this.background.drawRect(0, 0, totalSize.x, totalSize.y);
		this.background.zIndex = -1;
		this.stage.addChild(this.background);
		
		// Blackout visual
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
		this.updateables = [];
		
		let sprSF = (settings.pixelScaleFactor / 64),
			position,
			newSpr; // Assume all menu sprites done at 64 pixel psf.
		
		// decor
		this.sprites.decor = new Sprite(resources['assets/quiz_decor.png'].texture);
		this.sprites.decor.scale.set(sprSF, sprSF);
		this.sprites.decor.zIndex = 10;
		this.stage.addChild(this.sprites.decor);
		
		let xOff, yOff;
		
		// Title
		this.sprites.title = new PIXI.Text('options', new defaultTextStyle(settings.pixelScaleFactor, 'large'));
		xOff = Math.round(this.sprites.title.width * -0.5),
		yOff = Math.round(this.sprites.title.height * -0.5);
		this.sprites.title.position.set(sprSF * 1088 + xOff, sprSF * 320 + yOff);
		this.stage.addChild(this.sprites.title);
		
		// progress subtitle
		this.sprites.subtitle = new PIXI.Text('Under construction.', new defaultTextStyle(settings.pixelScaleFactor, 'small', 'Roboto'));
		xOff = Math.round(this.sprites.subtitle.width * -0.5),
		yOff = Math.round(this.sprites.subtitle.height * -0.5);
		this.sprites.subtitle.position.set(sprSF * 1088 + xOff, sprSF * 440 + yOff);
		this.stage.addChild(this.sprites.subtitle);
		
		// back button
		this.sprites.but_cont = new Sprite(menuTex['button_continue.png']);
		this.sprites.but_cont.tint = 0xffffff;
		this.sprites.but_cont.anchor.set(0.5, 0.5);
		this.sprites.but_cont.scale.set(sprSF, sprSF);
		this.sprites.but_cont.rotation = utils.PI;
		this.sprites.but_cont.zIndex = 16;
		this.sprites.but_cont.position.set(sprSF * 1088, sprSF * 1856);
		this.stage.addChild(this.sprites.but_cont);
		
		this.sprites.but_cont.interactive = true;
		this.sprites.but_cont.hitArea = new PIXI.Circle(0, 0, 128);
		
		this.sprites.but_cont._fadeTintData = new fadeTintData(this.sprites.but_cont, 500, 0x8181ff);
		this.sprites.fadeables.push(this.sprites.but_cont);
		
		this.sprites.but_cont.mouseover = (mouseData) => { this.sprites.but_cont._fadeTintData.triggered = true; }
		this.sprites.but_cont.mouseout = (mouseData) => { this.sprites.but_cont._fadeTintData.triggered = false; }
		this.sprites.but_cont.click = (mouseData) => {
				this._blackIn = true;
				this._behaviour = "b_back";
		};
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
		
		if (this._behaviourTrigger && this._behaviour != "" && this[this._behaviour] != null) {
			this[this._behaviour](this._behaviourOptions);
		}
		
		// Updateables
		this.updateables.forEach((element) => element.update(deltaMS));
		
		// Button fading
		this.sprites.fadeables.forEach((element) => {
			if (element._fadeData) { element._fadeData.updateFade(deltaMS); }
			if (element._fadeTintData) { element._fadeTintData.updateFade(deltaMS); }
		});
	}
	
	destroy() {
		this.stage.destroy({ children: true });
	}
}

menus.quiz_player = class {
	constructor (app, settings) {
		this.stage = new PIXI.Container();
		this.stage.sortableChildren = true;
		app.stage.addChildAt(this.stage, 0);
		this.stage.position.set(settings.pixelOffset.x, settings.pixelOffset.y);
		
		this.settings = settings;
		this._behaviour = "";
		this._behaviourTrigger = false;
		this._behaviourOptions = null;
		
		// Background
		let totalSize = this.settings.levelSize.clone().mul(this.settings.pixelScaleFactor);
		this.background = new PIXI.Graphics;
		this.background.lineStyle(0, 0, 0);
		this.background.beginFill(0xffffff, 1);
		this.background.drawRect(0, 0, totalSize.x, totalSize.y);
		this.background.zIndex = -1;
		this.stage.addChild(this.background);
		
		// Blackout visual
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
		this.updateables = [];
		
		let sprSF = (settings.pixelScaleFactor / 64),
			position,
			newSpr; // Assume all menu sprites done at 64 pixel psf.
		
		// decor
		this.sprites.decor = new Sprite(resources['assets/quiz_decor.png'].texture);
		this.sprites.decor.scale.set(sprSF, sprSF);
		this.sprites.decor.zIndex = 10;
		this.stage.addChild(this.sprites.decor);
		
		// Title
		this.sprites.title = new PIXI.Text('your priorities', new defaultTextStyle(settings.pixelScaleFactor, 'large'));
		//this.sprites.title.anchor.set(0.5, 0.5);
		let xOff = Math.round(this.sprites.title.width * -0.5),
			yOff = Math.round(this.sprites.title.height * -0.5);
		this.sprites.title.position.set(sprSF * 1088 + xOff, sprSF * 320 + yOff);
		this.stage.addChild(this.sprites.title);
		
		this.questions = [];
		
		// interaction
		position = new PIXI.Point(sprSF * 1088, sprSF * 704);
		newSpr = new radioController('mechanics', this.stage, position, settings.pixelScaleFactor, 5, 'technical challenge, depth, fairness, the scope for skill');
		this.questions.push(newSpr);
		
		// exploration
		position = new PIXI.Point(sprSF * 1088, sprSF * 1088);
		newSpr = new radioController('aesthetics', this.stage, position, settings.pixelScaleFactor, 5, 'beauty, theme, the realisation of another place');
		this.questions.push(newSpr);
		
		// narrative
		position = new PIXI.Point(sprSF * 1088, sprSF * 1472);
		newSpr = new radioController('narrative', this.stage, position, settings.pixelScaleFactor, 5, 'meaning, empathy, direction, effective storytelling');
		this.questions.push(newSpr);
		
		// next button
		this.sprites.but_cont = new Sprite(menuTex['button_continue.png']);
		this.sprites.but_cont.tint = 0xffffff;
		this.sprites.but_cont.anchor.set(0.5, 0.5);
		this.sprites.but_cont.scale.set(sprSF, sprSF);
		this.sprites.but_cont.zIndex = 16;
		this.sprites.but_cont.position.set(sprSF * 1088, sprSF * 1856);
		this.stage.addChild(this.sprites.but_cont);
		
		this.sprites.but_cont.interactive = true;
		this.sprites.but_cont.hitArea = new PIXI.Circle(0, 0, 128);
		
		this.sprites.but_cont._fadeTintData = new fadeTintData(this.sprites.but_cont, 500, 0x8181ff);
		this.sprites.fadeables.push(this.sprites.but_cont);
		
		this.sprites.but_cont.mouseover = (mouseData) => { this.sprites.but_cont._fadeTintData.triggered = true; }
		this.sprites.but_cont.mouseout = (mouseData) => { this.sprites.but_cont._fadeTintData.triggered = false; }
		this.sprites.but_cont.click = (mouseData) => {
			let profile = {};
			
			profile.interaction =	this.questions[0].value;
			profile.exploration =	this.questions[1].value;
			profile.narrative =	this.questions[2].value;
			
			if (!(profile.interaction == -1 || profile.exploration == -1 || profile.narrative == -1)) {
				this._blackIn = true;
				this._behaviour = "b_continue";
				this._behaviourOptions = profile;
			}
		}
		
		this.questions.forEach((question) => {
			question.options.forEach((option) => {
				this.sprites.fadeables.push(option.sprite);
			});
			if (question.title.interactive) {
				this.updateables.push(question.title);
				this.sprites.fadeables.push(question.hoverContainer);
			}
		});
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
		
		if (this._behaviourTrigger && this._behaviour != "" && this[this._behaviour] != null) {
			this[this._behaviour](this._behaviourOptions);
		}
		
		// Updateables
		this.updateables.forEach((element) => element.update(deltaMS));
		
		// Button fading
		this.sprites.fadeables.forEach((element) => {
			if (element._fadeData) { element._fadeData.updateFade(deltaMS); }
			if (element._fadeTintData) { element._fadeTintData.updateFade(deltaMS); }
		});
	}
	
	destroy() {
		this.stage.destroy({ children: true });
	}
}

menus.quiz_feedback = class {
	constructor (app, settings, currentIndex, runTime) {
		this.stage = new PIXI.Container();
		this.stage.sortableChildren = true;
		app.stage.addChildAt(this.stage, 0);
		this.stage.position.set(settings.pixelOffset.x, settings.pixelOffset.y);
		
		this.settings = settings;
		this._behaviour = "";
		this._behaviourTrigger = false;
		this._behaviourOptions = null;
		
		// Background
		let totalSize = this.settings.levelSize.clone().mul(this.settings.pixelScaleFactor);
		this.background = new PIXI.Graphics;
		this.background.lineStyle(0, 0, 0);
		this.background.beginFill(0xffffff, 1);
		this.background.drawRect(0, 0, totalSize.x, totalSize.y);
		this.background.zIndex = -1;
		this.stage.addChild(this.background);
		
		// Blackout visual
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
		this.updateables = [];
		
		let sprSF = (settings.pixelScaleFactor / 64),
			position,
			newSpr; // Assume all menu sprites done at 64 pixel psf.
		
		// decor
		this.sprites.decor = new Sprite(resources['assets/quiz_decor.png'].texture);
		this.sprites.decor.scale.set(sprSF, sprSF);
		this.sprites.decor.zIndex = 10;
		this.stage.addChild(this.sprites.decor);
		
		let xOff, yOff;
		
		// Title
		this.sprites.title = new PIXI.Text('level feedback', new defaultTextStyle(settings.pixelScaleFactor, 'large'));
		xOff = Math.round(this.sprites.title.width * -0.5),
		yOff = Math.round(this.sprites.title.height * -0.5);
		this.sprites.title.position.set(sprSF * 1088 + xOff, sprSF * 320 + yOff);
		this.stage.addChild(this.sprites.title);
		
		// progress subtitle
		currentIndex += 1;
		let subtitleText;
		if (runTime < 0) { subtitleText = '' + currentIndex + '/5 | skipped'; }
		else {
			let runTimeRounded = 0.01 * Math.round(runTime * 100);
			subtitleText = '' + currentIndex + '/5 | ' + runTimeRounded + 's';
		}
		
		this.sprites.subtitle = new PIXI.Text(subtitleText, new defaultTextStyle(settings.pixelScaleFactor, 'small', 'Roboto'));
		xOff = Math.round(this.sprites.subtitle.width * -0.5),
		yOff = Math.round(this.sprites.subtitle.height * -0.5);
		this.sprites.subtitle.position.set(sprSF * 1088 + xOff, sprSF * 440 + yOff);
		this.stage.addChild(this.sprites.subtitle);
		
		this.questions = [];
		
		// challenge
		position = new PIXI.Point(sprSF * 1088, sprSF * 704);
		newSpr = new radioController('challenge', this.stage, position, settings.pixelScaleFactor, 5, 'Was this level appropriately difficult?');
		this.questions.push(newSpr);
		
		// engagement
		position = new PIXI.Point(sprSF * 1088, sprSF * 1088);
		newSpr = new radioController('engagement', this.stage, position, settings.pixelScaleFactor, 5, 'Was this level interesting to complete?');
		this.questions.push(newSpr);
		
		// aesthetics
		position = new PIXI.Point(sprSF * 1088, sprSF * 1472);
		newSpr = new radioController('aesthetics', this.stage, position, settings.pixelScaleFactor, 5, 'Was this level aesthetically pleasing?');
		this.questions.push(newSpr);
		
		// next button
		this.sprites.but_cont = new Sprite(menuTex['button_continue.png']);
		this.sprites.but_cont.tint = 0xffffff;
		this.sprites.but_cont.anchor.set(0.5, 0.5);
		this.sprites.but_cont.scale.set(sprSF, sprSF);
		this.sprites.but_cont.zIndex = 16;
		this.sprites.but_cont.position.set(sprSF * 1088, sprSF * 1856);
		this.stage.addChild(this.sprites.but_cont);
		
		this.sprites.but_cont.interactive = true;
		this.sprites.but_cont.hitArea = new PIXI.Circle(0, 0, 128);
		
		this.sprites.but_cont._fadeTintData = new fadeTintData(this.sprites.but_cont, 500, 0x8181ff);
		this.sprites.fadeables.push(this.sprites.but_cont);
		
		this.sprites.but_cont.mouseover = (mouseData) => { this.sprites.but_cont._fadeTintData.triggered = true; }
		this.sprites.but_cont.mouseout = (mouseData) => { this.sprites.but_cont._fadeTintData.triggered = false; }
		this.sprites.but_cont.click = (mouseData) => {
			let feedback = {};
			
			feedback.challenge =	this.questions[0].value;
			feedback.engagement =	this.questions[1].value;
			feedback.aesthetics =	this.questions[2].value;
			
			if (!(feedback.challenge == -1 || feedback.engagement == -1 || feedback.aesthetics == -1)) {
				this._blackIn = true;
				this._behaviour = "b_continue";
				this._behaviourOptions = feedback;
			}
		}
		
		this.questions.forEach((question) => {
			question.options.forEach((option) => {
				this.sprites.fadeables.push(option.sprite);
			});
			if (question.title.interactive) {
				this.updateables.push(question.title);
				this.sprites.fadeables.push(question.hoverContainer);
			}
		});
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
		
		if (this._behaviourTrigger && this._behaviour != "" && this[this._behaviour] != null) {
			this[this._behaviour](this._behaviourOptions);
		}
		
		// Updateables
		this.updateables.forEach((element) => element.update(deltaMS));
		
		// Button fading
		this.sprites.fadeables.forEach((element) => {
			if (element._fadeData) { element._fadeData.updateFade(deltaMS); }
			if (element._fadeTintData) { element._fadeTintData.updateFade(deltaMS); }
		});
	}
	
	destroy() {
		this.stage.destroy({ children: true });
	}
}

menus.quiz_skip = class {
	constructor (app, settings, currentIndex, runTime) {
		this.stage = new PIXI.Container();
		this.stage.sortableChildren = true;
		app.stage.addChildAt(this.stage, 0);
		this.stage.position.set(settings.pixelOffset.x, settings.pixelOffset.y);
		
		this.settings = settings;
		this._behaviour = "";
		this._behaviourTrigger = false;
		this._behaviourOptions = null;
		
		// Background
		let totalSize = this.settings.levelSize.clone().mul(this.settings.pixelScaleFactor);
		this.background = new PIXI.Graphics;
		this.background.lineStyle(0, 0, 0);
		this.background.beginFill(0xffffff, 1);
		this.background.drawRect(0, 0, totalSize.x, totalSize.y);
		this.background.zIndex = -1;
		this.stage.addChild(this.background);
		
		// Blackout visual
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
		this.updateables = [];
		
		let sprSF = (settings.pixelScaleFactor / 64),
			position,
			newSpr; // Assume all menu sprites done at 64 pixel psf.
		
		// decor
		this.sprites.decor = new Sprite(resources['assets/quiz_decor.png'].texture);
		this.sprites.decor.scale.set(sprSF, sprSF);
		this.sprites.decor.zIndex = 10;
		this.stage.addChild(this.sprites.decor);
		
		let xOff, yOff;
		
		// Title
		this.sprites.title = new PIXI.Text('level skipped', new defaultTextStyle(settings.pixelScaleFactor, 'large'));
		xOff = Math.round(this.sprites.title.width * -0.5),
		yOff = Math.round(this.sprites.title.height * -0.5);
		this.sprites.title.position.set(sprSF * 1088 + xOff, sprSF * 320 + yOff);
		this.stage.addChild(this.sprites.title);
		
		// progress subtitle
		currentIndex += 1;
		
		this.sprites.subtitle = new PIXI.Text('What were your reasons?', new defaultTextStyle(settings.pixelScaleFactor, 'small', 'Roboto'));
		xOff = Math.round(this.sprites.subtitle.width * -0.5),
		yOff = Math.round(this.sprites.subtitle.height * -0.5);
		this.sprites.subtitle.position.set(sprSF * 1088 + xOff, sprSF * 440 + yOff);
		this.stage.addChild(this.sprites.subtitle);
		
		this.questions = [];
		
		// Too hard?
		position = new PIXI.Point(sprSF * 320, sprSF * 704);
		newSpr = new checkboxButton('Too Difficult for Me', this.stage, position, settings.pixelScaleFactor, 0xffdf00, 0xffef81);
		this.questions.push(newSpr);
		
		// not fun
		position = new PIXI.Point(sprSF * 1088, sprSF * 704);
		newSpr = new checkboxButton('Not Enjoyable', this.stage, position, settings.pixelScaleFactor, 0xffdf00, 0xffef81);
		this.questions.push(newSpr);
		
		// accidental misclick
		position = new PIXI.Point(sprSF * 320, sprSF * 1088);
		newSpr = new checkboxButton('Accidental Misclick', this.stage, position, settings.pixelScaleFactor, 0x0000ff, 0x8181ff);
		this.questions.push(newSpr);
		
		// Literally Impossible
		position = new PIXI.Point(sprSF * 1088, sprSF * 1088);
		newSpr = new checkboxButton('Impossible to Complete', this.stage, position, settings.pixelScaleFactor, 0xff0000, 0xff8181);
		this.questions.push(newSpr);
		
		// Offensive?
		position = new PIXI.Point(sprSF * 320, sprSF * 1472);
		newSpr = new checkboxButton('Offensive Content', this.stage, position, settings.pixelScaleFactor, 0xff0000, 0xff8181);
		this.questions.push(newSpr);
		
		// Other
		position = new PIXI.Point(sprSF * 1088, sprSF * 1472);
		newSpr = new checkboxButton('Other', this.stage, position, settings.pixelScaleFactor, 0x0000ff, 0x8181ff);
		this.questions.push(newSpr);
		
		// next button
		this.sprites.but_cont = new Sprite(menuTex['button_continue.png']);
		this.sprites.but_cont.tint = 0xffffff;
		this.sprites.but_cont.anchor.set(0.5, 0.5);
		this.sprites.but_cont.scale.set(sprSF, sprSF);
		this.sprites.but_cont.zIndex = 16;
		this.sprites.but_cont.position.set(sprSF * 1088, sprSF * 1856);
		this.stage.addChild(this.sprites.but_cont);
		
		this.sprites.but_cont.interactive = true;
		this.sprites.but_cont.hitArea = new PIXI.Circle(0, 0, 128);
		
		this.sprites.but_cont._fadeTintData = new fadeTintData(this.sprites.but_cont, 500, 0x8181ff);
		this.sprites.fadeables.push(this.sprites.but_cont);
		
		this.sprites.but_cont.mouseover = (mouseData) => { this.sprites.but_cont._fadeTintData.triggered = true; }
		this.sprites.but_cont.mouseout = (mouseData) => { this.sprites.but_cont._fadeTintData.triggered = false; }
		this.sprites.but_cont.click = (mouseData) => {
			let bits = 0x00;
			
			for (let i = 0; i < this.questions.length; i++) {
				let bit = this.questions[i].selected ? 1 : 0;
				bit = bit << i;
				bits = bits | bit;
			}
			
			if (bits != 0) {
				this._blackIn = true;
				this._behaviour = "b_continue";
				this._behaviourOptions = bits;
			}
		}
		
		this.questions.forEach((question) => {
			this.sprites.fadeables.push(question.button);
		});
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
		
		if (this._behaviourTrigger && this._behaviour != "" && this[this._behaviour] != null) {
			this[this._behaviour](this._behaviourOptions);
		}
		
		// Updateables
		this.updateables.forEach((element) => element.update(deltaMS));
		
		// Button fading
		this.sprites.fadeables.forEach((element) => {
			if (element._fadeData) { element._fadeData.updateFade(deltaMS); }
			if (element._fadeTintData) { element._fadeTintData.updateFade(deltaMS); }
		});
	}
	
	destroy() {
		this.stage.destroy({ children: true });
	}
}

menus.editor_standin = class {
	constructor (app, settings) {
		this.stage = new PIXI.Container();
		this.stage.sortableChildren = true;
		app.stage.addChildAt(this.stage, 0);
		this.stage.position.set(settings.pixelOffset.x, settings.pixelOffset.y);
		
		this.settings = settings;
		this._behaviour = "";
		this._behaviourTrigger = false;
		this._behaviourOptions = null;
		
		// Background
		let totalSize = this.settings.levelSize.clone().mul(this.settings.pixelScaleFactor);
		this.background = new PIXI.Graphics;
		this.background.lineStyle(0, 0, 0);
		this.background.beginFill(0xffffff, 1);
		this.background.drawRect(0, 0, totalSize.x, totalSize.y);
		this.background.zIndex = -1;
		this.stage.addChild(this.background);
		
		// Blackout visual
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
		this.updateables = [];
		
		let sprSF = (settings.pixelScaleFactor / 64),
			position,
			newSpr; // Assume all menu sprites done at 64 pixel psf.
		
		// decor
		this.sprites.decor = new Sprite(resources['assets/quiz_decor.png'].texture);
		this.sprites.decor.scale.set(sprSF, sprSF);
		this.sprites.decor.zIndex = 10;
		this.stage.addChild(this.sprites.decor);
		
		let xOff, yOff;
		
		// Title
		this.sprites.title = new PIXI.Text('level editor', new defaultTextStyle(settings.pixelScaleFactor, 'large'));
		xOff = Math.round(this.sprites.title.width * -0.5),
		yOff = Math.round(this.sprites.title.height * -0.5);
		this.sprites.title.position.set(sprSF * 1088 + xOff, sprSF * 320 + yOff);
		this.stage.addChild(this.sprites.title);
		
		// progress subtitle
		this.sprites.subtitle = new PIXI.Text('This is where it would go.', new defaultTextStyle(settings.pixelScaleFactor, 'small', 'Roboto'));
		xOff = Math.round(this.sprites.subtitle.width * -0.5),
		yOff = Math.round(this.sprites.subtitle.height * -0.5);
		this.sprites.subtitle.position.set(sprSF * 1088 + xOff, sprSF * 440 + yOff);
		this.stage.addChild(this.sprites.subtitle);
		
		// next button
		this.sprites.but_cont = new Sprite(menuTex['button_continue.png']);
		this.sprites.but_cont.tint = 0xffffff;
		this.sprites.but_cont.anchor.set(0.5, 0.5);
		this.sprites.but_cont.scale.set(sprSF, sprSF);
		this.sprites.but_cont.zIndex = 16;
		this.sprites.but_cont.position.set(sprSF * 1088, sprSF * 1856);
		this.stage.addChild(this.sprites.but_cont);
		
		this.sprites.but_cont.interactive = true;
		this.sprites.but_cont.hitArea = new PIXI.Circle(0, 0, 128);
		
		this.sprites.but_cont._fadeTintData = new fadeTintData(this.sprites.but_cont, 500, 0x8181ff);
		this.sprites.fadeables.push(this.sprites.but_cont);
		
		this.sprites.but_cont.mouseover = (mouseData) => { this.sprites.but_cont._fadeTintData.triggered = true; }
		this.sprites.but_cont.mouseout = (mouseData) => { this.sprites.but_cont._fadeTintData.triggered = false; }
		this.sprites.but_cont.click = (mouseData) => {
				this._blackIn = true;
				this._behaviour = "b_continue";
		};
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
		
		if (this._behaviourTrigger && this._behaviour != "" && this[this._behaviour] != null) {
			this[this._behaviour](this._behaviourOptions);
		}
		
		// Updateables
		this.updateables.forEach((element) => element.update(deltaMS));
		
		// Button fading
		this.sprites.fadeables.forEach((element) => {
			if (element._fadeData) { element._fadeData.updateFade(deltaMS); }
			if (element._fadeTintData) { element._fadeTintData.updateFade(deltaMS); }
		});
	}
	
	destroy() {
		this.stage.destroy({ children: true });
	}
}

module.exports = menus;