const gulp = require('gulp');

gulp.task('watch', () => {
    gulp.watch('./extension/**/*.css', gulp.task('style'));
});

gulp.task('style', () => {
    const postcss = require('gulp-postcss');
    const sourcemaps = require('gulp-sourcemaps');

    return gulp.src('extension/css/*.css')
        .pipe( sourcemaps.init() )
        .pipe( postcss([
            require('postcss-import'),
            require('postcss-preset-env'),
            require('postcss-apply'),
            require('postcss-neat'),
            require('cssnano')
        ]) )
        .pipe( sourcemaps.write('.') )
        .pipe( gulp.dest('build/') )
});