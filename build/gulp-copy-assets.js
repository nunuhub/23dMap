const gulp = require('gulp');
const streamToPromise = require('stream-to-promise');

// 拷贝assets/tdt到lib/assets/tdt
gulp.task(
  'copy-tdt',
  gulp.series(function () {
    const stream = gulp
      .src('../src/assets/tdt/**')
      .pipe(gulp.dest('../lib/assets/tdt'));
    return streamToPromise(stream);
  })
);

// 拷贝src/earth-core/Assets/tdt到lib/earth-core/Asset
gulp.task(
  'copy-earth-assets',
  gulp.series(function () {
    const stream = gulp
      .src('../src/earth-core/Assets/**')
      .pipe(gulp.dest('../lib/earth-core/Assets'));
    return streamToPromise(stream);
  })
);

// 拷贝src/map-core/Editor/img到lib/map-core/Editor/img
gulp.task(
  'copy-map-editor-img',
  gulp.series(function () {
    const stream = gulp
      .src('../src/map-core/Editor/img/**')
      .pipe(gulp.dest('../lib/map-core/Editor/img'));
    return streamToPromise(stream);
  })
);

// 拷贝src/map-core/Editor/style到lib/map-core/Editor/style
gulp.task(
  'copy-map-editor-style',
  gulp.series(function () {
    const stream = gulp
      .src('../src/map-core/Editor/style/**')
      .pipe(gulp.dest('../lib/map-core/Editor/style'));
    return streamToPromise(stream);
  })
);

gulp.task(
  'default',
  gulp.series(
    'copy-tdt',
    'copy-earth-assets',
    'copy-map-editor-img',
    'copy-map-editor-style'
  )
);
