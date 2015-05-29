/* DOM monkeypatches */

HTMLElement.prototype.hasParent = hasParent;
HTMLElement.prototype.getParents = getParents;
HTMLElement.prototype.findAll = findAll;
HTMLElement.prototype.find = find;

function hasParent(parent, includeSelf) {
	var test = includeSelf ? this : this.parentElement;
	while (test) {
		if (test === parent) {
			console.log('PARENT', parent, this);
			return true;
		}
		test = test.parentElement;
	}
	return false;
}

function getParents(includeSelf) {
	var result = [];
	var test = includeSelf ? this : this.parentElement;
	while (test) {
		result.push(test);
		test = test.parentElement;
	}
	return result;
}

function find(selector) {
	if (selector.indexOf(':scope') === -1) {
		selector = ':scope ' + selector;
	}
	return this.querySelector(selector);
}

function findAll(selector) {
	if (selector.indexOf(':scope') === -1) {
		selector = ':scope ' + selector;
	}
	return [].slice.apply(this.querySelectorAll(selector));
}
