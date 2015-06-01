var requireDir = require('require-dir');

var recase = require('../util/re-case.js');

var data = requireDir('./');
delete data.index;
delete data.classes;

module.exports = recase(data, 'camel');
