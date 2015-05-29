var _ = require('lodash');

module.exports = Timer;

var defaults = {
	stacks: false
};

function Timer(interval, options, callback) {
	options = _.assign({}, defaults, options);
	var self = {};

	var timer;

	self.interval = interval;
	self.options = options;

	self.start = start;
	self.abort = abort;
	self.stop = abort;
	
	return self;

	function start() {
		if (timer && !options.stacks) {
			return;
		}
		abort();
		timer = setTimeout(onTimer, interval);
	}

	function abort() {
		if (timer) {
			clearTimeout(timer);
		}
		timer = null;
	}

	function onTimer() {
		abort();
		callback();
	}

}
