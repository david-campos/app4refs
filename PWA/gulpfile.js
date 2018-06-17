var gulp = require('gulp');
var packageJson = require('package.json');
var swPrecache = require('lib/sw-precache.js');

var DEV_DIR = 'src';
var DIST_DIR = 'dist';

function writeServiceWorkerFile(rootDir, handleFetch, callback) {
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
    //logger: $.util.log,
    runtimeCaching: [{
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
    }],
    staticFileGlobs: [
      rootDir + '/css/**.css',
      rootDir + '/**.html',
      rootDir + '/images/**.*',
      rootDir + '/js/**.js'
    ],
    stripPrefix: rootDir + '/',
    // log more
    verbose: true
  };

  swPrecache.write(path.join(rootDir, 'service-worker.js'), config, callback);
}

gulp.task('default', ['build']);

gulp.task('generate-service-worker-dist', function(callback) {
  writeServiceWorkerFile(DIST_DIR, true, callback);
});

gulp.task('generate-service-worker-dev', function(callback) {
  writeServiceWorkerFile(DEV_DIR, false, callback);
});

gulp.task('build', function(callback) {
  runSequence('copy-dev-to-dist', 'generate-service-worker-dist', callback);
});

gulp.task('copy-dev-to-dist', function() {
  return gulp.src(DEV_DIR + '/**')
    .pipe(gulp.dest(DIST_DIR));
});