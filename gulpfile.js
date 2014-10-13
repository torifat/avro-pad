var gulp        = require('gulp'),
    del         = require('del'),
    rev         = require('gulp-rev'),
    lr          = require('gulp-livereload'),
    useref      = require('gulp-useref'),
    filter      = require('gulp-filter'),
    uglify      = require('gulp-uglify'),
    manifest    = require('gulp-manifest'),
    filesize    = require('gulp-filesize'),
    minifyCss   = require('gulp-minify-css'),
    revReplace  = require('gulp-rev-replace'),
    opn         = require('opn'),
    chalk       = require('chalk'),
    connect     = require('connect'),
    serveStatic = require('serve-static');

// Config Variables
var src   = 'src',
    build = 'build',
    host  = 'localhost';

// Create a connect Server
function server(host, port, path, next) {
  connect()
    .use(serveStatic(path))
    .listen(port, next)
    .on('listening', function () {
        console.log(chalk.green('Started dev server on http://' + host + ':' + port));
        opn('http://' + host + ':' + port);
    });
}

// Tasks
gulp.task('server', function (next) {
  server(host, process.env.DEVPORT || 8080, src, next);
});

gulp.task('clean', function (next) {
  del(build, next);
});

gulp.task('images', ['clean'], function () {
  return gulp.src(src + '/images/**', {base: src})
    .pipe(gulp.dest(build));
});

gulp.task('manifest', ['assets'], function (){
  gulp.src([build + '/**'])
    .pipe(manifest({
      hash         : true,
      preferOnline : true,
      network      : ['http://*', 'https://*', '*'],
      filename     : 'app.appcache',
      exclude      : ['app.appcache', 'index.html', 'images/avroim_og.jpg']
     }))
    .pipe(gulp.dest(build));
});

gulp.task('assets', ['clean', 'images'], function () {
  var jsFilter     = filter('**/*.js'),
      cssFilter    = filter('**/*.css'),
      userefAssets = useref.assets();

  return gulp.src(src + '/*.html')
    .pipe(userefAssets)
    .pipe(jsFilter)
    .pipe(uglify())
    .pipe(filesize())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe(minifyCss())
    .pipe(filesize())
    .pipe(cssFilter.restore())
    .pipe(rev())
    .pipe(userefAssets.restore())
    .pipe(useref())
    .pipe(revReplace())
    .pipe(gulp.dest(build));
});

gulp.task('watch', ['server'], function () {
  var server = lr();
  gulp.watch(src + '/**').on('change', function (file) {
    server.changed(file.path);
  });
});

gulp.task('build', ['images', 'assets', 'manifest']);

gulp.task('default', ['build'], function (next) {
  server(host, process.env.PORT || 8888, build, next);
});
