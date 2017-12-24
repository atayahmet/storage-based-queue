var gulp = require("gulp");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var browserify = require("browserify");
var babelify = require("babelify");
var source = require("vinyl-source-stream");
var streamify = require("gulp-streamify");
var gutil = require("gulp-util");
const flow = require("gulp-flowtype");
var execSync = require("child_process").execSync;
var flowRemoveTypes = require("flow-remove-types");

gulp.task("es6", function() {
  try {
    execSync("./node_modules/.bin/flow", { stdio: "inherit" });
  } catch (e) {
    gulp.stop();
  }

  browserify({
    entries: ["./dev/index.js"],
    debug: true
  })
    .transform(babelify, { presets: ["es2015", "stage-0"] })
    .on("error", gutil.log)
    .bundle()
    .on("error", gutil.log)
    .pipe(source("dist/queue.js"))
    .pipe(gulp.dest(""));

  gulp
    .src(["dist/queue.js"])
    .pipe(streamify(uglify()))
    .pipe(rename("queue.min.js"))
    .pipe(gulp.dest("./dist"));
});

gulp.task("stripTypes", function() {
  const files = [
    "storage/localstorage.js",
    "config.data.js",
    "config.js",
    "container.js",
    "event.js",
    "index.js",
    "queue.js",
    "storage-capsule.js",
    "utils.js"
  ];

  for (file of files) {
    execSync(
      "./node_modules/.bin/babel  --plugins transform-flow-strip-types dev/" +
        file +
        " > lib/" +
        file,
      { stdio: "inherit" }
    );
  }
});
gulp.task("watch", function() {
  gulp.watch("dev/**/*.js", ["es6", "stripTypes"]);
});

gulp.task("default", ["es6", "watch"]);
