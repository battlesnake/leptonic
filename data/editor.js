'use strict';

var _ = require('lodash');

var buttons = [
	{ name: 'insert-mode', icon: 'plus', hotkey: 'i' },
	{ name: 'delete-mode', icon: 'minus', hotkey: 'd' },
	{ name: 'box', icon: 'box', hotkey: 'b' },
	{ name: 'circle', icon: 'circle', hotkey: 'c' },
	{ name: 'corners', icon: 'corners', hotkey: 'x' },
	{ name: 'r1', icon: null, text: 'Right #1' },
	{ name: 'r2', icon: null, text: 'Right #2' },
	{ name: 'r3', icon: null, text: 'Right #3' },
	{ name: 'b1', icon: null, text: 'Bottom #1' },
	{ name: 'b2', icon: null, text: 'Bottom #2' },
	{ name: 'b3', icon: null, text: 'Bottom #3' }
];
var buttonsObj = _.indexBy(buttons, 'name');

var toolbars = [
	{ name: 'top', buttons: ['insert-mode', 'delete-mode'] },
	{ name: 'left', buttons: ['box', 'circle', 'corners'] },
	{ name: 'right', buttons: ['r1', 'r2', 'r3'] },
	{ name: 'bottom', buttons: ['b1', 'b2', 'b3'] }
];
var toolbarsObj = _(toolbars)
	.map(function (toolbar) {
		return {
			name: toolbar.name,
			buttons: toolbar.buttons.map(function (name) {
				return buttonsObj[name];
			})
		};
	})
	.indexBy('name')
	.value();

module.exports = {
	buttons: buttonsObj,
	toolbars: toolbarsObj
};
