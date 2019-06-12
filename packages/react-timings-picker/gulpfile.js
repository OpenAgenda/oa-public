// generated on 2015-06-27 using generator-gulp-webapp 1.0.2
const gulp = require( 'gulp' );
const gulpLoadPlugins = require( 'gulp-load-plugins' );
const cleanCSS = require('gulp-clean-css');
const browserSync = require( 'browser-sync' );
const del = require( 'del' );
const { stream: wiredep } = require( 'wiredep' );
const browserify = require( 'browserify' );
const buffer = require( 'vinyl-buffer' );
const source = require( 'vinyl-source-stream' );

const webServerPort = 9000;

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () =>
{
	return gulp.src(['app/styles/*.scss', 'app/styles/component/*.scss', 'app/styles/vendors/*.css'])
		.pipe($.plumber())
		.pipe($.sourcemaps.init())
		.pipe($.sass.sync
		({
			outputStyle: 'expanded',
			precision: 10,
			includePaths: ['.']
		}).on('error', $.sass.logError))
		.pipe($.autoprefixer({ browsers: ['ie >= 9', 'firefox >= 24', 'chrome >= 33', 'safari >= 5', 'ios_saf 5'] }))
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest('.tmp/styles'))
		.pipe(reload({ stream: true }));
});

gulp.task('styles:dist', () =>
{
	return gulp.src(['app/styles/component/*.scss', 'app/styles/vendors/*.css'])
		.pipe($.plumber())
		.pipe($.sourcemaps.init())
		.pipe($.sass.sync
		({
			outputStyle: 'expanded',
			precision: 10,
			includePaths: ['.']
		}).on('error', $.sass.logError))
		.pipe($.autoprefixer({ browsers: ['ie >= 9', 'firefox >= 24', 'chrome >= 33', 'safari >= 5', 'ios_saf 5'] }))
		.pipe($.sourcemaps.write())
		.pipe($.concat("react-timings-picker.css"))
		.pipe(gulp.dest('dist/styles'))
		.pipe(cleanCSS({ compatibility: '*' }))
		.pipe($.rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist/styles'));
});

gulp.task('html'/*, ['styles']*/, () =>
{
	// const assets = $.useref.assets({ searchPath: ['.tmp', 'app', '.'] });

	return gulp.src('app/*.html')
		// .pipe(assets)
		// .pipe($.if('*.js', $.uglify()))
		// .pipe($.if('*.css', cleanCSS({ compatibility: '*' })))
		// .pipe(assets.restore())
		.pipe($.useref( { searchPath: ['.tmp', 'app', '.'] } ))
		.pipe($.if('*.html', $.minifyHtml({ conditionals: true, loose: true })))
		.pipe(gulp.dest('.tmp'));
});

gulp.task('images', () =>
{
	return gulp.src('app/images/**/*')
		.pipe($.if($.if.isFile, $.cache($.imagemin({
			progressive: true,
			interlaced: true,
			// don't remove IDs from SVGs, they are often used
			// as hooks for embedding and styling
			svgoPlugins: [{ cleanupIDs: false }]
		})).on('error', function (err)
		{
			console.log(err);
			this.end();
		})))
		.pipe(gulp.dest('dist/images'));
});

gulp.task('react'/*, ["react:lib"]*/, () => {
	return browserify("lib/scripts/main.js", { debug: true })
		.bundle()
		.on('error', console.error.bind(console))
		.pipe(source('bundle.js'))
		.pipe(gulp.dest('.tmp/scripts'));
});

gulp.task('react:dist'/*, ["react:lib"]*/, () => {
	return browserify("lib/scripts/components/timings-picker.js")
		.transform('browserify-shim')
		.bundle()
		.on('error', console.error.bind(console))
		.pipe(source('react-timings-picker.js'))
		.pipe(buffer())
		.pipe(gulp.dest('dist/scripts'))
		.pipe($.uglify())
		.pipe($.rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist/scripts'));
});

gulp.task("react:lib", () => {
	gulp.src("app/locales/**/*.json").pipe(gulp.dest("lib/locales"));
	return gulp.src(["app/scripts/**/*.jsx", "app/scripts/**/*.js"])
		.pipe($.react())
		.pipe(gulp.dest("lib/scripts"));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist', "lib"]));

gulp.task('serve'/*, ['styles', 'react', 'react:dist']*/, () =>
{
	browserSync({
		notify: false,
		port: 9001,
		server: {
			baseDir: ['.tmp', 'app'],
			routes: {
				'/bower_components': 'bower_components'
			}
		}
	});

	gulp.watch
	([
		'app/*.html',
		'app/scripts/**/*.js',
		'app/images/**/*',
		'app/scripts/**/*.jsx'
	]).on('change', reload);

	gulp.watch('app/styles/**/*.scss', ['styles']);
	gulp.watch(['app/scripts/**/*.jsx', 'app/scripts/**/*.js'], ['react:lib', 'react:dist','react']);
	gulp.watch('bower.json', ['wiredep']);
});

gulp.task('serve:dist', () =>
{
	browserSync
	({
		notify: false,
		port: webServerPort,
		server: {
			baseDir: ['dist']
		}
	});
});

gulp.task('serve:test', () =>
{
	browserSync
	({
		notify: false,
		port: webServerPort,
		ui: false,
		server: {
			baseDir: 'test',
			routes: {
				'/bower_components': 'bower_components'
			}
		}
	});

	gulp.watch('test/spec/**/*.js').on('change', reload);
});

// inject bower components
gulp.task('wiredep', () =>
{
	gulp.src('app/styles/*.scss')
		.pipe(wiredep({ ignorePath: /^(\.\.\/)+/ }))
		.pipe(gulp.dest('app/styles'));

	gulp.src('app/*.html')
		.pipe(wiredep({ ignorePath: /^(\.\.\/)*\.\./ }))
		.pipe(gulp.dest('app'));
});

gulp.task('build'/*, ['html', 'images', 'styles', 'react']*/, () =>
{
	return gulp.src('dist/**/*').pipe($.size({ title: 'build', gzip: true }));
});

gulp.task('build:dist'/*, ['html', 'images', 'styles:dist', 'react:dist']*/, () =>
{
	return gulp.src('dist/**/*').pipe($.size({ title: 'build', gzip: true }));
});

exports.default = gulp.series( 'clean', 'styles', 'html', 'images', 'styles:dist', 'react:lib', 'react:dist' );
