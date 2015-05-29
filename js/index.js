var Menu = require('./menu');


window.addEventListener('DOMContentLoaded', initMenu);

function initMenu() {
	var mainMenu = new Menu(document.getElementById('main-menu'), mainMenuSelect);
}

function mainMenuSelect(el) {
	alert(el.dataset.name);
}
