const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const parseArgs = require('minimist');
const gulp = require('gulp');
const concat = require('gulp-concat');
const minifyCSS = require('gulp-minify-css');
const sass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const clean = require('gulp-clean');
const autoprefixer = require('gulp-autoprefixer');
const image = require('gulp-image');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const named = require('vinyl-named');
const open = require('gulp-open');
const fileinclude = require('gulp-file-include');
const webpackStream = require('webpack-stream');
const connect = require('gulp-connect');

const argv = parseArgs(process.argv.slice(2));

gulp.task('image-min', () =>
  gulp
    .src('./src/images/**/*')
    .pipe(image())
    .pipe(gulp.dest('./dist/images/'))
    .pipe(connect.reload())
);

gulp.task('compile-sass', function () {
  return gulp
    .src(['./src/scss/*.css', './src/scss/*.scss'])
    .pipe(sass())
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('minify-css', function () {
  return gulp
    .src(['./src/css/*.css'])
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(concat('style.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./dist/css'))
    .pipe(connect.reload());
});

gulp.task('pageHtml', function () {
  return gulp
    .src(['./src/*.html'])
    .pipe(
      htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(
      fileinclude({
        prefix: '@@',
        basepath: '@file',
      })
    )
    .pipe(
      replace('?timestamp', function () {
        const timestamp = Date.now();
        return `?${timestamp}`;
      })
    )
    .pipe(gulp.dest('./dist/'))
    .pipe(connect.reload());
});

gulp.task('minify-main-js', function () {
  return gulp
    .src(['./src/js/*.js'])
    .pipe(named())
    .pipe(
      webpackStream({
        mode: argv.env,
        module: {
          rules: [
            {
              test: /\.(js)$/,
              exclude: /(node_modules)/,
              use: [
                {
                  loader: 'babel-loader',
                  options: {
                    plugins: [
                      '@babel/plugin-proposal-nullish-coalescing-operator',
                      '@babel/plugin-proposal-optional-chaining',
                      '@babel/plugin-transform-destructuring',
                      '@babel/plugin-proposal-class-properties',
                      '@babel/plugin-transform-modules-commonjs',
                      '@babel/plugin-transform-modules-amd',
                      '@babel/plugin-syntax-dynamic-import',
                      '@babel/plugin-proposal-json-strings',
                      '@babel/plugin-proposal-export-namespace-from',
                      '@babel/plugin-proposal-numeric-separator',
                    ],
                  },
                },
              ],
            },
          ],
        },
        plugins: [new NodePolyfillPlugin()],
      })
    )
    .pipe(gulp.dest('./dist/js/'))
    .pipe(connect.reload());
});

gulp.task('copy-fonts', function () {
  return gulp.src(['./src/fonts/*']).pipe(gulp.dest('./dist/fonts/'));
});

gulp.task('copy-simple-picker', function () {
  return gulp
    .src(['./node_modules/simplepicker/dist/simplepicker.css'])
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('copy-js', function () {
  return gulp.src(['./src/js/libs/*.js']).pipe(gulp.dest('./dist/js/libs'));
});

gulp.task('copy-json', function () {
  return gulp.src(['./src/json/*.json']).pipe(gulp.dest('./dist/'));
});

// Чистим директорию назначения и делаем ребилд, чтобы удаленные из проекта файлы не остались
gulp.task('clean', function () {
  return gulp
    .src(['./src/css/style.css'], {
      read: false,
      allowEmpty: true,
    })
    .pipe(clean());
});

gulp.task('clean-old-css', function () {
  return gulp
    .src(['./dist/css'], {
      read: false,
      allowEmpty: true,
    })
    .pipe(clean());
});

gulp.task('clean-old-js', function () {
  return gulp
    .src(['./dist/js'], {
      read: false,
      allowEmpty: true,
    })
    .pipe(clean());
});

gulp.task('connect', function () {
  connect.server({
    root: './dist/',
    port: '8509',
    livereload: true,
  });

  return gulp.src('./dist/').pipe(
    open({
      uri: `http://localhost:8509`,
    })
  );
});

function watchFiles() {
  gulp.watch(
    './src/**/*.scss',
    gulp.series([
      'clean-old-css',
      'compile-sass',
      'minify-css',
      'clean',
      'pageHtml',
    ])
  );
  gulp.watch('./src/**/*.html', gulp.series(['pageHtml']));
  gulp.watch(
    ['./src/js/**/*.js'],
    gulp.series([
      'clean-old-js',
      'minify-main-js',
      'copy-js',
      'copy-json',
      'pageHtml',
    ])
  );
}

const build = gulp.series(
  'clean-old-css',
  'clean-old-js',
  'compile-sass',
  'minify-css',
  'minify-main-js',
  'copy-js',
  'copy-json',
  'pageHtml',
  'clean',
  'copy-fonts',
  'copy-simple-picker',
  'image-min'
);

const watch = gulp.parallel('connect', watchFiles);

exports.build = build;
exports.default = gulp.series(build, watch);
