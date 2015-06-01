module.exports = [
	{ caption: 'File', name: 'file', items: [
		{ caption: 'New', name: 'new' },
		{ caption: 'Open...', name: 'open' },
		{ caption: 'Save', name: 'save' },
		{ caption: 'Save As...', name: 'saveAs' }
	]},
	{ caption: 'Edit', name: 'edit', items: [
		{ caption: 'Undo', name: 'undo' },
		{ caption: 'Redo', name: 'redo' },
		{ caption: 'Cut', name: 'cut' },
		{ caption: 'Copy', name: 'copy' },
		{ caption: 'Paste', name: 'paste' }
	] },
	{ caption: 'Tests', name: 't', items: [
		{ icon: 'box', caption: 'Horizontal submenu', name: 't1', direction: 'horizontal', items: [
			{ caption: 'Test 1-A', name: 't1a' },
			{ caption: 'Test 1-B', name: 't1b' }
		]},
		{ icon: 'circle', caption: 'Vertical submenu', name: 't2', items: [
			{ caption: 'Test 2-A', name: 't2a' },
			{ caption: 'Test 2-B', name: 't2b' }
		]},
	]}
];
