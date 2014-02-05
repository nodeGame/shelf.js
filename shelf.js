/**
 * # Shelf.JS 
 * Copyright 2014 Stefano Balietti
 * GPL licenses.
 *
 * Persistent Client-Side Storage
 * ---
 */
(function(exports) {
    
    var version = '5.1';

    var store = exports.store = function(key, value, options, type) {
	options = options || {};
	type = (options.type && options.type in store.types) ? options.type : store.type;
	if (!type || !store.types[type]) {
	    store.log("Cannot save/load value. Invalid storage type selected: " + type, 'ERR');
	    return;
	}
	store.log('Accessing ' + type + ' storage');
	
	return store.types[type](key, value, options);
    };

    // Adding functions and properties to store
    ///////////////////////////////////////////
    store.prefix = "__shelf__";

    store.verbosity = 0;
    store.types = {};


    var mainStorageType = "volatile";

    //if Object.defineProperty works...
    try {	
	
	Object.defineProperty(store, 'type', {
	    set: function(type){
		if ('undefined' === typeof store.types[type]) {
		    store.log('Cannot set store.type to an invalid type: ' + type);
		    return false;
		}
		mainStorageType = type;
		return type;
	    },
	    get: function(){
		return mainStorageType;
	    },
	    configurable: false,
	    enumerable: true
	});
    }
    catch(e) {
	store.type = mainStorageType; // default: memory
    }

    store.addType = function(type, storage) {
	store.types[type] = storage;
	store[type] = function(key, value, options) {
	    options = options || {};
	    options.type = type;
	    return store(key, value, options);
	};
	
	if (!store.type || store.type === "volatile") {
	    store.type = type;
	}
    };

    // TODO: create unit test
    store.onquotaerror = undefined;
    store.error = function() {	
	console.log("shelf quota exceeded"); 
	if ('function' === typeof store.onquotaerror) {
	    store.onquotaerror(null);
	}
    };

    store.log = function(text) {
	if (store.verbosity > 0) {
	    console.log('Shelf v.' + version + ': ' + text);
	}
	
    };

    store.isPersistent = function() {
	if (!store.types) return false;
	if (store.type === "volatile") return false;
	return true;
    };

    //if Object.defineProperty works...
    try {	
	Object.defineProperty(store, 'persistent', {
	    set: function(){},
	    get: store.isPersistent,
	    configurable: false
	});
    }
    catch(e) {
	// safe case
	store.persistent = false;
    }

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
		store.log('Error while parsing a value: ' + e, 'ERR');
		store.log(o);
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