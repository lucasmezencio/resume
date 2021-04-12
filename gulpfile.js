const fs = require('fs')
const gulp = require('gulp')
const nunjucksRender = require('gulp-nunjucks-render')
const sass = require('gulp-sass')
const cleanCSS = require('gulp-clean-css')
const sourcemaps = require('gulp-sourcemaps')
const concat = require('gulp-concat')
const rename = require('gulp-rename')
const uglify = require('gulp-uglify')
const browserSync = require('browser-sync')

const STATIC_PATH = '.'

/**
 * @returns {{br: *, en: *}}
 */
const loadJSON = () => {
  let resumeBr = fs.readFileSync('resume-br.json')
  let resumeEn = fs.readFileSync('resume-en.json')

  return {
    br: JSON.parse(resumeBr),
    en: JSON.parse(resumeEn),
  }
}

/** General Tasks **/
gulp.task('nunjucks', gulp.series((done) => {
  gulp.src('./views/pages/**/*.njk')
    .pipe(nunjucksRender({
      path: ['./views/templates'],
      data: {
        resume: loadJSON()
      }
    }))
    .pipe(gulp.dest(`${STATIC_PATH}/`))
    .pipe(browserSync.stream())

  done()
}))

gulp.task('nunjucks:watch', gulp.series((done) => {
  gulp.watch('./views/**/*.njk', gulp.series('nunjucks'))

  done()
}))

gulp.task('json:watch', gulp.series((done) => {
  gulp.watch('./resume*.json', gulp.series('nunjucks'))

  done()
}))

gulp.task('sass', gulp.series((done) => {
  gulp.src('./assets/scss/*.scss')
    .pipe(sass({
      outputStyle: 'compressed',
    }).on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write())
    .pipe(rename('main.min.css'))
    .pipe(gulp.dest(`${STATIC_PATH}/css/`))
    .pipe(browserSync.stream())

  done()
}))

gulp.task('sass:watch', gulp.series((done) => {
  gulp.watch('./assets/scss/**/*.scss', gulp.series('sass'))

  done()
}))

gulp.task('js', gulp.series((done) => {
  let components = [
    './node_modules/jquery/dist/jquery.slim.min.js',
    './node_modules/popper.js/dist/umd/popper.min.js',
    './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
  ]
  let jsDest = `${STATIC_PATH}/js/`

  gulp.src(components)
    .pipe(concat('components.js'))
    .pipe(rename('components.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(jsDest))
    .pipe(browserSync.stream())

  gulp.src('./assets/js/main.js')
    .pipe(concat('main.js'))
    .pipe(rename('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(jsDest))
    .pipe(browserSync.stream())

  done()
}))

gulp.task('js:watch', gulp.series((done) => {
  gulp.watch('./assets/js/**/*.js', gulp.series('js'))

  done();
}))

gulp.task('browser-sync', gulp.series((done) => {
  browserSync.init({
    server: {
      baseDir: STATIC_PATH,
    },
  })

  done()
}))

gulp.task('build', gulp.series('nunjucks', 'sass', 'js'))
gulp.task('watch', gulp.series('nunjucks:watch', 'sass:watch', 'js:watch', 'json:watch'))

/** Gulp Default **/
gulp.task('default', gulp.series('build', 'watch', 'browser-sync'))
