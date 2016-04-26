'use strict';

const gulp = require('gulp');
const webpack = require('webpack');
const path = require('path');
const webpackConfig = require('./webpack.config');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const config = require('./app.config');

gulp.task('copy-base', cb => {
	gulp.src(path.resolve(__dirname, `${config.base.entry}/*`))
		.pipe(gulp.dest(path.resolve(__dirname, `${config.base.output}`)))

	cb();
});

gulp.task('build-styles', () => (
	gulp.src(path.resolve(__dirname, `${config.styles.entry}/*.scss`))
		.pipe(sass())
		.pipe(gulp.dest(path.resolve(__dirname, `${config.base.output}`)))
));

gulp.task('build-scripts', cb => {
	webpack(webpackConfig, (err, stats) => {
		if (err) {
			console.log(err);
			console.log(stats);
		}

		cb();
	});
});

gulp.task('browser-sync', cb => {
	browserSync.init({
		server: {
			baseDir: path.resolve(__dirname, `${config.base.output}/`)
		},
		files: [path.resolve(__dirname, `${config.scripts.output}/*.js`), path.resolve(__dirname, `${config.base.output}/*.*`)]
	}, cb);
});

gulp.task('watch', cb => {
	gulp.watch(path.resolve(__dirname, `${config.styles.entry}/*.scss`), gulp.series('build-styles'));

	cb();
});

gulp.task('__build', gulp.parallel('copy-base', 'build-styles', 'build-scripts'));
gulp.task('__dev', gulp.series('__build', 'browser-sync', 'watch'));
