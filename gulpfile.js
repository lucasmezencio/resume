const fs = require("fs");
const gulp = require("gulp");
const nunjucksRender = require("gulp-nunjucks-render");
const sass = require("gulp-sass")(require("sass"));
const cleanCSS = require("gulp-clean-css");
const sourcemaps = require("gulp-sourcemaps");
const rename = require("gulp-rename");
const browserSync = require("browser-sync");

const STATIC_PATH = ".";

/**
 * @returns {object}
 */
const loadJSON = () => {
  const resume = fs.readFileSync("./src/resume.json", { flag: "r" }).toString();

  return JSON.parse(resume);
};

const manageEnv = (env) => {
  const parseDateFlexible = (s) => {
    if (!s) {
      return null;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return new Date(s);
    }

    if (/^\d{4}-\d{2}$/.test(s)) {
      return new Date(s + '-01');
    }

    if (/^\d{4}$/.test(s)) {
      return new Date(s + '-01-01');
    }

    const d = new Date(s);

    return isNaN(d.getTime()) ? null : d;
  };

  const monthsBetween = (startDate, endDate) => {
    const years = endDate.getFullYear() - startDate.getFullYear();
    const months = endDate.getMonth() - startDate.getMonth();
    let total = years * 12 + months;

    if (endDate.getDate() < startDate.getDate()) {
      total -= 1;
    }

    return Math.max(0, total);
  };

  const formatMonths = (totalMonths) => {
    const y = Math.floor(totalMonths / 12);
    const m = totalMonths % 12;
    let out = '';

    if (y > 0) {
      out += `${y}y`;
    }

    if (m > 0) {
      out += `${m}m`;
    }

    if (out === '') {
      out = '0m';
    }

    return out;
  };

  // filter usage: {{ startDate | duration(endDate) }}
  env.addFilter('duration', (startRaw, endRaw) => {
    const start = parseDateFlexible(startRaw);

    if (!start || !endRaw) {
      return '';
    }

    const end = parseDateFlexible(endRaw);

    if (!end) {
      return '';
    }

    const months = monthsBetween(start, end);

    return formatMonths(months);
  });
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
          manageEnv,
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
          manageEnv,
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
      "./src/resume.json",
      gulp.series(["nunjucks-html", "nunjucks-md"])
    );

    done();
  })
);

gulp.task(
  "sass",
  gulp.series((done) => {
    gulp
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

gulp.task("build", gulp.series(["nunjucks-html", "nunjucks-md", "sass"]));
gulp.task(
  "watch",
  gulp.series([
    "nunjucks-html:watch",
    "nunjucks-md:watch",
    "json:watch",
    "sass:watch",
  ])
);

/** Gulp Default **/
gulp.task("default", gulp.series(["build", "watch", "browser-sync"]));
