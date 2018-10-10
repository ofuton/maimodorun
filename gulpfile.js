const gulp = require('gulp');

gulp.task('css', () => {
    const postcss       = require('gulp-postcss');
    const sourcemaps    = require('gulp-sourcemaps');
    const autoprefixer  = require('autoprefixer');
    const cssnano       = require('cssnano');

    return gulp.src('extension/css/*.css')
        .pipe( sourcemaps.init() )
        .pipe( postcss([ autoprefixer(), cssnano() ]) )
        .pipe( sourcemaps.write('.') )
        .pipe( gulp.dest('build/') )
});