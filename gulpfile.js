'use strict';

var navlinks = [
	{ title: 'Leptonic', name: 'home', url: '/' }
];
var page = navlinks[0];

var gulp = require('gulp');
var _ = require('lodash');

var dependencies = _.assign({},
	require('./package.json').dependencies,
	require('./package.json').browser
);

var config = module.exports = {
	extraTasks: ['symbols'],
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
		jade: ['jade/pages/*.jade'],
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
	jadeContext: { page: page, navlinks: navlinks }
};

var battlemake = require('battlemake')(config);

var iconFont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
var rename = require('gulp-rename');

gulp.task('symbols', buildSymbols);

function buildSymbols() {
	var opts = {
		fontName: 'leptonic-toolbar',
		normalize: true,
		fixedWidth: true,
		centerHorizontally: true,
		descent: 0
	};
	return gulp.src('symbols/toolbar/*.svg')
		.pipe(iconFont(opts))
		.on('codepoints', onCodepoints)
		.pipe(gulp.dest(config.paths.out));

	function onCodepoints(codepoints, options) {
		return gulp.src('symbols/template.css')
			.pipe(consolidate('lodash', {
				glyphs: codepoints,
				fontName: opts.fontName,
				fontPath: '',
				className: 'tb'
			}))
			.pipe(rename('symbols.css'))
			.pipe(gulp.dest(config.paths.out));
	}
}
