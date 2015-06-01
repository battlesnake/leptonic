var requireDir = require('require-dir');

var recase = require('../util/re-case.js');

var classes = requireDir('./');
delete classes.index;

module.exports = recase(classes, 'pascal');
