//deps
const sketch = require('sketch');
const util = require('./util');

//global object
var app = {};

//public methods
/**
 * call adjustToFit on the selected layers
 */
app.adjustSelected = function() {
	let document = sketch.getSelectedDocument();
	let layers = document.selectedLayers;

	let results = app.adjustLayers(layers, false);

	sketch.UI.message(app.resultsString(results));
};

/**
 * call adjustToFit on the selected layers and their children
 */
app.adjustNested = function() {
	let document = sketch.getSelectedDocument();
	let layers = document.selectedLayers;

	let results = app.adjustLayers(layers, true);

	sketch.UI.message(app.resultsString(results));
};

//private methods
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
	if(layer.type !== 'Group' && layer.type !== 'Text' && layer.type !== 'Artboard')
		return false;

	if(layer.type === 'Group' || layer.type === 'Artboard')
		layer.adjustToFit();
	else
		app.adjustTextToFit(layer);

	return true;
};

/**
 * Adjust a textbot based on its contents
 * @param [SketchLayer] layer - the text layer to adjust
 */
app.adjustTextToFit = function(layer) {
	//adjust y first for middle/bottom aligned text
	let oldY = layer.sketchObject.frame().y();
	let newY = oldY + layer.fragments[0].rect.y;

	layer.sketchObject.frame().y = newY;

	//add up heights of all lines, set new height
	let oldHeight = layer.sketchObject.frame().height();
	let newHeight = layer.fragments.reduce((sum, frag) => (sum + frag.rect.height), 0);

	layer.sketchObject.frame().height = newHeight;
}

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
