'use strict';

var gulp = require('gulp');
var watch = require('gulp-watch');
var _ = require('lodash');

var dependencies = _.assign({},
	require('./package.json').dependencies,
	require('./package.json').browser
);

var config = module.exports = {
	extraTasks: ['symbols', 'images'],
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
		less: ['less/index.less'],
		lessDeps: ['less/**/*.less'],
		jade: ['jade/*.jade'],
		jadeDeps: ['jade/**/*.jade'],
		npmAssets: ['./@(bower_components|node_modules)/**/*.@(png|jpg|jpeg|gif|woff|woff2|eot|ttf|otf|svg)']
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

var symbolsWatcher;
function symbolsTask() {
	symbolsWatcher = symbolsWatcher || watch('symbols/**/*.svg', ['symbols']);
	var opts = {
		fontName: 'leptonic-symbols',
		normalize: true,
//		fixedWidth: true,
//		centerHorizontally: true,
		descent: 0
	};
	return gulp.src('symbols/**/*.svg')
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

var path = require('path');

function getPageData(file) {
	var name = path.basename(file.path).replace(/\.jade$/i, '');
	/* Reload data */
	delete require.cache[require.resolve('./data')];
	var pageData = require('./data');
	var data = pageData({ name: name });
	if (!data) {
		console.error('Failed to get view data for page "' + name + '" (' + file.path + ')');
	}
	return data || {};
}

/* Images */

gulp.task('images', imagesTask);

function imagesTask() {
	return gulp.src('images/*', { buffer: false })
		.pipe(gulp.dest(config.paths.out))
		;
}
