const gulp = require('gulp');

gulp.task('watch', () => {
    gulp.watch('./src/styles/*.css', gulp.task('styles'));
});

gulp.task('scripts', () => {
    // TODO: JSファイルの圧縮挟みたい
    return gulp.src('./src/scripts/*.js')
       .pipe( gulp.dest('./dist/assets/js') );
});

gulp.task('styles', () => {
    const postcss = require('gulp-postcss');
    const sourcemaps = require('gulp-sourcemaps');

    return gulp.src('./src/styles/*.css')
        .pipe( sourcemaps.init() )
        .pipe( postcss([
            require('postcss-import'),
            require('postcss-preset-env'),
            require('postcss-apply'),
            require('postcss-neat'),
            require('cssnano')
        ]) )
        .pipe( sourcemaps.write('.') )
        .pipe( gulp.dest('./dist/assets/css') );
});

gulp.task('html', () => {
    // TODO: HTMLファイルの圧縮挟みたい
    return gulp.src('./src/html/**')
        .pipe( gulp.dest('./dist/assets/html') );
});

gulp.task('fonts', () => {
    return gulp.src('./src/fonts/**')
        .pipe( gulp.dest('./dist/assets/fonts') );
});

gulp.task('images', () => {
    // TODO: 画像圧縮pipe挟みたい
    return gulp.src('./src/images/**')
        .pipe( gulp.dest('./dist/assets/images') )
});

gulp.task('vendors', () => {
    return gulp.src('./src/vendors/**')
       .pipe( gulp.dest('./dist/assets/vendors') );
});

gulp.task('manifest', () => {
    return gulp.src('./src/manifest.json')
        .pipe( gulp.dest('./dist'));
});

gulp.task('build',
    gulp.parallel(
        'scripts',
        'styles',
        'html',
        'fonts',
        'images',
        'vendors',
        'manifest'
    )
);