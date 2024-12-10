const gulp = require('gulp');
const fileinclude = require('gulp-file-include');
const htmlclean = require('gulp-htmlclean');
// const webpHtml = require('gulp-webp-html');
const sass = require('gulp-sass')(require('sass'));
const sourceMaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
// const webpCss = require('gulp-webp-css');
// const groupMediaQueries = require('gulp-group-css-media-queries');
// const csso = require('gulp-csso');
const server = require('gulp-server-livereload');
const gulpClean = require('gulp-clean');
const fs = require('fs');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const webpack = require('webpack-stream');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
// const webp = require('gulp-webp');
const changed = require('gulp-changed');
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

gulp.task('clean:prod', function(done){
  if(fs.existsSync('./dist/')) {
    return gulp.src('./dist/', { read: false })
      .pipe(gulpClean())
  }
  done();
});

gulp.task('html:prod', function(){
  return gulp.src('./src/*.html')
    .pipe(changed('./dist/'))
    .pipe(plumber(plumberNotify('HTML')))
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    // .pipe(webpHtml())
    .pipe(htmlclean())
    .pipe(gulp.dest('./dist/'))
});

gulp.task('sass:prod', function(){
  return gulp.src('./src/scss/*.scss')
    .pipe(changed('./dist/css/'))
    .pipe(plumber(plumberNotify('Style')))
    // .pipe(groupMediaQueries())
    // .pipe(webpCss)
    .pipe(sourceMaps.init())
    .pipe(sass())
    .pipe(autoprefixer())
    // .pipe(csso())
    .pipe(sourceMaps.write())
    .pipe(gulp.dest('./dist/css/'))
});

gulp.task('images:prod', function(){
  return gulp.src(['./src/images/**/*', '!./src/images/icons/*.svg'])
    .pipe(changed('./dist/images/'))
    // .pipe(webp())
    // .pipe(gulp.dest('./dist/images/'))
    // .pipe(gulp.src(['./src/images/**/*', '!./src/images/icons/*.svg']))
    // .pipe(imagemin({ verbose: true }))
    .pipe(gulp.dest('./dist/images/'))
});

// gulp.task('createSprite:prod', function(){
//   return gulp.src('./src/images/icons/*.svg')
//     .pipe(changed('./dist/images/'))
//     .pipe(svgstore({inlineSvg: true}))
//     .pipe(rename("sprite.svg"))
//     .pipe(gulp.dest('./dist/images/'))
// });

gulp.task('fonts:prod', function(){
  return gulp.src('./src/fonts/**/*.ttf')
    .pipe(changed('./dist/fonts/'))
    .pipe(ttf2woff())
    .pipe(gulp.dest('./dist/fonts/'))
    .pipe(gulp.src('./src/fonts/**/*.ttf'))
    .pipe(ttf2woff2())
    .pipe(gulp.dest('./dist/fonts/'))
});

gulp.task('js:prod', function(){
  return gulp.src('./src/js/*.js')
    .pipe(changed('./dist/js/'))
    .pipe(plumber(plumberNotify('JS')))
    .pipe(babel())
    .pipe(webpack(require('../webpack.config')))
    .pipe(gulp.dest('./dist/js/'))
});

gulp.task('server:prod', function(){
  return gulp.src('./dist/')
    .pipe(server({
      livereload: true,
      open: true
    }))
});
