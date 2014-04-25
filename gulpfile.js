var gulp = require('gulp'),
    lr = require('gulp-livereload'),
    opn = require('opn'),
    chalk = require('chalk'),
    dest = 'src',
    bower = 'bower_components';

gulp.task('server', function(next) {
  var connect = require('connect'),
      server = connect(),
      host = 'localhost',
      port = process.env.PORT || 8080;

  server
    .use(connect.static(dest))
    .use(connect.static(bower))
    .listen(port, next)
    .on('listening', function () {
        console.log(chalk.green('Started dev server on http://' + host + ':' + port));
        opn('http://' + host + ':' + port);
    });
});

gulp.task('watch', ['server'], function() {
  var server = lr();
  gulp.watch(dest + '/**').on('change', function(file) {
    server.changed(file.path);
  });
});
