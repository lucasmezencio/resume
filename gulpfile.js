const fs = require("fs");
const gulp = require("gulp");
const nunjucksRender = require("gulp-nunjucks-render");
const sass = require("gulp-sass")(require("sass"));
const cleanCSS = require("gulp-clean-css");
const sourcemaps = require("gulp-sourcemaps");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const browserSync = require("browser-sync");

const STATIC_PATH = ".";

/**
 * @returns {{br: *, en: *}}
 */
const loadJSON = () => {
  const options = { flag: "r" };
  const resumeBr = fs.readFileSync("./src/resume-br.json", options).toString();
  const resumeEn = fs.readFileSync("./src/resume.json", options).toString();

  return {
    br: JSON.parse(resumeBr),
    en: JSON.parse(resumeEn),
  };
};

/** General Tasks **/
gulp.task(
  "nunjucks-html",
  gulp.series((done) => {
    gulp
      .src("./src/views/html/pages/**/*.njk")
      .pipe(
        nunjucksRender({
          path: ["./src/views/html/templates"],
          data: {
            resume: loadJSON(),
          },
        })
      )
      .pipe(gulp.dest(`${STATIC_PATH}/`))
      .pipe(browserSync.stream());

    done();
  })
);

gulp.task(
  "nunjucks-html:watch",
  gulp.series((done) => {
    gulp.watch("./src/views/html/**/*.njk", gulp.series("nunjucks-html"));

    done();
  })
);

gulp.task(
  "nunjucks-md",
  gulp.series((done) => {
    gulp
      .src("./src/views/md/pages/**/*.njk")
      .pipe(
        nunjucksRender({
          path: ["./src/views/md/templates"],
          ext: ".md",
          data: {
            resume: loadJSON(),
          },
        })
      )
      .pipe(gulp.dest(`${STATIC_PATH}/`))
      .pipe(browserSync.stream());

    done();
  })
);

gulp.task(
  "nunjucks-md:watch",
  gulp.series((done) => {
    gulp.watch("./src/views/md/**/*.njk", gulp.series("nunjucks-md"));

    done();
  })
);

gulp.task(
  "json:watch",
  gulp.series((done) => {
    gulp.watch(
      "./src/resume*.json",
      gulp.series(["nunjucks-html", "nunjucks-md"])
    );

    done();
  })
);

gulp.task(
  "sass",
  gulp.series((done) => {
    gulp
      // .src("./src/assets/scss/*.scss")
      // .pipe(sourcemaps.init())
      // .pipe(sass().on("error", sass.logError))
      // .pipe(sourcemaps.write())
      // .pipe(gulp.dest(`${STATIC_PATH}/dist/css/`));
      .src("./src/assets/scss/*.scss")
      .pipe(sourcemaps.init())
      .pipe(
        sass({
          outputStyle: "compressed",
        }).on("error", sass.logError)
      )
      .pipe(cleanCSS())
      .pipe(sourcemaps.write())
      .pipe(rename("main.min.css"))
      .pipe(gulp.dest(`${STATIC_PATH}/dist/css/`))
      .pipe(browserSync.stream());

    done();
  })
);

gulp.task(
  "sass:watch",
  gulp.series((done) => {
    gulp.watch("./src/assets/scss/**/*.scss", gulp.series("sass"));

    done();
  })
);

gulp.task(
  "js",
  gulp.series((done) => {
    let jsDest = `${STATIC_PATH}/dist/js/`;

    gulp
      .src("./src/assets/js/main.js")
      .pipe(concat("main.js"))
      .pipe(rename("main.min.js"))
      .pipe(uglify())
      .pipe(gulp.dest(jsDest))
      .pipe(browserSync.stream());

    done();
  })
);

gulp.task(
  "js:watch",
  gulp.series((done) => {
    gulp.watch("./src/assets/js/**/*.js", gulp.series("js"));

    done();
  })
);

gulp.task(
  "browser-sync",
  gulp.series((done) => {
    browserSync.init({
      server: {
        baseDir: STATIC_PATH,
      },
      open: false,
      notify: false,
    });

    done();
  })
);

gulp.task("build", gulp.series(["nunjucks-html", "nunjucks-md", "sass", "js"]));
gulp.task(
  "watch",
  gulp.series([
    "nunjucks-html:watch",
    "nunjucks-md:watch",
    "json:watch",
    "sass:watch",
    "js:watch",
  ])
);

/** Gulp Default **/
gulp.task("default", gulp.series(["build", "watch", "browser-sync"]));
