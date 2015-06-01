var classes = require('./classes');
var NamedList = classes.NamedList;
var Toolbar = classes.Toolbar;

var toolbars = new NamedList([
	new Toolbar('top', ['insert-mode', 'select-mode', 'command-mode']),
	new Toolbar('left', ['box', 'circle', 'corners']),
	new Toolbar('right', ['r1', 'r2', 'r3']),
	new Toolbar('bottom', ['b1', 'b2', 'b3'])
]);

module.exports = toolbars;
