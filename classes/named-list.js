var _ = require('lodash');

module.exports = NamedList;

NamedList.prototype = [];

NamedList.prototype.getByName = getByName;
NamedList.prototype.getNames = getNames;
NamedList.prototype.getIndex = getIndex;

/*
 * Inherits from Array.
 *
 * Maintains an array of objects that each contain a 'name' property.
 */
function NamedList(items) {
	if (!arguments.length) {
		return;
	}
	if (items) {
		this.push.apply(this, items);
	}
}

/*
 * Gets an item by name
 *
 * If the item isn't found the defaultValue is returned if specified, otherwise
 * an exception is thrown.
 */
function getByName(name, defaultValue) {
	var result = _.find(this, { name: name });
	if (!result) {
		if (arguments.length >= 2) {
			return defaultValue;
		} else {
			throw new Error('Item not found: "' + name + '"');
		}
	}
	return result;
}

/* Get an array of names of items in the list */
function getNames() {
	return _.pluck(this, 'name');
}

/*
 * Indexes the array on the 'name' property, returning an object.
 *
 * Will have trouble if items are called "prototype", "hasOwnProperty", etc...
 *
 * Wait for ES6 maps to come :)
 */
function getIndex() {
	var result = this.reduce(function (memo, value) {
		if (value.name in memo) {
			throw new Error('Name collision in NamedList ("' + value.name + '")');
		}
		memo[value.name] = value;
		return memo;
	}, {});
}
