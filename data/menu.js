'use strict';

module.exports = [
	{ title: 'File', name: 'file', items: [
		{ title: 'New', name: 'new' },
		{ title: 'Open...', name: 'open' },
		{ title: 'Save', name: 'save' },
		{ title: 'Save As...', name: 'saveAs' }
	]},
	{ title: 'Edit', name: 'edit', items: [
		{ title: 'Undo', name: 'undo' },
		{ title: 'Redo', name: 'redo' },
		{ title: 'Cut', name: 'cut' },
		{ title: 'Copy', name: 'copy' },
		{ title: 'Paste', name: 'paste' }
	] },
	{ title: 'Test 1', name: 't1', items: [
		{ title: 'Test 2', name: 't2', items: [
			{ title: 'Test 3', name: 't3' }
		]},
		{ title: 'Test 4', name: 't4', items: [
			{ title: 'Test 5', name: 't5' }
		]},
	]}
];
