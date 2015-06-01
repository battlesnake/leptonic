var _ = require('lodash');
var actions = require('./actions');
var classes = require('../classes');

var repositories = {
	actions: new classes.NamedList(actions)
};

var factories = require('../factories').bind(repositories);

module.exports = _.assign({}, classes, factories);
