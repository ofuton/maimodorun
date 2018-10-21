const gulp = require('gulp');

gulp.task('watch', () => {
    gulp.watch('./src/scripts/*.js', gulp.task('scripts'));
    gulp.watch('./src/styles/*.css', gulp.task('styles'));
    gulp.watch('./src/html/*.html', gulp.task('html'));

    // static files
    gulp.watch('./src/fonts/**', gulp.task('fonts'));
    gulp.watch('./src/images/**', gulp.task('images'));
    gulp.watch('./src/vendors/**', gulp.task('vendors'));
    gulp.watch('./src/manifest.json', gulp.task('manifest'));
});

gulp.task('scripts', () => {
    const minify = require('gulp-minify');
    return gulp.src('./src/scripts/*.js')
        .pipe(minify({
            ext:{
                min:'.min.js'
            },
            noSource: true
        }))
        .pipe(gulp.dest('./dist/assets/js'));
});

gulp.task('styles', () => {
    const postcss = require('gulp-postcss');
    const sourcemaps = require('gulp-sourcemaps');
    const rename = require('gulp-rename');

    return gulp.src('./src/styles/*.css')
        .pipe(sourcemaps.init())
        .pipe(postcss([
            require('postcss-import'),
            require('postcss-preset-env'),
            require('postcss-apply'),
            require('postcss-neat'),
            require('cssnano')
        ]))
        .pipe(rename({
            extname: ".min.css"
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/assets/css'));
});

gulp.task('html', () => {
    return gulp.src('./src/html/**')
        .pipe(gulp.dest('./dist/assets/html'));
});

gulp.task('fonts', () => {
    return gulp.src('./src/fonts/**')
        .pipe(gulp.dest('./dist/assets/fonts'));
});

gulp.task('images', () => {
    const imagemin = require('gulp-imagemin');
    return gulp.src('./src/images/**')
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/assets/images'))
});

gulp.task('vendors', () => {
    return gulp.src('./src/vendors/**')
       .pipe(gulp.dest('./dist/assets/vendors'));
});

gulp.task('manifest', () => {
    return gulp.src('./src/manifest.json')
        .pipe( gulp.dest('./dist'));
});

gulp.task('clean:dist', () => {
    const del = require('del');
    return del('./dist', { force:true });
});

gulp.task('clean:zip', () => {
    const del = require('del');
    return del('./archive.zip', { force:true });
});

gulp.task('clean:all',
    gulp.parallel(
        'clean:dist',
        'clean:zip'
    )
);

gulp.task('zip', () => {
    const zip = require('gulp-zip');
    return gulp.src('./dist/**/*', { base: '.' })
        .pipe(zip('archive.zip'))
        .pipe(gulp.dest('./'));
});

gulp.task('build',
    gulp.series(
        'clean:dist',
        gulp.parallel(
            'scripts',
            'styles',
            'html',
            'fonts',
            'images',
            'vendors',
            'manifest'
        )
    )
);

gulp.task('deploy',
    gulp.series(
        'clean:zip',
        'zip'
    )
);