//deps
const sketch = require('sketch');
const util = require('./util');

//global object
var app = {
	useCustomFunction: false
};

//public methods
/**
 * call adjustToFit on the selected layers
 */
app.adjustSelected = function() {
	app.runPlugin(false, false);
};

/**
 * call adjustToFit on the selected layers and their children
 */
app.adjustNested = function() {
	app.runPlugin(false, true);
};

/**
 * call custom adjustToFit that includes invisible children on the selected layers
 */
app.adjustSelectedInvisible = function() {
	app.runPlugin(true, false);
};

/**
 * call custom adjustToFit that includes invisible children on the selected layers and their children
 */
app.adjustNestedInvisible = function() {
	app.runPlugin(true, true);
};

//private methods
/**
 * Call adjustLayers and print results
 * @param [boolean] includeInvisible - whether to use custom adjustToFit function
 * @param [boolean] nested - whether to adjust children
 */
app.runPlugin = function(includeInvisible, nested) {
	let document = sketch.getSelectedDocument();
	let layers = document.selectedLayers;

	app.useCustomFunction = includeInvisible;

	let results = app.adjustLayers(layers, nested);

	sketch.UI.message(app.resultsString(results));
};

/**
 * Recursive functions to call adjustToFit on the given layers and return the results
 * @param [SketchLayer[]] layers - the layers to adjust
 * @param [boolean] nested - Whether this function should be called recursively for layers with children
 * @returns [object] The results
 */
app.adjustLayers = function(layers, nested) {
	let results = {};

	layers.forEach((layer) => {
		let layerResults = {};

		if(nested && layer.layers) {
			let nestedResults = app.adjustLayers(layer.layers, nested);

			for(let cat in nestedResults)
				if(nestedResults.hasOwnProperty(cat))
					layerResults = nestedResults;

			delete layerResults.failed;
		}

		//keep track of whether or not the height was changed
		let oldHeight = layer.sketchObject.frame().height();

		let result = app.adjustToFit(layer);

		let newHeight = layer.sketchObject.frame().height();

		//group results by layer type, 'unaffected', or 'failed'
		let cat = 'failed';

		if(result) {
			if(newHeight !== oldHeight)
				cat = layer.type.toLowerCase()
			else
				cat = 'unaffected';
		}

		//add selected layer to layerResults
		layerResults[cat] = (layerResults[cat] + 1) || 1;

		//add layerResults to results
		for(let cat in layerResults)
			if(layerResults.hasOwnProperty(cat))
				results[cat] = (results[cat] + layerResults[cat]) || layerResults[cat];
	});

	return results;
};

/**
 * Call adjustToFit on a layer and return the result
 * @param [SketchLayer] layer - the layer to adjust
 * @returns [boolean] whether or not the layer was adjusted
 */
app.adjustToFit = function(layer) {
	switch(layer.type) {
		case 'Group':
		case 'Artboard':
		case 'SymbolMaster':
			app.adjustLayerToFit(layer);
			break;

		case 'Text':
			app.adjustTextToFit(layer);
			break;

		default:
			return false;
	}

	return true;
};

/**
 * Adjust a layer based on its contents
 * @param [SketchLayer] layer - the layer to adjust
 */
app.adjustLayerToFit = function(layer) {
	if(app.useCustomFunction) {
		//make our own adjustToFit function
		//create a new rectangle for the layer
		let newFrame = { x: Infinity, y: Infinity, width: 0, height: 0 };

		layer.layers.forEach((child) => {
			newFrame.x      = Math.min(newFrame.x,      child.frame.x);
			newFrame.y      = Math.min(newFrame.y,      child.frame.y);
			newFrame.width  = Math.max(newFrame.width,  child.frame.x + child.frame.width);
			newFrame.height = Math.max(newFrame.height, child.frame.y + child.frame.height);
		});

		//adjust everything to new coordinates
		newFrame.width -= newFrame.x;
		newFrame.height -= newFrame.y;

		layer.layers.forEach((child) => {
			child.frame.x -= newFrame.x;
			child.frame.y -= newFrame.y;
		});

		//apply new rectangle
		layer.frame.offset(newFrame.x, newFrame.y)
		layer.frame.width = newFrame.width;
		layer.frame.height = newFrame.height;
	} else
		layer.adjustToFit();
};

/**
 * Adjust a textbot based on its contents
 * @param [SketchLayer] layer - the text layer to adjust
 */
app.adjustTextToFit = function(layer) {
	let firstFrag = layer.fragments[0];
	let lastFrag = layer.fragments[layer.fragments.length - 1];

	//adjust y first for middle/bottom aligned text
	let oldY = layer.frame.y;
	let newY = oldY + firstFrag.rect.y;

	//add up heights of all lines, set new height
	let oldHeight = layer.frame.height;

	//this doesn't work because there can be space between lines
	//(as in empty lines aren't fragments)
	//let newHeight = layer.fragments.reduce((sum, frag) => (sum + frag.rect.height), 0);

	//instead, just do lastFrag.y + lastFrag.height and subtract firstFrag.y for
	//non-top-aligned text
	let newHeight = lastFrag.rect.y + lastFrag.rect.height - firstFrag.rect.y;

	if(newHeight !== oldHeight) {
		layer.frame.y = newY;
		layer.frame.height = newHeight;
	}
};

/**
 * Build a string from a results object returned from #adjustLayers
 * @param [object] results - The results object to use
 * @returns [string] the results string
 */
app.resultsString = function(results) {
	//this isn't ideal but it's easier than putting layer types in their own object
	let numFailed = results.failed;
	delete results.failed;

	let numUnaffected = results.unaffected;
	delete results.unaffected;

	//create an array of '# things' strings
	let plurals = [];

	for(let cat in results) {
		if(results.hasOwnProperty(cat)) {
			let num = results[cat];

			//lazy
			if(cat === 'text') cat = 'text layer';
			if(cat === 'symbolmaster') cat = 'symbol';

			plurals.push(util.pluralize(num, cat));
		}
	}

	//only show relevant parts, join with comma
	let ret = [];

	if(plurals.length > 0) ret.push(`${util.commify(plurals)} adjusted successfully`);
	if(numUnaffected > 0) ret.push(`${util.pluralize(numUnaffected, 'layer')} unaffected`);
	if(numFailed > 0) ret.push(`${numFailed} failed`);

	return ret.join(', ');
};

//done
module.exports.adjustSelected = app.adjustSelected;
module.exports.adjustNested = app.adjustNested;
module.exports.adjustSelectedInvisible = app.adjustSelectedInvisible;
module.exports.adjustNestedInvisible = app.adjustNestedInvisible;
