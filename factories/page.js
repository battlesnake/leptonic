var Page = require('../classes/page');

module.exports = pageFactory;

function pageFactory(repositories) {

	PageProxy.prototype = new Page();

	return PageProxy;

	function PageProxy(name, title, url) {
		return new Page(name, title, url);
	}

}
