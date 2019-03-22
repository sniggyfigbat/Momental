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