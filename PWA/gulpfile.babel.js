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
var fancylog = require('fancy-log');
var uglifyJs    = require('gulp-uglify');
var minifyCss   = require('gulp-minify-css');
var htmlmin     = require('gulp-htmlmin');
var packageJson = require('./package.json');
var swPrecache  = require('sw-precache');
var jsdoc = require('gulp-jsdoc3');

var DEPLOYMENT_ROOT = '';//'/alpha/public_html/';

var JS_DIR = 'js';
var CSS_DIR = 'css';
var CSS_DIR_PANEL = 'panelCss';
var ICO_DIR = 'ico';
var JS_LIB_DIR = 'jsLibraries';
var MANIFEST_FILE = 'manifest.json';

var DEV_DIR = 'src';
var DEV_JS_DIR = path.join(DEV_DIR, JS_DIR);
var DEV_JS_LIB_DIR = path.join(DEV_DIR, JS_LIB_DIR);
var DEV_CSS_DIR = path.join(DEV_DIR, CSS_DIR);
var DEV_CSS_DIR_PANEL = path.join(DEV_DIR, CSS_DIR_PANEL);
var DEV_ICO_DIR = path.join(DEV_DIR, ICO_DIR);
var DEV_MANIFEST_SRC = path.join(DEV_DIR, MANIFEST_FILE);
var DEV_JS_SRC = [
    'gyronorm.complete.js',             'utils.js',
    'data/Item.js',                     'data/Period.js',
    'data/Category.js',                 'app/NavBar.js',
    'app/ResourcesProvider.js',         'pages/Page.js',
    'api/ApiService.js',                'api/ApiAjaxAdapter.js',
    'api/ApiAjaxRequest.js',
    'pages/EmergencyPage.js',           'map/DirectionsPanel.js',
    'map/ItemsDrawer.js',               'map/RouteDrawer.js',
    'map/UserDrawer.js',                'map/UserTracker.js',
    'map/VoiceSynthesizer.js',          'map/RouteGuide.js',
    'map/DirectionsManager.js',         'map/MapItemsManager.js',
    'map/ItemsMap.js',                  'map/geo/AOSCompass.js',
    'map/geo/DOACompass.js',            'map/geo/DOCompass.js',
    'map/geo/Geolocator.js',            'pages/MapPage.js',
    'pages/GridPage.js',                'pages/CategoriesGridPage.js',
    'pages/ListPage.js',                'pages/HomePage.js',
    'app/App.js',                       'app/Router.js',
    'main.js',                          'service-worker-registration.js'
];
var DEV_JS_SRC_PANEL = [
    'utils.js',
    'data/Item.js',                     'data/Period.js',
    'data/Category.js',                 
    'app/ResourcesProvider.js',
    'api/ApiService.js',                'api/ApiAjaxAdapter.js',
    'api/ApiAjaxRequest.js',
    'panel/Panel.js',                   'panel/ItemsPanel.js',
    'panel/ImageModal.js',
    'panel/login.js'
];
var DEV_CSS_SRC = path.join(DEV_CSS_DIR, '*.css');
var DEV_CSS_SRC_PANEL = path.join(DEV_CSS_DIR_PANEL, '*.css');
var DEV_HTML_SRC = path.join(DEV_DIR, '*.html');
var DEV_ICO_SRC = [path.join(DEV_ICO_DIR, '**/*.png'),
                   path.join(DEV_ICO_DIR, '**/*.jpg')];
var DEV_OTHER_SRC = [path.join(DEV_DIR, '*.png'),
                     path.join(DEV_DIR, 'favicon.ico'),
                     path.join(DEV_DIR, 'browserconfig.xml'),
                     path.join(DEV_DIR, 'safari-pinned-tab.svg')];
var DEV_JS_LIBRARIES = path.join(DEV_JS_LIB_DIR, '*.js');

var DIST_DIR = 'dist';
var DIST_JS_DIR = path.join(DIST_DIR, JS_DIR);
var DIST_JS_FILE = 'javascript.min.js';
var DIST_JS_FILE_PANEL = 'javascript.panel.min.js';
var DIST_CSS_DIR = path.join(DIST_DIR, CSS_DIR);
var DIST_CSS_FILE = 'style.min.css';
var DIST_CSS_FILE_PANEL = 'style.panel.min.css';
var DIST_ICO_DIR = path.join(DIST_DIR, ICO_DIR);
var SERVICE_WORKER_NAME = 'cache-service-worker.js';

// Add DEV_DIR to the JS_SRC
for(var idx in DEV_JS_SRC) {
    DEV_JS_SRC[idx] = path.join(DEV_JS_DIR, DEV_JS_SRC[idx]);
}
// Add DEV_DIR to the JS_SRC_PANEL
for(var idx in DEV_JS_SRC_PANEL) {
    DEV_JS_SRC_PANEL[idx] = path.join(DEV_JS_DIR, DEV_JS_SRC_PANEL[idx]);
}

// Correct deployment root end
if(DEPLOYMENT_ROOT.endsWith("/")) {
    DEPLOYMENT_ROOT = DEPLOYMENT_ROOT.substring(0, DEPLOYMENT_ROOT.length-1);
}

function writeServiceWorkerFile(handleFetch, callback) {
  var config = {
    cacheId: packageJson.name,
    // If handleFetch is false, then
    // the service worker will precache resources but won't actually serve them.
    handleFetch: handleFetch,
    logger: fancylog,
    runtimeCaching: [{
      //https://googlechromelabs.github.io/sw-toolbox/api.html
      // use the get param "no_cache" to avoid this cache
      urlPattern: /api_v1[^?]*($|\?(((?!no_cache).)*(=[^&]*&?)?)*$)/,
      handler: 'fastest',
      options: {
        debug: handleFetch,
        cache: {
          name: 'api-cache'
        }
      }
    }],
    staticFileGlobs: [
      DIST_DIR + '/css/style.min.css',
      DIST_DIR + '/index.html',
      DIST_DIR + '/favicon.ico',
      DIST_DIR + '/**.png',
      DIST_DIR + '/ico/categories/*.png',
      DIST_DIR + '/ico/costandlanguage/*.png',
      DIST_DIR + '/ico/mainmenu/*.png',
      DIST_DIR + '/js/javascript.min.js'
    ],
    navigateFallback: DEPLOYMENT_ROOT + '/index.html',
    navigateFallbackWhitelist: [/^\/?$/],
    stripPrefix: DIST_DIR + '/',
    replacePrefix: DEPLOYMENT_ROOT + '/',
    verbose: true
  };

  swPrecache.write(path.join(DIST_DIR, SERVICE_WORKER_NAME), config, callback);
}

gulp.task('default', ['build']);

gulp.task('watch', function() {
   gulp.watch(DEV_JS_SRC, ['dist-javascript']);
   gulp.watch(DEV_JS_SRC_PANEL, ['dist-javascript-panel']);
   gulp.watch(DEV_CSS_SRC, ['dist-css']);
   gulp.watch(DEV_CSS_SRC_PANEL, ['dist-css-panel']);
   gulp.watch(DEV_HTML_SRC, ['dist-html']);
   gulp.watch(DEV_MANIFEST_SRC, ['dist-manifest']);
   gulp.watch(DEV_OTHER_SRC, ['dist-other']);
});

gulp.task('build', function(callback) {
  runSequence(
  'dist-javascript', 'dist-libraries', 'dist-javascript-panel', 'dist-css', 'dist-css-panel', 'dist-html',
  'dist-ico', 'dist-other', 'dist-manifest', callback);
});

gulp.task('clean-build', function(callback) {
  runSequence(
  'clean-all', 'build', callback);
});

gulp.task('dist-javascript', function() {
  return gulp.src(DEV_JS_SRC)
    .pipe(sourcemaps.init({largeFile: true}))
      .pipe(concat(DIST_JS_FILE))
      .pipe(babel())
      .pipe(uglifyJs({mangle: true}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.join(DIST_DIR, 'js')));  // saved in the DIST folder
});

gulp.task('dist-javascript-panel', function(){
  return gulp.src(DEV_JS_SRC_PANEL)
    .pipe(sourcemaps.init({largeFile: true}))
      .pipe(concat(DIST_JS_FILE_PANEL))
      .pipe(babel())
      .pipe(uglifyJs({mangle: true}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.join(DIST_DIR, 'js')));  // saved in the DIST folder
    
});

gulp.task('dist-libraries', function() {
    return gulp.src(DEV_JS_LIBRARIES)
    .pipe(gulp.dest(path.join(DIST_DIR, 'js')));  // saved in the DIST folder
});

gulp.task('dist-css', function(){
  return gulp.src(DEV_CSS_SRC)
    .pipe(concat(DIST_CSS_FILE))
    .pipe(minifyCss())
    .pipe(gulp.dest(path.join(DIST_DIR, 'css')));
});

gulp.task('dist-css-panel', function(){
  return gulp.src(DEV_CSS_SRC_PANEL)
    .pipe(concat(DIST_CSS_FILE_PANEL))
    .pipe(minifyCss())
    .pipe(gulp.dest(path.join(DIST_DIR, 'css')));
});

gulp.task('clean-ico', function() {
    gulp.src(DIST_ICO_DIR)
    .pipe(clean());
});

gulp.task('dist-ico', function() {
 gulp.src(DEV_ICO_SRC)
 //.pipe(imagemin()) // imagemin minimizes the images
 .pipe(gulp.dest(DIST_ICO_DIR));
});

gulp.task('clean-all', function() {
  gulp.src(DIST_DIR)
  .pipe(clean());
});

gulp.task('dist-other', function() {
  gulp.src(DEV_OTHER_SRC)
  .pipe(gulp.dest(DIST_DIR));
});

gulp.task('dist-html', function(){
  return gulp.src(DEV_HTML_SRC)
    .pipe(replace(/\{\{ROOT\}\}/g, DEPLOYMENT_ROOT))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('dist-manifest', function(){
  return gulp.src(DEV_MANIFEST_SRC)
    .pipe(replace(/\{\{ROOT\}\}/g, DEPLOYMENT_ROOT))
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('generate-service-worker-dist', function(callback) {
  writeServiceWorkerFile(true, callback);
});

gulp.task('generate-service-worker-dev', function(callback) {
  writeServiceWorkerFile(false, callback);
});

gulp.task('jsdoc', function(cb){
   var config = require('./jsdoc.json');
   gulp.src('./out/').pipe(clean());
   gulp.src(DEV_JS_SRC, {read: false})
       .pipe(jsdoc(config, cb));
});