'use strict';

var gulp = require('gulp');
var _ = require('lodash');
var path = require('path');

var dependencies = _.assign({},
	require('./package.json').dependencies,
	require('./package.json').browser
);

var config = module.exports = {
	extraBuildTasks: ['symbols', 'images'],
	extraWatchTasks: [watchSymbols, watchData, watchImages],
	paths: {
		out: 'out'
	},
	bundles: {
		client: 'client.js',
		clientMap: 'client.json',
		vendor: 'vendor.js',
		styles: 'style.css'
	},
	globs: {
		js: ['./js/index.js'],
		jsClientDeps: ['js/*.js', 'js/**/*.js'],
		less: ['less/index.less'],
		lessDeps: ['less/**/*.less'],
		jade: ['jade/*.jade'],
		jadeDeps: ['jade/**/*.jade', 'data/**/*.js'],
		npmAssets: [
			'@(bower_components|node_modules)/**/*.@(png|jpg|jpeg|gif|woff|woff2|eot|ttf|otf|svg)',
		],
		npmAssetsExclude: [
			'**/@(tests|test|docs|doc)/**'
		],
		symbols: ['symbols/**/*.svg'],
		data: ['(classes|data)/**/*.js'],
		images: ['images/*']
	},
	base64: {
		enabled: true,
		includeExtensions: ['png', 'gif', 'jpg', 'jpeg', 'svg', 'woff', 'woff2', 'otf', 'ttf', 'eot'],
		maxImageSize: 64*1024
	},
	fonts: 'fonts.list',
	dependencies: dependencies,
	jsFreeDependencies: ['font-awesome'],
	test: {
		port: 3000
	},
	jadeContext: getPageData
};

var battlemake = require('battlemake')(config);

/* Symbol fonts */

var iconFont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
var rename = require('gulp-rename');

gulp.task('symbols', symbolsTask);

function watchSymbols() {
	return gulp.watch(config.globs.symbols, ['symbols']);
}

function symbolsTask() {
	var opts = {
		fontName: 'leptonic-symbols',
		normalize: true,
		descent: 0
	};
	return gulp.src(config.globs.symbols)
		.pipe(iconFont(opts))
		.on('codepoints', onCodepoints)
		.pipe(gulp.dest(config.paths.out));

	function onCodepoints(codepoints, options) {
		return gulp.src('symbols/template.css')
			.pipe(consolidate('lodash', {
				glyphs: codepoints,
				fontName: opts.fontName,
				fontPath: '',
				className: 'ls'
			}))
			.pipe(rename('symbols.css'))
			.pipe(gulp.dest(config.paths.out));
	}
}

/* Jade */

function watchData() {
	return gulp.watch(config.globs.data, ['invalidate-page-data', 'jade']);
}

gulp.task('invalidate-page-data', invalidatePageData);

function invalidatePageData() {
	delete require.cache[require.resolve('./data')];
}

function getPageData(file) {
	var name = path.basename(file.path).replace(/\.jade$/i, '');
	var data = require('./data');
	var pageData = _.extend({ page: data.pages.getByName(name) }, data);
	if (!pageData.page) {
		console.error('Failed to get view data for page "' + name + '" (' + file.path + ')');
	}
	return pageData;
}

/* Images */

gulp.task('images', imagesTask);

function watchImages() {
	return gulp.watch(config.globs.images, ['images']);
}

function imagesTask() {
	return gulp.src(config.globs.images, { buffer: false })
		.pipe(gulp.dest(config.paths.out))
		;
}
