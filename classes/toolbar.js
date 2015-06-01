var ActionList = require('./action-list');

module.exports = Toolbar;

Toolbar.prototype = {};

return Toolbar;

function Toolbar(actionRepository, name, actions) {
	if (!arguments.length) {
		return;
	}
	this.name = name;
	this.actions = new ActionList(actionRepository, actions);
}

