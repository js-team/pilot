const NODE_ENV = process.env.NODE_ENV || 'development';
const webpack = require('webpack');
const path = require('path');

const plugins = [
	new webpack.DefinePlugin({
		NODE_ENV: JSON.stringify(NODE_ENV)
	}),
	new webpack.optimize.CommonsChunkPlugin({
		name: 'common'
	})
];

module.exports = {
	context: path.join(__dirname, '/dev/scripts'),
	entry: {
		main: './main'
	},
	output: {
		path: __dirname + '/build/scripts',
		filename: '[name].js'
	},
	watch: false,
	devtool: NODE_ENV === 'development' ? 'inline-source-map' : null,
	plugins: plugins,
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel',
			query: {
				presets: ['es2015']
			}
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
