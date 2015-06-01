module.exports = Page;

Page.prototype = {};

function Page(name, title, url) {
	if (!arguments.length) {
		return;
	}
	this.name = name;
	this.title = title;
	this.url = url;
}

