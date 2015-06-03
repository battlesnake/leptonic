var _ = require('lodash');
var input = require('./input');
var UiElement = require('./ui-element');

var hoverOptions = { enterDelay: 400, leaveDelay: NaN };

module.exports = Menu;

Menu.prototype = _.assign(new UiElement(), {
	onSelect: null,
	direction: null,
	items: null,
	parent: null
});

function Menu(element, onSelect, parent) {
	UiElement.call(this, element, true);
	var self = this;

	self.onSelect = onSelect;
	self.parent = parent;
	self.direction =
		element.classList.contains('cols') ? 'horizontal' :
		element.classList.contains('rows') ? 'vertical' :
		'unknown';

	self.items = _.map(self.findMany('>.menu-item'),
		function (element) {
			return new MenuItem(self, element, onSelect);
		});
}

MenuItem.prototype = _.assign(new UiElement(), {
	menu: null,
	submenu: null,
	hasSubmenu: null,
});

function MenuItem(menu, element, onSelect) {
	UiElement.call(this, element, true);
	var self = this;

	var submenuElement = self.findOne('>.submenu>.menu');
	self.menu = menu;
	self.submenu = !!submenuElement ? new Menu(submenuElement, onSelect, self) : null;
	self.hasSubmenu = !!submenuElement;

	self.openSubmenu = openSubmenu;
	self.closeSubmenu = closeSubmenu;

	input.onTap(element, onTap);
	input.onEnterLeave(element, onEnterLeave);
	input.onDelayedHover(element, hoverOptions, onHover);
	input.onKey(element, onKey, '(space || enter || arrow || escape) && !modified', true);

	function onKey(data, event) {
		if (data.state !== 'press') {
			return 'continue';
		}
		if (data.code === 'Escape') {
			if (getSubmenuState()) {
				closeSubmenu();
			} else  if (self.menu.parent) {
				self.menu.parent.closeSubmenu();
				self.menu.parent.focus();
			} else {
				self.blur();
			}
			return 'consume';
		}
		if (data.code === 'Enter') {
			select();
			return 'consume';
		}
		if (data.code === ' ') {
			toggleSubmenu();
			if (self.hasSubmenu) {
				if (getSubmenuState()) {
					if (self.submenu.items.length) {
						self.submenu.items[0].focus();
					}
				}
			} else {
				select();
			}
			return 'consume';
		}
		var navKeys = {
			vertical: { prev: 'ArrowUp', next: 'ArrowDown' },
			horizontal: { prev: 'ArrowLeft', next: 'ArrowRight' }
		}[menu.direction];
		if (navKeys) {
			if (data.code === navKeys.prev) {
				var prev = self.wrappedPrevious();
				if (prev) {
					prev.focus();
				}
				return 'consume';
			} else if (data.code === navKeys.next) {
				var next = self.wrappedNext();
				if (next) {
					next.focus();
				}
				return 'consume';
			}
		}
		return 'continue';
	}

	function onEnterLeave(event, over) {
		element.classList.toggle('highlight', over);
		if (over) {
			self.focus();
		} else {
			self.blur();
		}
	}

	function onHover(over) {
		setSubmenuState(over);
	}

	function onTap(event) {
		event.preventDefault();
		select();
	}

	function openSubmenu() {
		setSubmenuState(true);
	}

	function closeSubmenu() {
		setSubmenuState(false);
	}

	function toggleSubmenu() {
		setSubmenuState(!getSubmenuState());
	}

	function setSubmenuState(isOpen) {
		if (!self.hasSubmenu) {
			return;
		}
		if (isOpen) {
			setActiveMenu(self);
			element.classList.add('show-submenu');
			self.focus();
		} else {
			element.classList.remove('show-submenu');
		}
		self.focus();
	}

	function getSubmenuState() {
		return element.classList.contains('show-submenu');
	}

	function select() {
		if (self.hasSubmenu) {
			openSubmenu();
		} else {
			setActiveMenu(null);
			if (onSelect) {
				onSelect(self);
			}
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
	var ignore = (menu ? menu.findMany('.menu-item') : []);
	/* Apply */
	UiElement.body.findMany('.menu-item')
		.filter(function (item) {
			return ignore.indexOf(item) === -1;
		})
		.forEach(function (item) {
			item.classList.toggle('show-submenu', active.indexOf(item) !== -1);
		});
	/* Input blocker - clicks outside the menu area close the menu instantly */
	if (!blocker) {
		blocker = UiElement.body.findOne('#menu-input-blocker');
		input.onTap(blocker, function () {
			setActiveMenu(null);
		});
	}
	blocker.classList.toggle('active', menu);
}
