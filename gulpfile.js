'use strict';

const gulp = require('gulp');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const config = require('./app.config');

gulp.task('build-styles', () => {
	return gulp.src(`${config.stylesDevPath}/*.scss`)
		.pipe(sass())
		.pipe(gulp.dest(`${config.buildFolder}`));
});

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
			baseDir: `${config.buildFolder}/`
		},
		files: [`${config.scriptsBuildPath}.js`, `${config.buildFolder}/*.css`, `${config.buildFolder}/*.html`]
	}, cb);
});

gulp.task('watch', cb => {
	gulp.watch(`${config.stylesDevPath}/*.scss`, gulp.series('build-styles'));

	gulp.watch(`${config.scriptsDevPath}/*.js`, gulp.series('build-scripts'));

	cb();
});

gulp.task('__build', gulp.parallel('build-styles', 'build-scripts'));
gulp.task('__dev', gulp.series('__build', 'browser-sync', 'watch'));
