//	***
//	utils.js start
//	***

utils = {};

utils.PI =	3.1415926535897932384626433832795028841971693993751058209749445923078164062;
utils.TAU =	6.2831853071795864769252867665590057683943387987502116419498891846156328125;

utils.getSpriteScale = (GP, originalPixelSize, desiredGUSize) => (GP.settings.pixelScaleFactor * desiredGUSize / originalPixelSize);
utils.menuSpriteScale = (pixelScaleFactor, originalPixelSize) => (originalPixelSize * (pixelScaleFactor / 64)); // Assume all menu sprites done at 64 pixel psf.

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

utils.translatePlayerOptions = (options, bitA, bitB) => {
	options.hasJumpField = (bitA & 0x04) != 0;
	options.hasPullField = (bitA & 0x02) != 0;
	//canSlowTime: true, Don't have enough bits for this. Assume always true.
	
	options.hasShotgun = (bitA & 0x01) != 0;
	options.shotgunStartsWithAmmo = (bitB & 0x80) != 0;
	options.hasLauncher = (bitB & 0x40) != 0;
	options.launcherStartsWithAmmo = (bitB & 0x20) != 0;
	options.hasTesla = (bitB & 0x10) != 0;
	options.teslaStartsWithAmmo = (bitB & 0x08) != 0;
	
	options.startingAmmo = (bitB & 0x07);	// 3 bits, 0-7. In-game-max of 6?
	if (options.startingAmmo > 6) { options.startingAmmo = 6; }
}

module.exports = utils;