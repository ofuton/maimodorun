const gulp = require('gulp');
const plumber = require('gulp-plumber');
const notify  = require('gulp-notify');
const path = require('path');

const src = path.resolve(__dirname, 'src');
const scripts = path.resolve(src, 'js');

gulp.task('watch', () => {
    gulp.watch('./src/html/client/**/*.pug', gulp.task('scripts'));
    gulp.watch('./src/js/**/*.js', gulp.task('js'));
    gulp.watch('./src/styles/**/*.css', gulp.task('styles'));
    gulp.watch('./src/html/**/*.pug', gulp.task('html'));

    // static files
    gulp.watch('./src/images/**', gulp.task('images'));
    gulp.watch('./src/manifest.json', gulp.task('manifest'));
});

gulp.task('pug:client', (done) => {
    const exec = require('child_process').exec;
    exec('node ./scripts/pug-compile-client.js', (stdout, stderr) => {
        console.log(stderr);
        done();
    });
});

gulp.task('js', () => {
    const webpackStream = require('webpack-stream');
    const webpack = require('webpack');
    const webpackConfig = {
        // FIXME: watch で実行した際は mode を development にできると良い
        mode: 'production',
        entry: {
            content: path.join(scripts, 'content'),
            background: path.join(scripts, 'background'),
            popup: path.join(scripts, 'popup'),
            inject: path.join(scripts, 'inject'),
        },
        output: {
            filename: '[name].js'
        },
        resolve: {
            extensions: [ '.js' ],
            modules: [ scripts, 'node_modules' ]
        },
    };

    return webpackStream(webpackConfig, webpack)
        .pipe(gulp.dest('./dist/assets/js'));
});

gulp.task('scripts',
    gulp.series(
        'pug:client',
        'js'
    )
);

gulp.task('styles', () => {
    const postcss = require('gulp-postcss');
    const sourcemaps = require('gulp-sourcemaps');
    const rename = require('gulp-rename');

    return gulp.src('./src/styles/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>")
        }))
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
    const pug = require('gulp-pug');
    return gulp.src([
            './src/html/**/*.pug',
            '!./src/html/**/_*.pug'
        ])
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('./dist/assets/html'));
});

gulp.task('images', () => {
    const imagemin = require('gulp-imagemin');
    return gulp.src('./src/images/**')
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/assets/images'))
});

gulp.task('manifest', () => {
    return gulp.src('./src/manifest.json')
        .pipe( gulp.dest('./dist'));
});

gulp.task('clean:templates', () => {
    const del = require('del');
    return del('./src/js/templates/*.js', { force:true });
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
        'clean:templates',
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
        'clean:templates',
        'clean:dist',
        gulp.parallel(
            'scripts',
            'styles',
            'html',
            'images',
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
