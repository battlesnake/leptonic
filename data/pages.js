var classes = require('./classes');
var NamedList = classes.NamedList;
var Page = classes.Page;

module.exports = new NamedList([
	new Page('index', 'Leptonic', '/'),
	new Page('editor', 'Editor', '/editor.html')
]);
