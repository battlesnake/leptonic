'use strict';

var _ = require('lodash');
var requireDir = require('require-dir');

var data = requireDir('./');

module.exports = getData;

function getData(pageQuery) {
	var page = _.findWhere(data.pages, pageQuery || { url: '/' });
	return {
		menu: data.menu,
		pages: data.pages,
		page: page,
		data: data[page.name] || {}
	};
}
