'use strict';

const gulp = require('gulp');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const config = require('./app.config');

gulp.task('build-styles', () => {
	return gulp.src('./dev/scss/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('./build'));
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
			baseDir: './build/'
		},
		files: ['./build/scripts/*.js', './build/*.css', './build/*.html']
	}, cb);
});

gulp.task('watch', cb => {
	gulp.watch('./dev/scss/*.scss', gulp.series('build-styles'));

	gulp.watch('./dev/scripts/**/*.js', gulp.series('build-scripts'));

	cb();
});

gulp.task('__build', gulp.parallel('build-styles', 'build-scripts'));
gulp.task('__dev', gulp.series('__build', 'browser-sync', 'watch'));
