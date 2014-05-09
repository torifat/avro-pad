var gulp = require('gulp'),
    lr = require('gulp-livereload'),
    clean = require('gulp-clean'),
    useref = require('gulp-useref'),
    filter = require('gulp-filter'),
    uglify = require('gulp-uglify'),
    filesize = require('gulp-filesize'),
    minifyCss = require('gulp-minify-css'),
    opn = require('opn'),
    chalk = require('chalk'),
    connect = require('connect'),
    src = 'src',
    dist = 'dist',
    host = 'localhost';

gulp.task('server', function(next) {
  var server = connect(),
      port = process.env.DEVPORT || 8080;

  server
    .use(connect.static(src))
    .listen(port, next)
    .on('listening', function () {
        console.log(chalk.green('Started dev server on http://' + host + ':' + port));
        opn('http://' + host + ':' + port);
    });
});

gulp.task('clean', function () {
  return gulp.src(dist, {read: false})
    .pipe(clean());
});

gulp.task('assets', ['clean'], function () {
  return gulp.src([
      src + '/images/**',
      src + '/app.appcache'
    ], {base: src})
    .pipe(gulp.dest(dist));
});

gulp.task('build', ['clean', 'assets'], function () {
  var jsFilter = filter('**/*.js'),
      cssFilter = filter('**/*.css');

  return gulp.src(src + '/*.html')
    .pipe(useref.assets())
    .pipe(jsFilter)
    .pipe(uglify())
    .pipe(filesize())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe(minifyCss())
    .pipe(filesize())
    .pipe(cssFilter.restore())
    .pipe(useref.restore())
    .pipe(useref())
    .pipe(gulp.dest(dist));
});

gulp.task('watch', ['server'], function() {
  var server = lr();
  gulp.watch(src + '/**').on('change', function(file) {
    server.changed(file.path);
  });
});

gulp.task('default', ['build'], function (next) {
  var server = connect(),
      port = process.env.PORT || 8888;

  server
    .use(connect.static(dist))
    .listen(port, next)
    .on('listening', function () {
        console.log(chalk.green('Started server on http://' + host + ':' + port));
        opn('http://' + host + ':' + port);
    });
});
