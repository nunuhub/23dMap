const gulp = require('gulp');
const javascriptObfuscator = require('gulp-javascript-obfuscator');
const streamToPromise = require('stream-to-promise');

// 编译混淆js文件
gulp.task(
  'obfuscator-map',
  gulp.series(function () {
    const stream = gulp
      .src('../lib/map-core/**/*.js')
      .pipe(
        javascriptObfuscator({
          stringArray: false
        })
      )
      // 另存压缩后文件
      .pipe(gulp.dest('../lib/map-core'));
    return streamToPromise(stream);
  })
);

gulp.task(
  'obfuscator-earth',
  gulp.series(function () {
    const stream = gulp
      .src('../lib/earth-core/**/*.js')
      .pipe(
        javascriptObfuscator({
          stringArray: false
        })
      )
      // 另存压缩后文件
      .pipe(gulp.dest('../lib/earth-core'));
    return streamToPromise(stream);
  })
);

// 拷贝src_temp/earth-core/Assets到src/earth-core/Assets
gulp.task(
  'copy-earth-assets',
  gulp.series(function () {
    const stream = gulp
      .src('../src_temp/earth-core/Assets/**')
      .pipe(gulp.dest('../src/earth-core/Assets'));
    return streamToPromise(stream);
  })
);

gulp.task(
  'default',
  gulp.series('obfuscator-map', 'obfuscator-earth', 'copy-earth-assets')
);
