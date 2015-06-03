var ActionList = require('./action-list');

module.exports = Menu;

Menu.prototype = {};

return Menu;

function Menu(actionRepository, name, direction, actions) {
	if (!arguments.length) {
		return;
	}
	direction = direction || 'vertical';
	if (direction !== 'vertical' && direction !== 'horizontal') {
		throw new Error('Invalid menu direction: "' + direction + '"');
	}
	this.name = name;
	this.direction = direction;
	this.actions = new ActionList(actionRepository, actions);
}
