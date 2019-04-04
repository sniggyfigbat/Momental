const path = require('path');
const webpack = require('webpack');

module.exports = [
	{
		name: 'momental',
		mode: 'production',
		//node: {
		//  fs: 'empty'
		//},
		//'externals': {
		//	'fs': "require('fs')"
		//}
		entry: {
			'app': './client/app.js'
		},
		output: {
			path: path.resolve(__dirname, 'public'),
			filename: 'bundle.js'
		},
		optimization: {
			minimize: false
		}
	},
	{
		name: 'static_planck',
		mode: 'production',
		entry: {
			'planck': './node_modules/planck-js/lib/index.js'
		},
		output: {
			library: 'planck',
			path: path.resolve(__dirname, 'public', 'lib'),
			filename: 'planck.js'
		},
		optimization: {
			minimize: false
		},
		plugins: [
			new webpack.DefinePlugin({
				DEBUG: JSON.stringify(false),
				ASSERT: JSON.stringify(true),
			}),
		]
	},
	{
		name: 'static_pixi',
		mode: 'production',
		entry: {
			'pixi': './node_modules/pixi.js/lib/pixi.js'
		},
		output: {
			library: 'PIXI',
			path: path.resolve(__dirname, 'public', 'lib'),
			filename: 'pixi.js'
		},
		optimization: {
			minimize: false
		},
		module: {
			rules: [
				{
					test: /\.json$/,
					loader: 'json'
				},
				{
					enforce: 'post',
					include: path.resolve(__dirname, 'node_modules/pixi.js'),
					loader: 'transform-loader?brfs'
				}
			]
		}
	}
]