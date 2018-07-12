var util = module.exports = {};

/**
 * Add an 's' to a string if necessary
 * @param [number] num - the number of objects
 * @param [string] string - the name of the object
 * @returns [string] A string in the format of '<num> <string>/s'
 */
util.pluralize = function(num, string) {
	if(num > 1) string += 's';

	return `${num} ${string}`;
};

/**
 * Add commas to an array of strings
 * @param [string[]] arr - the strings to commify
 * @returns [string] a commified string
 */
util.commify = function(arr) {
	switch(arr.length) {
		case 0:
			return;

		case 1:
			return arr[0];

		case 2:
			return `${arr[0]} and ${arr[1]}`;

		default:
			let last = arr.pop();

			return arr.join(', ') + ` and ${last}`;
	}
};