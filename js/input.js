var Hammer = require('hammerjs');
var _ = require('lodash');
var $ = require('jquery');

var Timer = require('./timer');

module.exports = {
	onTap: onTap,
	onPress: onPress,
	onPan: onPan,
	onEnter: onEnter,
	onLeave: onLeave,
	onEnterLeave: onEnterLeave,
	onDelayedHover: onDelayedHover
};

function getHammer(element) {
	if (!element.hammer) {
		var hammer = element.hammer = new Hammer.Manager(element, {});
		hammer.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL,
			threshold: 4 }));
		hammer.add(new Hammer.Tap({ event: 'tap' }));
		hammer.add(new Hammer.Tap({ event: 'press' }));
	}
	return element.hammer;
}

function onTap(element, handler) {
	var hammer = getHammer(element);
	hammer.on('tap', function (event) {
		handler.call(element, event);
	});
}

function onPress(element, handler) {
	var hammer = getHammer(element);
	hammer.on('press', function (event) {
		handler.call(element, event);
	});
}

function onPan(element, handler) {
	var hammer = getHammer(element);
	hammer.on('pan panstart panend panmove', function (event) {
		handler.call(element, event);
	});
}

function onEnter(element, handler) {
	$(element).on('mouseover', function (event) {
		handler.call(element, event);
	});
}

function onLeave(element, handler) {
	$(element).on('mouseout', function (event) {
		handler.call(element, event);
	});
}

function onEnterLeave(element, handler) {
	onEnter(element, function (event) {
		handler.call(element, event, true);
	});
	onLeave(element, function (event) {
		handler.call(element, event, false);
	});
}

function onDelayedHover(element, options, handler) {
	var defaults = {
		enterDelay: 400,
		leaveDelay: 400
	};
	options = _.assign({}, defaults, options);

	var enterTimer = new Timer(options.enterDelay, {}, entered);
	var leaveTimer = new Timer(options.leaveDelay, {}, left);

	onEnter(element, entering);
	onLeave(element, leaving);

	function entering() {
		leaveTimer.stop();
		enterTimer.start();
	}

	function leaving() {
		enterTimer.stop();
		leaveTimer.start();
	}

	function entered() {
		handler.call(element, true);
	}

	function left() {
		handler.call(element, false);
	}
}
