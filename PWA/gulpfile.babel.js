/**
 * gulpfile.js for app4refs/PWA.
 * 'watch' will not update the service worker file!
 * Author: David Campos R. <david.campos.r96@gmail.com>
 */

var babel       = require('gulp-babel');
var gulp        = require('gulp');
var path        = require('path');
var runSequence = require('run-sequence');
var concat      = require('gulp-concat');
//var rename      = require('gulp-rename');
var sourcemaps  = require('gulp-sourcemaps');
//var babel       = require('gulp-babel');
var gutil = require('gulp-util');
var uglifyJs    = require('gulp-uglify');
var minifyCss   = require('gulp-minify-css');
var htmlmin     = require('gulp-htmlmin');
var packageJson = require('./package.json');
var swPrecache  = require('sw-precache');

var DEPLOYMENT_ROOT = '/alpha/public_html/';

var JS_DIR = 'js';
var CSS_DIR = 'css';

var DEV_DIR = 'src';
var DEV_JS_DIR = path.join(DEV_DIR, JS_DIR);
var DEV_CSS_DIR = path.join(DEV_DIR, CSS_DIR);
var DEV_JS_SRC = [
    'utils.js',
    'Item.js',
    'Period.js',
    'NavBar.js',
    'ResourcesProvider.js',
    'Page.js',
    'ApiService.js',
    'ApiAjaxAdapter.js',
    'EmergencyPage.js',
    'ItemsMap.js',
    'Geolocator.js',
    'MapPage.js',
    'GridPage.js',
    'CategoriesGridPage.js',
    'ListPage.js',
    'HomePage.js',
    'App.js',
    'Router.js',
    'main.js',
    'service-worker-registration.js'
    ];
var DEV_CSS_SRC = path.join(DEV_CSS_DIR, '*.css');
var DEV_HTML_SRC = path.join(DEV_DIR, '*.html');

var DIST_DIR = 'dist';
var DIST_JS_DIR = path.join(DIST_DIR, JS_DIR);
var DIST_JS_FILE = 'javascript.min.js';
var DIST_CSS_DIR = path.join(DIST_DIR, CSS_DIR);
var DIST_CSS_FILE = 'style.min.css';
var SERVICE_WORKER_NAME = 'cache-service-worker.js';

// Add DEV_DIR to the JS_SRC
for(var idx in DEV_JS_SRC) {
    DEV_JS_SRC[idx] = path.join(DEV_JS_DIR, DEV_JS_SRC[idx]);
}

function writeServiceWorkerFile(handleFetch, callback) {
  var config = {
    cacheId: packageJson.name,
    /*
    dynamicUrlToDependencies: {
      'dynamic/page1': [
        path.join(rootDir, 'views', 'layout.jade'),
        path.join(rootDir, 'views', 'page1.jade')
      ],
      'dynamic/page2': [
        path.join(rootDir, 'views', 'layout.jade'),
        path.join(rootDir, 'views', 'page2.jade')
      ]
    },
    */
    // If handleFetch is false, then
    // the service worker will precache resources but won't actually serve them.
    // This allows you to test precaching behavior without worry about the cache preventing your
    // local changes from being picked up during the development cycle.
    handleFetch: handleFetch,
    logger: gutil.log,
    /*runtimeCaching: [{
      // See https://github.com/GoogleChrome/sw-toolbox#methods
      urlPattern: /runtime-caching/,
      handler: 'cacheFirst',
      // See https://github.com/GoogleChrome/sw-toolbox#options
      options: {
        cache: {
          maxEntries: 1,
          name: 'runtime-cache'
        }
      }
    }],*/
    staticFileGlobs: [
      DIST_DIR + '/css/**.css',
      DIST_DIR + '/**.html',
      DIST_DIR + '/ico/**.*',
      DIST_DIR + '/js/**.js'
    ],
    stripPrefix: DIST_DIR + '/',
    replacePrefix: DEPLOYMENT_ROOT,
    // log more
    verbose: true
  };

  swPrecache.write(path.join(DIST_DIR, SERVICE_WORKER_NAME), config, callback);
}

gulp.task('default', ['build']);

gulp.task('watch', function() {
   gulp.watch(DEV_JS_SRC, ['dist-javascript']);
   gulp.watch(DEV_CSS_SRC, ['dist-css']);
   gulp.watch(DEV_HTML_SRC, ['dist-html']);
});

gulp.task('build', function(callback) {
  runSequence('dist-javascript', 'dist-css', 'dist-html', 'generate-service-worker-dist', callback);
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

gulp.task('dist-html', function(){
  return gulp.src(DEV_HTML_SRC)
    //.pipe(concat('exampleallhtml.html'))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('generate-service-worker-dist', function(callback) {
  writeServiceWorkerFile(true, callback);
});

gulp.task('generate-service-worker-dev', function(callback) {
  writeServiceWorkerFile(false, callback);
});