const gulp = require('gulp');
const streamToPromise = require('stream-to-promise');

// 拷贝src_temp/earth-core到src/earth-core
gulp.task(
  'in',
  gulp.series(function () {
    const stream = gulp
      .src('../src_temp/earth-core/**')
      .pipe(gulp.dest('../src/earth-core'));
    return streamToPromise(stream);
  })
);

gulp.task('default', gulp.series('in'));
