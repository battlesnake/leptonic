var _ = require('lodash');
var NamedList = require('../classes/named-list');
var ActionList = require('../classes/action-list');

module.exports = actionListFactory;

function actionListFactory(repositories) {

	ActionListProxy.prototype = new ActionList();

	return ActionListProxy;

	function ActionListProxy(items) {
		return new ActionList(repositories.actions, items);
	}
}
