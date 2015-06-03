/*
 * Extend DOM functionality with a wrapper.
 */
module.exports = UiElement;

UiElement.prototype = {
	name: null,
	actionName: null,
	element: null
};

var functions = {
	/* Focus */
	focus: focus,
	blur: blur,
	hasFocus: hasFocus,
	/* Is element removed from DOM? */
	isDead: isDead,
	/* Hierarchy (getParents returns array of DOM elements) */
	getLevel: getLevel,
	hasParent: hasParent,
	getParents: getParents,
	/* find* do not wrap resulting elements.  findMany returns real array. */
	findOne: findOne,
	findMany: findMany,
	/* Siblings, returns wrapped elements */
	wrappedPrevious: wrappedPrevious,
	wrappedNext: wrappedNext
};

for (var prop in functions) {
	UiElement.prototype[prop] = functions[prop];
	UiElement[prop] = staticify(functions[prop]);
}

var domReferenceName = '$_uiWrapper';

UiElement.get = get;
UiElement.tryGet = tryGet;
UiElement.isWrapped = isWrapped;

var input = require('./input');

window.addEventListener('DOMContentLoaded', wrapBody);

function wrapBody() {
	UiElement.body = new UiElement(document.body, false);
}

/* object.method(args...) => static(object, args...) */
function staticify(method) {
	return function staticifiedWrapper() {
		var args = [].slice.apply(arguments);
		var element = args.shift();
		return method.apply(element, args);
	};
}

function isWrapped(element) {
	return domReferenceName in element;
}

function tryGet(element) {
	if (!element) {
		return null;
	}
	if (!isWrapped(element)) {
		return null;
	}
	return element[domReferenceName];
}

function get(element) {
	if (!element) {
		console.error(element);
		throw new Error('Element required');
	}
	if (!isWrapped(element)) {
		console.error(element);
		throw new Error('Element has no wrapper');
	}
	return element[domReferenceName];
}

function UiElement(element, canFocus) {
	if (!arguments.length) {
		return;
	}
	if (!element) {
		throw new Error('No element specified');
	}
	if (element[domReferenceName] || element instanceof UiElement) {
		throw new Error('Attempted to double-wrap object');
	}
	var self = this;
	self.element = element;
	element[domReferenceName] = self;
	self.canFocus = !!canFocus;
	if (canFocus) {
		element.tabIndex = 0;
		input.onTap(element, function (event) { self.focus(); });
	}
	self.name = element.dataset.name;
	self.actionName = element.dataset.actionName;
}

function focus() {
	if (!this.canFocus) {
		throw new Error('Element is not focussable');
	}
	this.element.focus();
}

function blur() {
	if (!this.canFocus) {
		throw new Error('Element is not focussable');
	}
	this.element.blur();
}

function hasFocus() {
	return this.element === document.activeElement;
}

function isDead() {
	return document.body.contains(this.element);
}

function getLevel() {
	var level = 0;
	for (var element = this.element; element; element = element.parentElement) {
		level++;
	}
	return level;
}

function hasParent(parent, includeSelf) {
	var test = includeSelf ? this.element : this.element.parentElement;
	while (test) {
		if (test === parent) {
			return true;
		}
		test = test.parentElement;
	}
	return false;
}

function getParents(includeSelf) {
	var result = [];
	var test = includeSelf ? this.element : this.element.parentElement;
	while (test) {
		result.push(test);
		test = test.parentElement;
	}
	return result;
}

function findOne(selector) {
	if (selector.indexOf(':scope') === -1) {
		selector = ':scope ' + selector;
	}
	return this.element.querySelector(selector);
}

function findMany(selector) {
	if (selector.indexOf(':scope') === -1) {
		selector = ':scope ' + selector;
	}
	return [].slice.apply(this.element.querySelectorAll(selector));
}

function wrappedPrevious() {
	var el = this.element;
	do {
		el = el.previousSibling;
	} while (el && el.nodeType !== 1);
	return UiElement.tryGet(el);
}

function wrappedNext() {
	var el = this.element;
	do {
		el = el.nextSibling;
	} while (el && el.nodeType !== 1);
	return UiElement.tryGet(el);
}
