'use strict';

var gulp = require('gulp');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var config = require('./app.config');

gulp.task('build-styles', function() {
	return gulp.src('./dev/scss/styles.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('./build/styles'));
});

gulp.task('build-scripts', function(cb) {
	webpack(webpackConfig, function(err, stats) {
		if (err) {
			console.log(err);
			console.log(stats);
		}

		cb();
	});
});

gulp.task('server', function(cb) {
	browserSync.init({
		server: {
			baseDir: './build/'
		}
	}, cb);

	browserSync.watch('build/**/*.*').on('change', browserSync.reload);
});

gulp.task('watch', function(cb) {
	gulp.watch('./dev/scss/**/*.*', gulp.series('build-styles'));

	gulp.watch('./dev/scripts/**/*.js', gulp.series('build-scripts'));

	cb();
});

gulp.task('__build', gulp.parallel('build-styles', 'build-scripts'));
gulp.task('__dev', gulp.series('__build', 'server', 'watch'));
