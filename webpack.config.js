'use strict';

const NODE_ENV = process.env.NODE_ENV || 'development';
const webpack = require('webpack');
const path = require('path');
const config = require('./app.config');

const plugins = [
	new webpack.DefinePlugin({
		NODE_ENV: JSON.stringify(NODE_ENV)
	}),
	new webpack.optimize.CommonsChunkPlugin({
		name: 'common'
	})
];

module.exports = {
	context: path.join(__dirname, `/${config.scriptsDevPath}`),
	entry: {
		main: './main'
	},
	output: {
		path: __dirname + `/${config.scriptsBuildPath}`,
		filename: '[name].js'
	},
	watch: false,
	devtool: NODE_ENV === 'development' ? 'inline-source-map' : null,
	plugins: plugins,
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel'
		}]
	}
};

if (NODE_ENV === 'production') {
	module.exports.plugins.push(
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		})
	);
}
