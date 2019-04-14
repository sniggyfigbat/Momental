//	***
//	app.js start
//	***

//const planck = require('planck-js');
//const PIXI = require('pixi.js');
const uuid = require('uuid');
//import * as fs from 'fs';
const PNG = require('pngjs/browser').PNG;

let Gameplay;
var GP;
var menus;
var utils = require('./js/utils');

//var fs = require('fs'),
//	PNG = require('pngjs').PNG;

let type = "WebGL";

var activeUpdated = null;

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

let winInSize, app, bucket, settings;

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
	app = new Application({width: winInSize.x, height: winInSize.y, backgroundColor: 0xffffff, antialias: true});

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
	
	settings = {
		autoReload: true,
		autoSlowAim: true,
		
		pixelOffset:		new PIXI.Point(bucket.xOffset, bucket.yOffset),
		pixelSize:			new PIXI.Point(bucket.width, bucket.height),
		
		pixelScaleFactor:	bucket.pixelScaleFactor,	// 1 game unit (tile / GU) translated to PIXI units (pixels).
		meterScaleFactor:	1,							// 1 game unit (tile / GU) translated to 1 box2D units (meters).
		levelSize:			Vec2(34, 34),				// In GU. Note, origin is in bottom left.
		pixelOrigin:		Vec2(0, 34),				// In GU. PIXI's origin is in the top left of the screen, this is the location of that point in gameplay space.
		meterOrigin:		Vec2(0, 0)					// In GU. box2D's origin is in the bottom left of the level, this is the location of that point in gameplay space.
	};
}

setupApp();

loader
	.add([ // Add assets to import below:
		"assets/gameplay.json",
		"assets/particles.json",
		"assets/menu.json",
		"assets/main_decor.png"
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
	
	menus = require('./js/menus');
	
	activeUpdated = new menus.make_main(app, settings);
	//loadLevel('Tutorial_05');
	
	app.ticker.add(delta => gameLoop(delta));
}

function loadLevel(levelName) {
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
	
	Gameplay = require('./js/gameplay');
	const IH = require('./js/inputhandler');
	
	IH.setup(app.view);
	
	GP = new Gameplay(world, app, IH, settings);
	
	let levelStream;
	
	let fetchLevelProm = fetch('./levels/' + levelName + '.png').then(
		(response) => {
			if (response.status !== 200) {
				console.log("Issue loading level file '" + levelName + "' from server. Status Code: " + response.status);
				return;
			}
			
			return response;
		}
	)
	.then(response => response.arrayBuffer())
	.then(buffer => {
		levelStream = new PNG({ filterType:4 }).parse( buffer, function(error, data) {
			if (error != null) { console.log('ERROR: In level image read; ' + error); }
			else { GP.loadLevel(levelStream); }
		});
	})
	.catch(function(err) {
		console.log('Fetch Error: ', err);
	});
		
	/*	.on('parsed'), function() {
			
		}*/
	
	//GP.loadLevel(resources[""].texture);
	
	GP.trigger_end_victory = () => {
		console.log('Hooray! You win!');
	}
	
	GP.trigger_end_defeat = () => {
		console.log('Oh dear! You died!');
	}
	
	activeUpdated = GP;
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
	//let player = GP.makeObject('player', 'player02', Vec2(18.5, 21.5), 0, {
		/*hasJumpField: true,
		hasPullField: true,
		//canSlowTime: true, Don't have enough bits for this. Assume always true.
		
		hasShotgun: true,
		shotgunStartsWithAmmo: true,
		hasLauncher: true,
		launcherStartsWithAmmo: true,
		hasTesla: true,
		teslaStartsWithAmmo: true,
		
		startingAmmo: 6	// 3 bits, 0-7. In-game-max of 6?*/
		
		/*hasJumpField: false,
		hasPullField: false,
		//canSlowTime: true, Don't have enough bits for this. Assume always true.
		
		hasShotgun: false,
		shotgunStartsWithAmmo: false,
		hasLauncher: false,
		launcherStartsWithAmmo: false,
		hasTesla: false,
		teslaStartsWithAmmo: false,
		
		startingAmmo: 0	// 3 bits, 0-7. In-game-max of 6?
		});*/
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
	
	if (activeUpdated != null) { activeUpdated.update(deltaMS); }
}