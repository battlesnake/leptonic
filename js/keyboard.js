var dom = require('./dom');
var _ = require('lodash');

module.exports = {
	onKey: onKey
};

var keyMappings = {
	'AltGraph': 'Meta',
	'Alt': 'Meta',
	'Dead': null,
	'Unidentified': null,
	'Compose': null,
	'': null
};

var modMappings = {
	'alt': 'meta'
};

var filters = {
	all: function (data, event) { return true; },
	ctrl: function (data, event) { return /C-/.test(data.code); },
	alt: function (data, event) { return /A-/.test(data.code); },
	meta: function (data, event) { return /M-/.test(data.code); },
	shift: function (data, event) { return /S-/.test(data.code); },
	browser: function (data, event) { return /F[45]$|C-t$|Tab$|Page/.test(data.code); },
	modifier: function (data, event) { return /(Control|Meta|Alt|Shift)$/.test(data.code); },
};

onKey.mappings = {
	keys: keyMappings,
	modifiers: modMappings
};
onKey.filters = filters;

var handlers = [];

window.addEventListener('keydown', receiveKey);
window.addEventListener('keyup', receiveKey);

/*
 * Don't assume that every DOWN has an UP event.
 *
 *  * Firefox doesn't always generate the UP event.
 *  * When using modifiers, the UP event may have different key-code to the
 *    DOWN event.  The number of UP events may differ from the number of DOWN
 *    events.
 */

/*
 * Collect input that is directed to an element or to its children.
 *
 * See documentation for receiveKey.
 *
 * callback: ({ type, code, key, element}, event)
 *
 *  * type: 'down' | 'up' | 'press'
 *  * code: vim style code (e.g M-F4, C-t)
 *  * key: browser key code
 *  * element: target element
 *
 */
function onKey(element, handler, filterNames) {
	var filters = (filterNames || '!browser')
		.split(/,?\s+/g)
		.map(getFilter);
	var i, level = element.getLevel();
	for (i = 0; i < handlers.length; i++) {
		if (handlers[i].element.getLevel() <= level) {
			break;
		}
	}
	handlers.splice(i, 0, { element: element, handler: handler, filter: filter });
	return;

	function filter() {
		var args = arguments;
		return _.all(filters, function (fn) {
			return fn.apply(null, args);
		});
	}
}

/* Get a filter by name, e.g. all, ctrl, !alt */
function getFilter(name) {
	var not = name.charAt(0) === '!';
	if (not) {
		name = name.substr(1);
	}
	var filter = filters[name];
	if (!filter) {
		throw new Error('Keyboard input filter "' + name + '" not found');
	}
	if (not) {
		return function () {
			return !filter.apply(null, arguments);
		};
	} else {
		return filter;
	}
}

/*
 * Not all browsers generate a useable keypress event (useable by my standards)
 * so we create our own instead.
 */
var lastKeyDown = null;

/*
 * Receives key events from the window and dispatches to handlers
 *
 * If the callback returns truthy, then the event processor continues looking
 * for handlers that can accept the event (i.e. which are bound to the element
 * or it's ancestors).
 *
 * If the callback returns falsy or the callback itself is falsy, the event is
 * not propagated to parents or to other handlers on this element.
 *
 * i.e. if the callback does not return true, the event is consumed.
 *
 * If the callback returns 'stop', then no more handlers are processed, but the
 * event will not be consumed, so the browser can still handle it.
 *
 * Handlers are processed in order of descending DOM depth.
 */
function receiveKey(event) {
	var code = keyCodeStr(event);
	if (!code) {
		return;
	}
	var type = event.type; 
	var target = event.target;
	var data = {
		state: event.type.replace(/^key/, ''),
		code: code,
		key: event.key,
		element: target
	};
	/*
	 * Generate key-press events for:
	 *  * repeat "down" messages
	 *  * only the first "up" message
	 * where the key string is exactly the same as that of the last "down"
	 * message.
	 *
	 * Do not generate duplicate consecutive "down" messages, convert to
	 * key-press instead.
	 */
	if (lastKeyDown && data.code === lastKeyDown.code) {
		var pressData = _.clone(data);
		pressData.state = 'press';
		dispatchEvent(pressData, event);
		if (data.state === 'down') {
			/* Don't generate duplicate "down" events */
			return;
		}
	}
	if (data.state === 'down') {
		lastKeyDown = data;
	}
	if (data.state === 'up') {
		lastKeyDown = null;
	}
	dispatchEvent(data, event);
}

/* Dispatch a keyboard event */
function dispatchEvent(data, event) {
	var invalidHandlers = [];
	/* Iterate over handlers */
	for (var i = 0; i < handlers.length; i++) {
		var handler = handlers[i].handler;
		var element = handlers[i].element;
		var filter = handlers[i].filter;
		/* Mark invalid handlers (element not in DOM) for removal */
		if (!document.body.contains(element)) {
			invalidHandlers.push(i);
		}
		/* If element is or is parent of target, notify it */
		if (data.element.hasParent(element, true) && filter(data, event)) {
			var action = handler && handler(data, event);
			if (!action || action === 'consume') {
				/* Falsy or 'consume': Consume the input (browser won't handle it) */
				event.preventDefault();
				return;
			} else if (action === 'stop') {
				/* Action is "stop": stop processing event, let browser handle it */
				return;
			} else if (action === true || action === 'continue') {
				/* nothing */
			} else {
				throw new Error('Invalid keyboard event action: "' + action + '"');
			}
		}
	}
	/* Remove invalid handlers */
	while (invalidHandlers.length) {
		var idx = invalidHandlers.pop();
		handlers.splice(idx, 1);
	}
}

/*
 * Translates key event to vim-style key identification string e.g. S-M-Tab
 *
 * Keys with single-character names will always have the name part lowercased.
 */
function keyCodeStr(event) {
	var key = getKey(event.key, keyMappings);
	if (!key) {
		return;
	}
	if (key.length === 1) {
		key = key.toLowerCase();
	}
	var mods = getMods(event, modMappings);
	/* Map modifiers */
	var alt = mods.alt && key !== 'Alt';
	var meta = mods.meta && key !== 'Meta';
	var ctrl = mods.ctrl && key !== 'Control';
	var shift = mods.shift && key !== 'Shift';
	/* Order of modifiers: SCAM */
	return [shift && 'S', ctrl && 'C', alt && 'A', meta && 'M', key]
		.filter(function (s) { return !!s; })
		.join('-');
}

/* Map key */
function getKey(key, mappings) {
	if (key in mappings) {
		key = mappings[key];
	}
	return key;
}

/* Map modifiers */
function getMods(event, mappings) {
	var mods = {
		alt: false,
		meta: false,
		ctrl: false,
		shift: false
	};
	if (event.altKey) {
		mods[mappings.alt || 'alt'] = true;
	}
	if (event.metaKey) {
		mods[mappings.meta || 'meta'] = true;
	}
	if (event.ctrlKey) {
		mods[mappings.ctrl || 'ctrl'] = true;
	}
	if (event.shiftKey) {
		mods[mappings.shift || 'shift'] = true;
	}
	return mods;
}

function demo() {
	var log = [];
	onKey(document.body,
		function (data) {
			if (data.state) {
				log.unshift(data.code + ' (' + data.state + ')');
				if (log.length > 20) {
					log.length = 20;
				}
			}
			var html = '<h1>Keyboard input demo</h1>';
			html += '<p><strong style="border: 2px solid black; margin: 10px;">' + (data.state === 'up' ? '&nbsp;' : data.code) + '</strong></p>';
			html += '<ol>' + log.map(function (s) {
				return '<li>' + s + '</li>';
			}).join('') + '</ol>';
			document.body.innerHTML = html;
		},
		onKey.filters.notBrowser
	);
}
