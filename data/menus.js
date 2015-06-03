var classes = require('./classes');
var NamedList = classes.NamedList;
var Menu = classes.Menu;

module.exports = new NamedList([
	new Menu('main', 'horizontal', ['file', 'edit', 'view']),
	new Menu('file', 'vertical', ['new', 'open', 'save', 'saveAs', 'close']),
	new Menu('edit', 'vertical', ['undo', 'redo', 'cut', 'copy', 'paste', 'delete']),
	new Menu('view', 'vertical', ['toggle-captions', 'toggle-hotkeys', 'ui-size']),
	new Menu('ui-size', 'vertical', ['ui-small', 'ui-medium', 'ui-large'])
]);
