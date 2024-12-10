const gulp = require('gulp');
const fileinclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const server = require('gulp-server-livereload');
const gulpClean = require('gulp-clean');
const fs = require('fs');
const sourceMaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const webpack = require('webpack-stream');
const babel = require('gulp-babel');
const changed = require('gulp-changed');
// const imagemin = require('gulp-imagemin');
// const webp = require('gulp-webp');
// const rename = require('gulp-rename');
// const svgstore = require('gulp-svgstore');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');

const plumberNotify = (title) => {
  return {
    errorHandler: notify.onError({
      title: title,
      message: 'Error <%= error.message %>',
      sound: false
    })
  }
};

gulp.task('clean:dev', function(done){
  if(fs.existsSync('./build/')) {
    return gulp.src('./build/', { read: false })
      .pipe(gulpClean())
  }
  done();
});

gulp.task('html:dev', function(){
  return gulp.src('./src/*.html')
    .pipe(changed('./build/', { hasChanged: changed.compareContents }))
    .pipe(plumber(plumberNotify('HTML')))
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./build/'))
});

gulp.task('sass:dev', function(){
  return gulp.src('./src/scss/*.scss')
    .pipe(changed('./build/css/'))
    .pipe(plumber(plumberNotify('Style')))
    .pipe(sourceMaps.init())
    .pipe(sass())
    .pipe(sourceMaps.write())
    .pipe(gulp.dest('./build/css/'))
});

gulp.task('images:dev', function(){
  return gulp.src('./src/images/**/*')
    .pipe(changed('./build/images/'))
    // .pipe(webp())
    // .pipe(gulp.dest('./build/images/'))
    // .pipe(gulp.src('./src/images/**/*'))
    // .pipe(imagemin({ verbose: true }))
    .pipe(gulp.dest('./build/images/'))
});

// gulp.task('createSprite:dev', function(){
//   return gulp.src('./src/images/icons/*.svg')
//     .pipe(changed('./build/images/'))
//     .pipe(svgstore({inlineSvg: true}))
//     .pipe(rename("sprite.svg"))
//     .pipe(gulp.dest('./build/images/'))
// });

gulp.task('fonts:dev', function(){
  return gulp.src('./src/fonts/**/*.ttf')
    .pipe(changed('./build/fonts/'))
    .pipe(ttf2woff())
    .pipe(gulp.dest('./build/fonts/'))
    .pipe(gulp.src('./src/fonts/**/*.ttf'))
    .pipe(ttf2woff2())
    .pipe(gulp.dest('./build/fonts/'))
});

gulp.task('js:dev', function(){
  return gulp.src('./src/js/*.js')
    .pipe(changed('./build/js/'))
    .pipe(plumber(plumberNotify('JS')))
    .pipe(babel())
    .pipe(webpack(require('../webpack.config')))
    .pipe(gulp.dest('./build/js/'))
});

gulp.task('server:dev', function(){
  return gulp.src('./build/')
    .pipe(server({
      livereload: true,
      open: true
    }))
});

gulp.task('watch:dev', function(){
  gulp.watch('./src/**/*.html', gulp.series('html:dev'));
  gulp.watch('./src/scss/**/*.scss', gulp.series('sass:dev'));
  gulp.watch('./src/images/**/*', gulp.series('images:dev'));
  // gulp.watch('./src/images/icons/*.svg', gulp.series('createSprite:dev'));
  gulp.watch('./src/fonts/**/*', gulp.series('fonts:dev'));
  gulp.watch('./src/js/**/*.js', gulp.series('js:dev'));
});
