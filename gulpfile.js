'use strict';

var gulp = require('gulp'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    rimraf = require('rimraf');

var runSequence = require('run-sequence'),
    exec = require('gulp-exec');

var postcss = require('gulp-postcss'),
    cssnano = require('gulp-cssnano'),
    uncss = require('gulp-uncss'),
    autoprefixer = require('autoprefixer'),
    mergerules = require('postcss-merge-rules'),
    spritesmith = require('gulp.spritesmith');

var path = {
    build: {
        html: 'build/',
        js: 'build/assets/js/',
        css: 'build/assets/css/',
        img: 'build/assets/img/',
        fonts: 'build/assets/fonts/',
        file: {
            css: 'build/assets/css/style.min.css'
        },
        folder: {
            assets: 'build/assets/'
        }
    },
    src: {
        html: 'src/*.html',
        // js: 'src/assets/js/main.js',
        css: 'src/assets/css/*.css',
        img: 'src/assets/img/*.*',
        sprite: 'src/assets/img/sprite/*.*',
        fonts: 'src/assets/fonts/*.*',
        file: {
            css: 'src/assets/css/style.min.css'
        },
        folder: {
            css: 'src/assets/css/'
        }
    },
    clean: 'build'
};

var option_list = {
    uncss: {
        files: {
            html: ["build/*.html"]
        }
    },
    postcss: {
        processors: [
            autoprefixer({browsers: ['last 1 version']}),
            cssnano
        ]
    }
};

gulp.task('build', function () {
    runSequence('delete build', 'parse html path', 'build style', 'run shell tidy.exe');
});

gulp.task('parse html path', function () {
    return gulp.src(path.src.html)
        .pipe(useref())
        .pipe(gulp.dest(path.build.html));
});

gulp.task('build style', function () {
    return gulp.src(path.build.file.css)
        .pipe(postcss([mergerules]))
        .pipe(uncss(option_list.uncss.files))
        .pipe(postcss(option_list.postcss.processors))
        .pipe(gulp.dest(path.build.css));
});

gulp.task('copy image', function () {
    gulp.src(['src/assets/*img/**/*.*']).pipe(gulp.dest(path.build.folder.assets));
});

gulp.task('copy style.min.css', function () {
    gulp.src(path.build.file.css).pipe(gulp.dest(path.src.folder.css));
});

gulp.task('delete build', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('run shell tidy.exe', function () {
    gulp.src('./')
        .pipe(exec('csstidy.exe build/assets/css/style.min.css build/assets/css/style.min.css'));
});