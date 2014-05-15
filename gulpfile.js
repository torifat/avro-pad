var gulp = require('gulp'),
    rev = require('gulp-rev'),
    clean = require('gulp-clean'),
    lr = require('gulp-livereload'),
    useref = require('gulp-useref'),
    filter = require('gulp-filter'),
    uglify = require('gulp-uglify'),
    manifest = require('gulp-manifest'),
    filesize = require('gulp-filesize'),
    minifyCss = require('gulp-minify-css'),
    revReplace = require('gulp-rev-replace'),
    opn = require('opn'),
    chalk = require('chalk'),
    connect = require('connect'),
    src = 'src',
    build = 'build',
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
  return gulp.src(build, {read: false})
    .pipe(clean());
});

gulp.task('images', ['clean'], function () {
  return gulp.src(src + '/images/**', {base: src})
    .pipe(gulp.dest(build));
});

gulp.task('manifest', ['assets'], function(){
  gulp.src([build + '/**'])
    .pipe(manifest({
      hash: true,
      preferOnline: true,
      network: ['http://*', 'https://*', '*'],
      filename: 'app.manifest',
      exclude: ['app.manifest', 'images/avroim_og.jpg']
     }))
    .pipe(gulp.dest(build));
});

gulp.task('assets', ['clean', 'images'], function () {
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
    .pipe(rev())
    .pipe(useref.restore())
    .pipe(useref())
    .pipe(revReplace())
    .pipe(gulp.dest(build));
});

gulp.task('watch', ['server'], function() {
  var server = lr();
  gulp.watch(src + '/**').on('change', function(file) {
    server.changed(file.path);
  });
});

gulp.task('build', ['images', 'assets', 'manifest']);

gulp.task('default', ['build'], function (next) {
  var server = connect(),
      port = process.env.PORT || 8888;

  server
    .use(connect.static(build))
    .listen(port, next)
    .on('listening', function () {
        console.log(chalk.green('Started server on http://' + host + ':' + port));
        opn('http://' + host + ':' + port);
    });
});
