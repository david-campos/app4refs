/**
 * gulpfile.js for app4refs/PWA.
 * 'watch' will not update the service worker file nor the icons!
 * Author: David Campos R. <david.campos.r96@gmail.com>
 */

var babel       = require('gulp-babel');
var gulp        = require('gulp');
var path        = require('path');
var runSequence = require('run-sequence');
var replace = require('gulp-replace');
var concat      = require('gulp-concat');
var sourcemaps  = require('gulp-sourcemaps');
var clean = require('gulp-clean');
var uglifyJs    = require('gulp-uglify');
var minifyCss   = require('gulp-minify-css');
var htmlmin     = require('gulp-htmlmin');
var packageJson = require('./package.json');
var jsdoc = require('gulp-jsdoc3');

var DEPLOYMENT_ROOT = '';

var JS_DIR = 'js';
var CSS_DIR = 'css';
var IMG_DIR = 'img';

var DEV_DIR = 'src';
var DEV_JS_DIR = path.join(DEV_DIR, JS_DIR);
var DEV_CSS_DIR = path.join(DEV_DIR, CSS_DIR);
var DEV_IMG_DIR = path.join(DEV_DIR, IMG_DIR);

var DEV_JS_SRC = [];
var DEV_CSS_SRC = path.join(DEV_CSS_DIR, '*.css');
var DEV_HTML_SRC = path.join(DEV_DIR, '*.html');
var DEV_IMG_SRC = path.join(DEV_IMG_DIR, '*.png');

var DIST_DIR = 'dist';
var DIST_JS_DIR = path.join(DIST_DIR, JS_DIR);
var DIST_JS_FILE = 'panel-javascript.min.js';
var DIST_CSS_DIR = path.join(DIST_DIR, CSS_DIR);
var DIST_CSS_FILE = 'panel-style.min.css';
var DIST_IMG_DIR = path.join(DIST_DIR, IMG_DIR);

// Add DEV_DIR to the JS_SRC
for(var idx in DEV_JS_SRC) {
    DEV_JS_SRC[idx] = path.join(DEV_JS_DIR, DEV_JS_SRC[idx]);
}

// Correct deployment root end
if(DEPLOYMENT_ROOT.endsWith("/")) {
    DEPLOYMENT_ROOT = DEPLOYMENT_ROOT.substring(0, DEPLOYMENT_ROOT.length-1);
}

gulp.task('default', ['build']);

gulp.task('watch', function() {
   gulp.watch(DEV_JS_SRC, ['dist-javascript']);
   gulp.watch(DEV_CSS_SRC, ['dist-css']);
   gulp.watch(DEV_HTML_SRC, ['dist-html']);
   gulp.watch(DEV_IMG_SRC, ['dist-img']);
});

gulp.task('build', function(callback) {
  runSequence(
  'dist-javascript', 'dist-css', 'dist-html', 'dist-img', callback);
});

gulp.task('clean-build', function(callback) {
  runSequence(
  'clean-all',
  'dist-javascript', 'dist-css', 'dist-html', 'dist-img', callback);
});

gulp.task('dist-javascript', function(){
  return gulp.src(DEV_JS_SRC)
    .pipe(sourcemaps.init({largeFile: true}))
      .pipe(concat(DIST_JS_FILE))
      .pipe(babel())
      .pipe(uglifyJs({mangle: true}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.join(DIST_DIR, 'js')));  // saved in the DIST folder
});

gulp.task('dist-css', function(){
  return gulp.src(DEV_CSS_SRC)
    .pipe(concat(DIST_CSS_FILE))
    .pipe(minifyCss())
    .pipe(gulp.dest(path.join(DIST_DIR, 'css')));
});

gulp.task('clean-all', function() {
  gulp.src(DIST_DIR)
  .pipe(clean());
});

gulp.task('dist-html', function(){
  return gulp.src(DEV_HTML_SRC)
    //.pipe(concat('exampleallhtml.html'))
    .pipe(replace(/\{\{ROOT\}\}/g, DEPLOYMENT_ROOT))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('dist-img', function() {
    return gulp.src(DEV_IMG_SRC)
        .pipe(gulp.dest(DIST_IMG_DIR));
});

gulp.task('jsdoc', function(cb){
   var config = require('./jsdoc.json');
   gulp.src('./out/').pipe(clean());
   gulp.src(DEV_JS_SRC, {read: false})
       .pipe(jsdoc(config, cb));
});