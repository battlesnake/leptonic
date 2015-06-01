var requireDir = require('require-dir');

var recase = require('../util/re-case.js');

var factories = requireDir('./');
delete factories.index;

module.exports = {
	bind: bind
};

function bind(repositories) {
	return recase(factories, 'pascal', function (factory) {
		return factory(repositories);
	});
}
