var Toolbar = require('../classes/toolbar');

module.exports = toolbarFactory;

function toolbarFactory(repositories) {

	ToolbarProxy.prototype = new Toolbar();

	return ToolbarProxy;

	function ToolbarProxy(name, actions) {
		return new Toolbar(repositories.actions, name, actions);
	}

}
