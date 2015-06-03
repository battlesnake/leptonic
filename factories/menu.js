var Menu = require('../classes/menu');

module.exports = menuFactory;

function menuFactory(repositories) {

	MenuProxy.prototype = new Menu();

	return MenuProxy;

	function MenuProxy(name, direction, actions) {
		return new Menu(repositories.actions, name, direction, actions);
	}

}
