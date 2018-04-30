const gulp = require('gulp');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const streamify = require('gulp-streamify');
const gutil = require('gulp-util');
const eslint = require('gulp-eslint');
const flow = require('gulp-flowtype');
const execSync = require('child_process').execSync;
const flowRemoveTypes = require('flow-remove-types');

/* eslint comma-dangle: ["error", "never"] */

gulp.task('es6', () => {
  try {
    execSync('./node_modules/.bin/flow', { stdio: 'inherit' });
  } catch (e) {
    gulp.stop();
  }

  browserify({
    entries: ['./src/index.js'],
    debug: true
  })
    .transform(babelify, { presets: ['es2015', 'stage-0'] })
    .on('error', gutil.log)
    .bundle()
    .on('error', gutil.log)
    .pipe(source('dist/queue.js'))
    .pipe(gulp.dest(''));

  // gulp
  //   .src(["dist/queue.js"])
  //   .on('error', (e) => { console.log(e) })
  //   .pipe(streamify(uglify()))
  //   .pipe(rename("queue.min.js"))
  //   .pipe(gulp.dest("./dist"));
});

gulp.task('lint', () =>
  // ESLint ignores files with "node_modules" paths.
  // So, it's best to have gulp ignore the directory as well.
  // Also, Be sure to return the stream from the task;
  // Otherwise, the task may end before the stream has finished.
  gulp
    .src(['src/**/*.js', '!node_modules/**'])
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
    .pipe(eslint.format())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    //  .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    .pipe(eslint.failAfterError())
  );

gulp.task('stripTypes', () => {
  const files = [
    'adapters/localforage.js',
    'adapters/inmemory.js',
    'enum/log.events.js',
    'enum/config.data.js',
    'config.js',
    'container.js',
    'event.js',
    'index.js',
    'queue.js',
    'storage-capsule.js',
    'utils.js',
    'helpers.js'
  ];

  for (file of files) {
    const a = [
      `./node_modules/.bin/babel  --plugins transform-flow-strip-types src/${file} > lib/${file}`,
      { stdio: 'inherit' }
    ];

    execSync(...a);
  }
});
gulp.task('watch', () => {
  gulp.watch('src/**/*.js', ['lint', 'es6', 'stripTypes']);
});

gulp.task('default', ['lint', 'watch']);
