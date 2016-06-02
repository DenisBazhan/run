'use strict';

var gulp = require('gulp'),
    useref = require('gulp-useref'),
    uglify = require('gulp-uglify'),
    replace = require('gulp-replace'),
    rimraf = require('rimraf');

var runSequence = require('run-sequence'),
    exec = require('gulp-exec');

var postcss = require('gulp-postcss'),
    cssnano = require('gulp-cssnano'),
    uncss = require('gulp-uncss'),
    cleanCSS = require('gulp-clean-css'),
    gcmq = require('gulp-group-css-media-queries'),
    autoprefixer = require('autoprefixer'),
    mergerules = require('postcss-merge-rules'),
    duplicates = require('postcss-discard-duplicates'),
    colormin = require('postcss-colormin');

var spritesmith = require('gulp.spritesmith'),
    buffer = require('vinyl-buffer'),
    imagemin = require('gulp-imagemin'),
    merge = require('merge-stream');

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
        sprite: 'src/assets/sprite/*.*',
        fonts: 'src/assets/fonts/*.*',
        file: {
            css: 'src/assets/css/style.min.css'
        },
        folder: {
            css: 'src/assets/css/',
            img: 'src/assets/img/'
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
            duplicates(),
            colormin()
        ]
    },
    cleanCSS: {
        processors: {
            debug: true,
            keepSpecialComments: 0
        }
    }
};

gulp.task('build', function () {
    runSequence(
        'delete build folder',
        'generate sprite',
        'parse html path',
        'pre-build style',
        // 'run shell tidy.exe',
        'copy image',
        'copy fonts',
        'final-build style'
    );
});

gulp.task('parse html path', function () {
    return gulp.src(path.src.html)
        .pipe(useref())
        .pipe(gulp.dest(path.build.html));
});

gulp.task('pre-build style', function () {
    return gulp.src(path.build.file.css)
        .pipe(uncss(option_list.uncss.files))
        .pipe(postcss(option_list.postcss.processors))
        .pipe(gcmq())
        .pipe(gulp.dest(path.build.css));
});

gulp.task('final-build style', function () {
    return gulp.src(path.build.file.css)
        .pipe(cleanCSS(option_list.cleanCSS.processors, function (details) {
            console.log(details.name + ': ' + details.stats.originalSize);
            console.log(details.name + ': ' + details.stats.minifiedSize);
        }))
        .pipe(gulp.dest(path.build.css));
});

gulp.task('generate sprite', function () {
    var spriteData = gulp.src(path.src.sprite).pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.css',
        imgPath: '../img/sprite.png'
    }));

    var imgStream = spriteData.img
        .pipe(buffer())
        .pipe(imagemin())
        .pipe(gulp.dest(path.src.folder.img));

    var cssStream = spriteData.css
        .pipe(replace(/^\.icon-/gm, '.'))
        .pipe(gulp.dest(path.src.folder.css));

    return merge(imgStream, cssStream);
});

gulp.task('copy image', function () {
    gulp.src(['src/assets/*img/**/*.*'])
        .pipe(gulp.dest(path.build.folder.assets));
});

gulp.task('copy fonts', function () {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});

gulp.task('delete build folder', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('run shell tidy.exe', function () {
    var reportOptions = {
        err: false,
        stderr: false,
        stdout: false
    };
    gulp.src('./')
        .pipe(exec('csstidy.exe build/assets/css/style.min.css ' +
            '--compress_colors=true' +
            '--optimise_shorthands=0' +
            '--compress_font-weight=false' +
            '--sort_selectors=false' +
            ' build/assets/css/style.min.css'))
        .pipe(exec.reporter(reportOptions));
});