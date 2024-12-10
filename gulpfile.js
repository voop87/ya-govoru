const gulp = require('gulp');
require('./gulp/dev');
require('./gulp/prod');

gulp.task('default', gulp.series(
  'clean:dev',
  gulp.parallel('html:dev', 'sass:dev', 'images:dev', 'fonts:dev'),
  'js:dev',
  gulp.parallel('server:dev', 'watch:dev')
));

gulp.task('prod', gulp.series(
  'clean:prod',
  gulp.parallel('html:prod', 'sass:prod', 'images:prod', 'fonts:prod'),
  'js:prod'
));