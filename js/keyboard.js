var _ = require('lodash');
var UiElement = require('./ui-element');
var arithmetic = require('dslap').parsers.arithmetic;

module.exports = {
	onKey: onKey
};

/* Map keys (null to ignore key) */
var keyMappings = {
	'AltGraph': 'Meta',
	'Alt': 'Meta',
	'Dead': null,
	'Unidentified': null,
	'Compose': null,
	'': null
};

/* Map modifiers */
var modMappings = {
	'alt': 'meta'
};

/* Map resulting key code strings */
var codeMappings = {
	'C-[': 'Escape'
};

var filters = {
	all: function (data, event) { return true; },
	ctrl: function (data, event) { return /C-/.test(data.code); },
	alt: function (data, event) { return /A-/.test(data.code); },
	meta: function (data, event) { return /M-/.test(data.code); },
	shift: function (data, event) { return /S-/.test(data.code); },
	space: function (data, event) { return data.code === ' '; },
	enter: function (data, event) { return data.code === 'Enter'; },
	escape: function (data, event) { return data.code === 'Escape'; },
	arrow: function (data, event) { return /Arrow(Left|Up|Right|Down)$/.test(data.code); },
	browser: function (data, event) { return /(F[45]|C-[wt]|Tab)$/.test(data.code); },
	modifier: function (data, event) { return /(Control|Meta|Alt|Shift)$/.test(data.code); },
	modified: function (data, event) { return /[SCAM]-/.test(data.code); }
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
 * callback: ({ type, code, key, element }, event)
 *
 *  * type: 'down' | 'up' | 'press'
 *  * code: vim style code (e.g M-F4, C-t)
 *  * key: browser key code
 *  * element: target element
 *
 */
function onKey(element, handler, filterExpression, directOnly) {
	var i, level = UiElement.getLevel(element);
	for (i = 0; i < handlers.length; i++) {
		var trial = handlers[i], trialLevel = UiElement.getLevel(trial.element);
		if (level > trialLevel ||
			(level === trialLevel && (directOnly || !trial.directOnly))) {
			break;
		}
	}
	handlers.splice(i, 0, { element: element, callback: handler, filter: parseFilters(filterExpression), direct: directOnly });
	return;

	function filter() {
		var args = arguments;
		return _.all(filters, function (fn) {
			return fn.apply(null, args);
		});
	}
}

function parseFilters(filterExpression) {
	var evaluators;
	try {
		var evaluator = arithmetic(filterExpression);
		return executeFilter;
	} catch(e) {
		throw new Error('Invalid filter expression: "' + filterExpression + '"\nError: ' + e.message);
	}

	function executeFilter(data, event) {
		var scope = {};
		_.each(filters, bindFilter);
		try {
			return evaluator(scope);
		} catch (e) {
			throw new Error('Invalid filter expression: "' + filterExpression + '"\nError: ' + e.message);
		}

		function bindFilter(func, name) {
			Object.defineProperty(scope, name, { get: getter, enumerable: true });

			function getter() {
				return func(data, event);
			}
		}
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
 * If the callback returns 'continue', then the event processor continues
 * looking for handlers that can accept the event (i.e. which are bound to the element
 * or it's ancestors).
 *
 * If the callback returns 'consume' or the callback itself is falsy, the event
 * is not propagated to parents or to other handlers on this element.
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
		var handler = handlers[i];
		var callback = handler.callback;
		var element = handler.element;
		var filter = handler.filter;
		var direct = handler.direct;
		/* Mark invalid handlers (element not in DOM) for removal */
		if (!document.body.contains(element)) {
			invalidHandlers.push(i);
		}
		/* If element is or is parent of target, notify it */
		if ((data.element === element || !direct && UiElement.hasParent(data.element, element)) && filter(data, event)) {
			var action = callback ? callback(data, event) : 'consume';
			if (action === 'consume') {
				/* Stop processing, don't pass to browser */
				event.preventDefault();
				return;
			} else if (action === 'stop') {
				/* Stop processing, pass to browser */
				return;
			} else if (action === 'continue') {
				/* Keep processing */
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
	var code = [shift && 'S', ctrl && 'C', alt && 'A', meta && 'M', key]
		.filter(function (s) { return !!s; })
		.join('-');
	return getCode(code, codeMappings);
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

function getCode(code, mappings) {
	if (code in mappings) {
		return mappings[code];
	} else {
		return code;
	}
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
			return 'consume';
		},
		'!browser'
	);
}
