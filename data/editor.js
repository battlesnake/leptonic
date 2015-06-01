'use strict';

var _ = require('lodash');

var buttons = [
	{ name: 'insert-mode', icon: 'plus', caption: 'Insert mode', hotkey: 'i' },
	{ name: 'select-mode', icon: 'select', caption: 'Select mode', hotkey: 's' },
	{ name: 'command-mode', icon: 'command', caption: 'Command mode', hotkey: 'c' },
	{ name: 'box', icon: 'box', hotkey: 'b' },
	{ name: 'circle', icon: 'circle', hotkey: 'c' },
	{ name: 'corners', icon: 'corners', hotkey: 'x' },
	{ name: 'r1', icon: null, caption: 'Right #1' },
	{ name: 'r2', icon: null, caption: 'Right #2' },
	{ name: 'r3', icon: null, caption: 'Right #3' },
	{ name: 'b1', icon: null, caption: 'Bottom #1' },
	{ name: 'b2', icon: null, caption: 'Bottom #2' },
	{ name: 'b3', icon: null, caption: 'Bottom #3' }
];

var toolbars = [
	{ name: 'top', buttons: ['insert-mode', 'select-mode', 'command-mode'] },
	{ name: 'left', buttons: ['box', 'circle', 'corners'] },
	{ name: 'right', buttons: ['r1', 'r2', 'r3'] },
	{ name: 'bottom', buttons: ['b1', 'b2', 'b3'] }
];
var toolbarsObj = _(toolbars)
	.map(function (toolbar) {
		return {
			name: toolbar.name,
			buttons: getButtons(buttons, toolbar.buttons)
		};
	})
	.indexBy('name')
	.value();

function getToolbar(toolbar) {
	return {
		name: toolbar.name,
		buttons: getButtons(buttons, toolbar.buttons)
	};
}

function getToolbars(toolbars) {
	return _(toolbars)
		.map(getToolbar)
		.indexBy('name')
		.value();
}

function getButton(buttons, name) {
	var button = _.find(buttons, { name: name });
	if (!button) {
		throw new Error('Failed to find toolbar button "' + name + '"');
	}
	return button;
}

function getButtons(buttons, names) {
	return names.map(function (buttonName) {
		return getButton(buttons, buttonName);
	});
}

module.exports = {
	buttons: buttons,
	toolbars: toolbars,
	getButtons: getButtons,
	getToolbars: getToolbars
};
