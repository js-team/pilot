'use strict';

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
const webpack = require('webpack');
const path = require('path');
const config = require('./app.config');

const plugins = [
	new webpack.optimize.CommonsChunkPlugin({
		name: 'common'
	})
];

if (!isDevelopment) {
	module.exports.plugins.push(
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		})
	);
}

module.exports = {
	entry: path.resolve(__dirname, `${config.scripts.entry}/main.js`),
	output: {
		path: path.resolve(__dirname, `${config.scripts.output}`),
		filename: '[name].js'
	},
	watch: isDevelopment,
	devtool: isDevelopment ? 'inline-source-map' : null,
	plugins: plugins,
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel'
		}]
	}
};
