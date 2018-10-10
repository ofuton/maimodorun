const gulp = require('gulp');

gulp.task('css', () => {
    const postcss       = require('gulp-postcss');
    const sourcemaps    = require('gulp-sourcemaps');

    return gulp.src('extension/css/*.css')
        .pipe( sourcemaps.init() )
        .pipe( postcss([
            require('postcss-import'),
            require('postcss-preset-env'),
            require('postcss-apply'),
            require('cssnano')
        ]) )
        .pipe( sourcemaps.write('.') )
        .pipe( gulp.dest('build/') )
});