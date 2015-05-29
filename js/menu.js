var _ = require('lodash');
var input = require('./input');
var dom = require('./dom');

module.exports = Menu;

function Menu(element, onSelect) {
	var self = {};

	self.element = element;
	self.onSelect = onSelect;

	self.items = _.map(element.findAll('>.menu-item'),
		function (element) {
			return new MenuItem(element, onSelect);
		});

	return self;
}

function MenuItem(element, onSelect) {
	var self = {};

	self.element = element;

	var submenuElement = element.find('>.submenu>.menu');

	self.hasSubmenu = !!submenuElement;

	if (self.hasSubmenu) {
		self.submenu = new Menu(submenuElement, onSelect);
	}

	input.onTap(element, onTap);
	input.onEnterLeave(element, onEnterLeave);
	input.onDelayedHover(element, { enterDelay: 400, leaveDelay: 800 }, onHover);

	function onEnterLeave(event, over) {
		element.classList.toggle('highlight', over);
	}

	function onHover(over) {
		setSubmenuState(over);
	}

	function onTap(event) {
		event.preventDefault();
		if (self.hasSubmenu) {
			setSubmenuState(true);
		} else {
			setActiveMenu(null);
			if (onSelect) {
				onSelect(element);
			}
		}
	}
	
	function setSubmenuState(isOpen) {
		if (isOpen) {
			setActiveMenu(element);
		} else {
			element.classList.remove('show-submenu', isOpen);
		}
	}

}

var blocker;

function setActiveMenu(menu) {
	/* List of menu items that should be "active" */
	var active = (menu ? menu.getParents(true) : [])
		.filter(function (item) {
			return item.classList.contains('menu-item');
		});
	/* List of menu item's who's state we will ignore */
	var ignore = (menu ? menu.findAll('.menu-item') : []);
	/* Apply */
	document.body.findAll('.menu-item')
		.filter(function (item) {
			return ignore.indexOf(item) === -1;
		})
		.forEach(function (item) {
			item.classList.toggle('show-submenu', active.indexOf(item) !== -1);
		});
	/* Input blocker - clicks outside the menu area close the menu instantly */
	if (!blocker) {
		blocker = document.body.find('#menu-input-blocker');
		input.onTap(blocker, function () {
			setActiveMenu(null);
		});
	}
	blocker.classList.toggle('active', menu);
}
