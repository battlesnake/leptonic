var _ = require('lodash');
var changeCase = require('change-case');

module.exports = recase;

/* Pascal-cases the keys, and optionally transforms the values */
function recase(modules, newCase, xform) {
	return _(modules)
		.pairs()
		.map(function (pair) {
			return [
				changeCase[newCase](pair[0]),
				xform ? xform(pair[1]) : pair[1]
			];
		})
		.object()
		.value();
}
