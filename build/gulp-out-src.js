const gulp = require('gulp');
const streamToPromise = require('stream-to-promise');

// 拷贝src/earth-core到src_temp/earth-core
gulp.task(
  'out',
  gulp.series(function () {
    const stream = gulp
      .src('../src/earth-core/**')
      .pipe(gulp.dest('../src_temp/earth-core'));
    return streamToPromise(stream);
  })
);

gulp.task('default', gulp.series('out'));
