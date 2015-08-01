/**
*@author: ShiJianwen
*/

var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var livereload = require('gulp-livereload');

var nodemonConfig = {
	script: 'app.js'
};

gulp.task('serve', ['watch'], function() {
	return nodemon(nodemonConfig);
});

gulp.task('livereload', function() {
	gulp.src('app/**/*.*')
		.pipe(livereload());
});

gulp.task('watch', function() {
	livereload.listen();
	gulp.watch('app/**/*.*', ['livereload']);
});

gulp.task('start', ['serve', 'watch']);