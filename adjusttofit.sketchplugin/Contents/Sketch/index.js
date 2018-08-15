var that = this;
function __skpm_run (key, context) {
  that.context = context;

var exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

//deps
var sketch = __webpack_require__(/*! sketch */ "sketch");

var util = __webpack_require__(/*! ./util */ "./src/util.js"); //global object


var app = {
  useCustomFunction: false
}; //public methods

/**
 * call adjustToFit on the selected layers
 */

app.adjustSelected = function () {
  app.runPlugin(false, false);
};
/**
 * call adjustToFit on the selected layers and their children
 */


app.adjustNested = function () {
  app.runPlugin(false, true);
};
/**
 * call custom adjustToFit that includes invisible children on the selected layers
 */


app.adjustSelectedInvisible = function () {
  app.runPlugin(true, false);
};
/**
 * call custom adjustToFit that includes invisible children on the selected layers and their children
 */


app.adjustNestedInvisible = function () {
  app.runPlugin(true, true);
}; //private methods

/**
 * Call adjustLayers and print results
 * @param [boolean] includeInvisible - whether to use custom adjustToFit function
 * @param [boolean] nested - whether to adjust children
 */


app.runPlugin = function (includeInvisible, nested) {
  var document = sketch.getSelectedDocument();
  var layers = document.selectedLayers;
  app.useCustomFunction = includeInvisible;
  var results = app.adjustLayers(layers, nested);
  sketch.UI.message(app.resultsString(results));
};
/**
 * Recursive functions to call adjustToFit on the given layers and return the results
 * @param [SketchLayer[]] layers - the layers to adjust
 * @param [boolean] nested - Whether this function should be called recursively for layers with children
 * @returns [object] The results
 */


app.adjustLayers = function (layers, nested) {
  var results = {};
  layers.forEach(function (layer) {
    var layerResults = {};

    if (nested && layer.layers) {
      var nestedResults = app.adjustLayers(layer.layers, nested);

      for (var _cat in nestedResults) {
        if (nestedResults.hasOwnProperty(_cat)) layerResults = nestedResults;
      }

      delete layerResults.failed;
    } //keep track of whether or not the height was changed


    var oldHeight = layer.sketchObject.frame().height();
    var result = app.adjustToFit(layer);
    var newHeight = layer.sketchObject.frame().height(); //group results by layer type, 'unaffected', or 'failed'

    var cat = 'failed';

    if (result) {
      if (newHeight !== oldHeight) cat = layer.type.toLowerCase();else cat = 'unaffected';
    } //add selected layer to layerResults


    layerResults[cat] = layerResults[cat] + 1 || 1; //add layerResults to results

    for (var _cat2 in layerResults) {
      if (layerResults.hasOwnProperty(_cat2)) results[_cat2] = results[_cat2] + layerResults[_cat2] || layerResults[_cat2];
    }
  });
  return results;
};
/**
 * Call adjustToFit on a layer and return the result
 * @param [SketchLayer] layer - the layer to adjust
 * @returns [boolean] whether or not the layer was adjusted
 */


app.adjustToFit = function (layer) {
  switch (layer.type) {
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


app.adjustLayerToFit = function (layer) {
  if (app.useCustomFunction) {
    //make our own adjustToFit function
    //create a new rectangle for the layer
    var newFrame = {
      x: Infinity,
      y: Infinity,
      width: 0,
      height: 0
    };
    layer.layers.forEach(function (child) {
      newFrame.x = Math.min(newFrame.x, child.frame.x);
      newFrame.y = Math.min(newFrame.y, child.frame.y);
      newFrame.width = Math.max(newFrame.width, child.frame.x + child.frame.width);
      newFrame.height = Math.max(newFrame.height, child.frame.y + child.frame.height);
    }); //adjust everything to new coordinates

    newFrame.width -= newFrame.x;
    newFrame.height -= newFrame.y;
    layer.layers.forEach(function (child) {
      child.frame.x -= newFrame.x;
      child.frame.y -= newFrame.y;
    }); //apply new rectangle

    layer.frame.offset(newFrame.x, newFrame.y);
    layer.frame.width = newFrame.width;
    layer.frame.height = newFrame.height;
  } else layer.adjustToFit();
};
/**
 * Adjust a textbot based on its contents
 * @param [SketchLayer] layer - the text layer to adjust
 */


app.adjustTextToFit = function (layer) {
  var firstFrag = layer.fragments[0];
  var lastFrag = layer.fragments[layer.fragments.length - 1]; //adjust y first for middle/bottom aligned text

  var oldY = layer.frame.y;
  var newY = oldY + firstFrag.rect.y; //add up heights of all lines, set new height

  var oldHeight = layer.frame.height; //this doesn't work because there can be space between lines
  //(as in empty lines aren't fragments)
  //let newHeight = layer.fragments.reduce((sum, frag) => (sum + frag.rect.height), 0);
  //instead, just do lastFrag.y + lastFrag.height and subtract firstFrag.y for
  //non-top-aligned text

  var newHeight = lastFrag.rect.y + lastFrag.rect.height - firstFrag.rect.y;

  if (newHeight !== oldHeight) {
    layer.frame.y = newY;
    layer.frame.height = newHeight;
  }
};
/**
 * Build a string from a results object returned from #adjustLayers
 * @param [object] results - The results object to use
 * @returns [string] the results string
 */


app.resultsString = function (results) {
  //this isn't ideal but it's easier than putting layer types in their own object
  var numFailed = results.failed;
  delete results.failed;
  var numUnaffected = results.unaffected;
  delete results.unaffected; //create an array of '# things' strings

  var plurals = [];

  for (var cat in results) {
    if (results.hasOwnProperty(cat)) {
      var num = results[cat]; //lazy

      if (cat === 'text') cat = 'text layer';
      if (cat === 'symbolmaster') cat = 'symbol';
      plurals.push(util.pluralize(num, cat));
    }
  } //only show relevant parts, join with comma


  var ret = [];
  if (plurals.length > 0) ret.push("".concat(util.commify(plurals), " adjusted successfully"));
  if (numUnaffected > 0) ret.push("".concat(util.pluralize(numUnaffected, 'layer'), " unaffected"));
  if (numFailed > 0) ret.push("".concat(numFailed, " failed"));
  return ret.join(', ');
}; //done


module.exports.adjustSelected = app.adjustSelected;
module.exports.adjustNested = app.adjustNested;
module.exports.adjustSelectedInvisible = app.adjustSelectedInvisible;
module.exports.adjustNestedInvisible = app.adjustNestedInvisible;

/***/ }),

/***/ "./src/util.js":
/*!*********************!*\
  !*** ./src/util.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

var util = module.exports = {};
/**
 * Add an 's' to a string if necessary
 * @param [number] num - the number of objects
 * @param [string] string - the name of the object
 * @returns [string] A string in the format of '<num> <string>/s'
 */

util.pluralize = function (num, string) {
  if (num > 1) string += 's';
  return "".concat(num, " ").concat(string);
};
/**
 * Add commas to an array of strings
 * @param [string[]] arr - the strings to commify
 * @returns [string] a commified string
 */


util.commify = function (arr) {
  switch (arr.length) {
    case 0:
      return;

    case 1:
      return arr[0];

    case 2:
      return "".concat(arr[0], " and ").concat(arr[1]);

    default:
      var last = arr.pop();
      return arr.join(', ') + " and ".concat(last);
  }
};

/***/ }),

/***/ "sketch":
/*!*************************!*\
  !*** external "sketch" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("sketch");

/***/ })

/******/ });
  if (key === 'default' && typeof exports === 'function') {
    exports(context);
  } else {
    exports[key](context);
  }
}
that['adjustSelected'] = __skpm_run.bind(this, 'adjustSelected');
that['onRun'] = __skpm_run.bind(this, 'default');
that['adjustNested'] = __skpm_run.bind(this, 'adjustNested');
that['adjustSelectedInvisible'] = __skpm_run.bind(this, 'adjustSelectedInvisible');
that['adjustNestedInvisible'] = __skpm_run.bind(this, 'adjustNestedInvisible')

//# sourceMappingURL=index.js.map