import gulp from 'gulp';
const {series, watch, src, dest, parallel} = gulp;
import pump from 'pump';
import {deleteAsync} from 'del';

// gulp plugins and utils
import livereload from 'gulp-livereload';
import postcss from 'gulp-postcss';
import zip from 'gulp-zip';
import terser from 'gulp-terser';
import beeper from 'beeper';

// postcss plugins
import autoprefixer from 'autoprefixer';
import colorFunction from 'postcss-color-mod-function';
import cssnano from 'cssnano';
import easyimport from 'postcss-easy-import';

function serve(done) {
    livereload.listen();
    done();
}

const handleError = (done) => {
    return function (err) {
        if (err) {
            beeper();
        }
        return done(err);
    };
};

function cleanBuilt() {
    return deleteAsync([
        'assets/built/**/*'
    ]);
}

function hbs(done) {
    pump([
        src(['*.hbs', '**/**/*.hbs', '!node_modules/**/*.hbs']),
        livereload()
    ], handleError(done));
}

function css(done) {
    var processors = [
        easyimport,
        colorFunction(),
        autoprefixer(),
        cssnano()
    ];

    pump([
        src('assets/css/screen.css', {sourcemaps: true}),
        postcss(processors),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function js(done) {
    pump([
        src('assets/js/*.js', {sourcemaps: true}),
        terser(),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function zipper(done) {
    var targetDir = 'dist/';
    var themeName = require('./package.json').name;
    var filename = themeName + '.zip';

    pump([
        src([
            '**',
            '!node_modules', '!node_modules/**',
            '!dist', '!dist/**'
        ]),
        zip(filename),
        dest(targetDir)
    ], handleError(done));
}

const cssWatcher = () => watch('assets/css/**', css);
const hbsWatcher = () => watch(['*.hbs', '**/**/*.hbs', '!node_modules/**/*.hbs'], hbs);
const watcher = parallel(cssWatcher, hbsWatcher);
const build = series(cleanBuilt, css, js);
const dev = series(build, serve, watcher);
const zipTask = series(build, zipper);

export default dev;

export {
    build,
    zipTask as zip
};
