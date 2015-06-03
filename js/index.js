var changeCase = require('change-case');
var _ = require('lodash');

var UiElement = require('./ui-element');
var Menu = require('./menu');

window.addEventListener('DOMContentLoaded', initMenu);

var menus = {};

function initMenu() {
	_.each(UiElement.body.findMany('.menu'), function (element) {
		var name = changeCase.camel(element.dataset.name);
		menus[name] = UiElement.tryGet(element) || new Menu(element, menuSelect);
	});
	var mainMenu = menus.main;
}

function menuSelect(item) {
	alert(item.actionName);
}
