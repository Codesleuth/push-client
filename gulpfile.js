var gulp = require('gulp'),
    del = require('del'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream');

gulp.task('clean:dist', function (cb) {
  del(['dist/**'], cb);
});

gulp.task('copy:socket.io', function(){
  gulp.src('node_modules/socket.io-client/socket.io.js')
      .pipe(gulp.dest('dist'));
});
 
gulp.task('build', function() {
  return browserify('./index.js', {
    insertGlobals: false,
    bundleExternal: false,
    standalone: 'pushclient'
  })
  .bundle()
  .pipe(source('push-client.js'))
  .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['clean:dist', 'build', 'copy:socket.io']);