/**
 * # Shelf.JS 
 * 
 * Persistent Client-Side Storage @VERSION
 * 
 * Copyright 2012 Stefano Balietti
 * GPL licenses.
 * 
 * ---
 * 
 */
(function(exports){

var version = '0.3';

var store = exports.store = function (key, value, options, type) {
	options = options || {};
	type = (options.type && options.type in store.types) ? options.type : store.type;
		
	if (store.verbosity > 0) {
		store.log('I am using storage type ' + type);
	}
	
	return store.types[type](key, value, options);
};

// Adding functions and properties to store
///////////////////////////////////////////
store.name = "__shelf__";

store.verbosity = 0;
store.types = {};
store.type = null;

store.addType = function (type, storage) {
	if (!store.type) {
		store.type = type;
	}

	store.types[type] = storage;
	store[type] = function (key, value, options) {
		options = options || {};
		options.type = type;
		return store(key, value, options);
	};
};

store.error = function() {
	return "shelf quota exceeded"; 
};

store.log = function(text) {
	console.log('Shelf v.' + version + ': ' + text);
};

Object.defineProperty(store, 'persistent', {
	set: function(){},
	get: function(){
		// If we have only memory type enabled 
		return (store.types.length < 2) ? false : true;
	},
	configurable: false,
});

store.decycle = function(o) {
	if (JSON && JSON.decycle && 'function' === typeof JSON.decycle) {
		o = JSON.decycle(o);
	}
	return o;
};
    
store.retrocycle = function(o) {
	if (JSON && JSON.retrocycle && 'function' === typeof JSON.retrocycle) {
		o = JSON.retrocycle(o);
	}
	return o;
};

store.stringify = function(o) {
	if (!JSON || !JSON.stringify || 'function' !== typeof JSON.stringify) {
		throw new Error('JSON.stringify not found. Received non-string value and could not serialize.');
	}
	
	o = store.decycle(o);
	return JSON.stringify(o);
};

store.parse = function(o) {
	if ('undefined' === typeof o) return undefined;
	if (JSON && JSON.parse && 'function' === typeof JSON.parse) {
		try {
			o = JSON.parse(o);
		}
		catch (e) {
			store.log('Error while parsing a value', 'ERR');
		}
	}
	
	o = store.retrocycle(o);
	return o;
};

// ## In-memory storage
// ### fallback for all browsers to enable the API even if we can't persist data
(function() {
	
	var memory = {},
		timeout = {};
	
	function copy(obj) {
		return store.parse(store.stringify(obj));
	}

	store.addType("volatile", function(key, value, options) {
		
		if (!key) {
			return copy(memory);
		}

		if (value === undefined) {
			return copy(memory[key]);
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
}());

}('undefined' !== typeof module && 'undefined' !== typeof module.exports ? module.exports: this));

/**
 * ## File System storage for Shelf.js
 * 
 * ### Available only in Node.JS
 */

(function(exports) {
	
var store = exports.store;

if (!store) {
	console.log('ERR: shelf.js not found');
	return;
}
	


var fs = require('fs'),
	path = require('path'),
	util = require('util');

// https://github.com/jprichardson/node-fs-extra/blob/master/lib/copy.js
var copyFile = function(srcFile, destFile, cb) {
    var fdr, fdw;
    fdr = fs.createReadStream(srcFile);
    fdw = fs.createWriteStream(destFile);
    fdr.on('end', function() {
      return cb(null);
    });
    return fdr.pipe(fdw);
  };


var timeout = {},
	file = store.name || 'shelf.out';

var overwrite = function (fileName, items) {
	var file = fileName || file;
	if (!file) {
		store.log('You must specify a valid file.', 'ERR');
		return false;
	}
	
	var tmp_copy = '.' + file;
	
//	console.log('files')
//	console.log(file);
//	console.log(fileName);
//	console.log(tmp_copy)
	
	copyFile(file, tmp_copy, function(){
		var s = store.stringify(items);
		// removing leading { and trailing }
		s = s.substr(1, s = s.substr(0, s.legth-1));
//		console.log('SAVING')
//		console.log(s)
		fs.writeFile(file, s, 'utf-8', function(e) {
			if (e) throw e;
			fs.unlink(tmp_copy, function (err) {
				if (err) throw err;  
			});
			return true;
		});

	});
	
};

var save = function (fileName, key, value) {
	var file = fileName || file;
	if (!file) {
		store.log('You must specify a valid file.', 'ERR');
		return false;
	}
	if (!key) return;
	
	var item = store.stringify(key) + ": " + store.stringify(value) + ",\n";
	
	return fs.appendFileSync(file, item, 'utf-8');
};

var load = function (fileName, key) {
	var file = fileName || file;
	if (!file) {
		store.log('You must specify a valid file.', 'ERR');
		return false;
	}

	var s = fs.readFileSync(file, 'utf-8');
	
//	console.log('BEFORE removing end')
//	console.log(s)
	
	
	s = s.substr(0, s.length-2); // removing last ',' and /n
	
//	console.log('BEFORE PARSING')
//	console.log(s)
	
	var items = store.parse('{' + s + '}');
	
//	console.log('PARSED')
//	console.log(items)
	
	return (key) ? items[key] : items; 

};

var deleteVariable = function (fileName, key) {
	file = fileName || file;
	var items = load(file);
//	console.log('dele')
//	console.log(items)
//	console.log(key)
	delete items[key];
	overwrite(file, items);
	return null;
};

store.addType("fs", function(key, value, options) {
	
	var filename = options.file || file;
	
	if (!key) { 
		return load(filename);
	}

	if (value === undefined) {
		return load(filename, key);
	}

	if (timeout[key]) {
		clearTimeout(timeout[key]);
		deleteVariable(filename, key);
	}

	if (value === null) {
		deleteVariable(filename, key);
		return null;
	}
	
	// save item
	save(file, key, value);
	
	if (options.expires) {
		timeout[key] = setTimeout(function() {
			deleteVariable(file, key);
		}, options.expires);
	}

	return value;
});

}(('undefined' !== typeof module.exports.store) ? module.exports : module.parent.exports));