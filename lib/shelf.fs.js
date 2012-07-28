/**
 * ## File System storage for Shelf.js
 * 
 * ### Available only in Node.JS
 */
 (function(exports) {

	var store = exports.store;
	if (!store) return;
	 
	if ('undefined' !== typeof module && 'undefined' !== typeof module.exports) {
		return;
	} 
	
	var fs = require('fs'),
		path = require('path');
	
	var file = {},
		timeout = {};
	
	store.addType("fs", function(key, value, options) {
		
		if (!key) {
			return load(file);
		}
	
		if (value === undefined) {
			return load(key);
		}
	
		if (timeout[key]) {
			clearTimeout(timeout[key]);
			delete timeout[key];
		}
	
		if (value === null) {
			delete memory[key];
			return null;
		}
	
		memory[key] = value;
		if (options.expires) {
			timeout[key] = setTimeout(function() {
				delete memory[key];
				delete timeout[key];
			}, options.expires);
		}
	
		return value;
	});
}(this));