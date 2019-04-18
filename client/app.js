//	***
//	app.js start
//	***

//const planck = require('planck-js');
//const PIXI = require('pixi.js');
const uuid = require('uuid');
//import * as fs from 'fs';
const PNG = require('pngjs/browser').PNG;

let Gameplay;
var menus;
var utils = require('./js/utils');
var IH = require('./js/inputhandler');

//var fs = require('fs'),
//	PNG = require('pngjs').PNG;

let type = "WebGL";

var activeUpdated = null,
	runData = null,
	playerData = null;

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
	app = new Application({width: winInSize.x, height: winInSize.y, backgroundColor: 0x000000, antialias: true});

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
		"assets/main_decor.png",
		"assets/quiz_decor.png"
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
	
	//activeUpdated = new menus.main(app, settings);
	//activeUpdated.b_play = load_menu_quiz_player;
	//loadLevel('Tutorial_05');
	load_menu_main();
	
	app.ticker.add(delta => gameLoop(delta));
}

let load_menu_main = (opts) => {
	if (activeUpdated && activeUpdated.destroy) { activeUpdated.destroy(); }
	activeUpdated = new menus.main(app, settings);
	
	activeUpdated.b_tutorial = startTutorial;
	activeUpdated.b_play = startRun;
	activeUpdated.b_options = load_menu_options;
}

let load_menu_options = (opts) => {
	if (activeUpdated && activeUpdated.destroy) { activeUpdated.destroy(); }
	activeUpdated = new menus.options(app, settings);
	
	activeUpdated.b_back = load_menu_main;
}

let startRun = (opts) => {
	runData = {
		runType: 'standard',
		currentIndex: 0,
		id: uuid.v4(),
		levels: [
			{
				id: 'Tutorial_01',
				completed: false,
				skipped: false,
				totalRunTime: 0,
				totalRunDeaths: 0,
				victoryRunTime: null,
				victoryRunInputs: null,
				feedback: null
			},
			{
				id: 'Tutorial_02',
				completed: false,
				skipped: false,
				totalRunTime: 0,
				totalRunDeaths: 0,
				victoryRunTime: null,
				victoryRunInputs: null,
				feedback: null
			},
			{
				id: 'Tutorial_03',
				completed: false,
				skipped: false,
				totalRunTime: 0,
				totalRunDeaths: 0,
				victoryRunTime: null,
				victoryRunInputs: null,
				feedback: null
			},
			{
				id: 'Tutorial_04',
				completed: false,
				skipped: false,
				totalRunTime: 0,
				totalRunDeaths: 0,
				victoryRunTime: null,
				victoryRunInputs: null,
				feedback: null
			},
			{
				id: 'Tutorial_05',
				completed: false,
				skipped: false,
				totalRunTime: 0,
				totalRunDeaths: 0,
				victoryRunTime: null,
				victoryRunInputs: null,
				feedback: null
			}
		]
	}
	
	if (playerData == null) {
		load_menu_quiz_player();
	}
	else {
		runData.playerProfile = playerData;
		level_load(runData.levels[0].id);
	}
}

let startTutorial = (opts) => {
	runData = {
		runType: 'tutorial',
		currentIndex: 0,
		id: uuid.v4(),
		levels: [
			{
				id: 'Tutorial_01',
				completed: false,
				skipped: false,
				totalRunTime: 0,
				totalRunDeaths: 0,
				victoryRunTime: null,
				victoryRunInputs: null,
				feedback: null
			},
			{
				id: 'Tutorial_02',
				completed: false,
				skipped: false,
				totalRunTime: 0,
				totalRunDeaths: 0,
				victoryRunTime: null,
				victoryRunInputs: null,
				feedback: null
			},
			{
				id: 'Tutorial_03',
				completed: false,
				skipped: false,
				totalRunTime: 0,
				totalRunDeaths: 0,
				victoryRunTime: null,
				victoryRunInputs: null,
				feedback: null
			},
			{
				id: 'Tutorial_04',
				completed: false,
				skipped: false,
				totalRunTime: 0,
				totalRunDeaths: 0,
				victoryRunTime: null,
				victoryRunInputs: null,
				feedback: null
			},
			{
				id: 'Tutorial_05',
				completed: false,
				skipped: false,
				totalRunTime: 0,
				totalRunDeaths: 0,
				victoryRunTime: null,
				victoryRunInputs: null,
				feedback: null
			}
		]
	}
	
	level_load(runData.levels[0].id);
}

let load_menu_quiz_player = (opts) => {
	if (activeUpdated && activeUpdated.destroy) { activeUpdated.destroy(); }
	activeUpdated = new menus.quiz_player(app, settings);
	
	activeUpdated.b_continue = (opts) => {
		playerData = opts;
		runData.playerProfile = playerData;
		level_load(runData.levels[0].id);
	};
}

let load_menu_quiz_feedback = (opts) => {
	if (activeUpdated && activeUpdated.destroy) { activeUpdated.destroy(); }
	activeUpdated = new menus.quiz_feedback(app, settings, runData.currentIndex, runData.levels[runData.currentIndex].victoryRunTime);
	
	activeUpdated.b_continue = (opts) => {
		runData.levels[runData.currentIndex].feedback = opts;
		runData.levels[runData.currentIndex].completed = true;
		runData.currentIndex++;
		if (runData.currentIndex < 5) { level_load(runData.levels[runData.currentIndex].id); }
		else { load_editor_standin(); }
	};
}

let load_menu_quiz_skip = (opts) => {
	if (activeUpdated && activeUpdated.destroy) { activeUpdated.destroy(); }
	activeUpdated = new menus.quiz_skip(app, settings);
	
	activeUpdated.b_continue = (opts) => {
		runData.levels[runData.currentIndex].feedback = opts;
		runData.levels[runData.currentIndex].completed = true;
		runData.levels[runData.currentIndex].skipped = true;
		runData.currentIndex++;
		if (runData.currentIndex < 5) { level_load(runData.levels[runData.currentIndex].id); }
		else { load_editor_standin(); }
	};
}

let load_editor_standin = (opts) => {
	if (activeUpdated && activeUpdated.destroy) { activeUpdated.destroy(); }
	activeUpdated = new menus.editor_standin(app, settings);
	
	activeUpdated.b_continue = load_menu_main;
}

let level_load = (levelName) => {
	if (activeUpdated && activeUpdated.destroy) { activeUpdated.destroy(); }
	Gameplay = require('./js/gameplay');
	
	activeUpdated = new Gameplay(app, new IH(app.view), settings, runData);
	
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
			else { activeUpdated.loadLevel(levelStream); }
		});
	})
	.catch(function(err) {
		console.log('Fetch Error: ', err);
	});
	
	activeUpdated.trigger_end_victory = level_win;
	
	activeUpdated.trigger_end_defeat = (opts) => {
		runData.levels[runData.currentIndex].totalRunTime += opts.runTime;
		runData.levels[runData.currentIndex].totalRunDeaths++;
		level_load(runData.levels[runData.currentIndex].id);
	}
	
	activeUpdated.trigger_end_skip = level_skip;
}

let level_win = (opts) => {
	runData.levels[runData.currentIndex].totalRunTime += opts.runTime;
	runData.levels[runData.currentIndex].victoryRunTime = opts.runTime;
	runData.levels[runData.currentIndex].victoryRunInputs = opts.inputEvents;
	
	if (runData.runType != 'tutorial') {load_menu_quiz_feedback(); }
	else {
		runData.levels[runData.currentIndex].completed = true;
		runData.currentIndex++;
		if (runData.currentIndex < 5) { level_load(runData.levels[runData.currentIndex].id); }
		else { load_menu_main(); }
	}
}

let level_skip = (opts) => {
	runData.levels[runData.currentIndex].totalRunTime += opts.runTime;
	runData.levels[runData.currentIndex].victoryRunTime = -1;
	
	if (runData.runType != 'tutorial') {load_menu_quiz_skip(); }
	else {
		runData.levels[runData.currentIndex].completed = true;
		runData.levels[runData.currentIndex].skipped = true;
		runData.currentIndex++;
		if (runData.currentIndex < 5) { level_load(runData.levels[runData.currentIndex].id); }
		else { load_menu_main(); }
	}
}

let gameLoop = (delta) => {
	let deltaMS = app.ticker.deltaMS;
	
	if (activeUpdated && activeUpdated.update) {
		let ready = (activeUpdated.checkReady) ? activeUpdated.checkReady() : true;
		if (ready) { activeUpdated.update(deltaMS); }
	} 
}