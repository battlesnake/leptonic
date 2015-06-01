var _ = require('lodash');
var NamedList = require('./named-list');

module.exports = ActionList;

ActionList.prototype = new NamedList();
ActionList.prototype.getActions = getActions;

/*
 * Inherites from NamedList which inherits from Array.
 *
 * Stores a reference to an action actionRepository.
 * The array content is an array of names of actions from the actionRepository.
 */
function ActionList(actionRepository, items) {
	var self = this;
	if (!arguments.length) {
		return;
	}
	if (!(actionRepository instanceof NamedList)) {
		throw new Error('Action repository must be NamedList');
	}
	self.actionRepository = actionRepository;
	Object.defineProperty(self, 'actionRepository', { enumerable: false });
	if (items) {
		self.push.apply(self, items);
	}
}

/* Resolves action names to actions and returns an array of action s*/
function getActions() {
	var self = this;
	return _.map(self, function (name) {
		return self.actionRepository.getByName(name);
	});
}

