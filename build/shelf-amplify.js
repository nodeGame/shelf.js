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
    var store, mainStorageType;

    mainStorageType = "volatile";

    store = exports.store = function(key, value, options, type) {
        options = options || {};
        type = (options.type && options.type in store.types) ?
            options.type : store.type;

        if (!type || !store.types[type]) {
            store.log('Cannot save/load value. Invalid storage type ' +
                      'selected: ' + type, 'ERR');
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




    //if Object.defineProperty works...
    try {

        Object.defineProperty(store, 'type', {
            set: function(type) {
                if ('undefined' === typeof store.types[type]) {
                    store.log('Cannot set store.type to an invalid type: ' +
                              type);
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
            throw new Error('JSON.stringify not found. Received non-string' +
                            'value and could not serialize.');
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
    // ### fallback to enable the API even if we can't persist data
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

}(
    'undefined' !== typeof module && 'undefined' !== typeof module.exports ?
        module.exports : this
));

/**
 * ## Amplify storage for Shelf.js
 * Copyright 2014 Stefano Balietti
 *
 * v. 1.1.0 22.05.2013 a275f32ee7603fbae6607c4e4f37c4d6ada6c3d5
 *
 * Important! When updating to next Amplify.JS release, remember to change:
 *
 * - JSON.stringify -> store.stringify to keep support for cyclic objects
 * - JSON.parse -> store.parse (cyclic objects)
 * - store.name -> store.prefix (check)
 * - rprefix -> regex
 * - "__amplify__" -> store.prefix
 *
 * ---
 */
(function(exports) {

    var store = exports.store;

    if (!store) {
	throw new Error('amplify.shelf.js: shelf.js core not found.');
    }

    if ('undefined' === typeof window) {
	throw new Error('amplify.shelf.js:  window object not found.');
    }

    var regex = new RegExp("^" + store.prefix);
    function createFromStorageInterface( storageType, storage ) {
	store.addType( storageType, function( key, value, options ) {
	    var storedValue, parsed, i, remove,
	    ret = value,
	    now = (new Date()).getTime();

	    if ( !key ) {
		ret = {};
		remove = [];
		i = 0;
		try {
		    // accessing the length property works around a localStorage bug
		    // in Firefox 4.0 where the keys don't update cross-page
		    // we assign to key just to avoid Closure Compiler from removing
		    // the access as "useless code"
		    // https://bugzilla.mozilla.org/show_bug.cgi?id=662511
		    key = storage.length;

		    while ( key = storage.key( i++ ) ) {
			if ( regex.test( key ) ) {
			    parsed = store.parse( storage.getItem( key ) );
			    if ( parsed.expires && parsed.expires <= now ) {
				remove.push( key );
			    } else {
				ret[ key.replace( rprefix, "" ) ] = parsed.data;
			    }
			}
		    }
		    while ( key = remove.pop() ) {
			storage.removeItem( key );
		    }
		} catch ( error ) {}
		return ret;
	    }

	    // protect against name collisions with direct storage
	    key = store.prefix + key;

	    if ( value === undefined ) {
		storedValue = storage.getItem( key );
		parsed = storedValue ? store.parse( storedValue ) : { expires: -1 };
		if ( parsed.expires && parsed.expires <= now ) {
		    storage.removeItem( key );
		} else {
		    return parsed.data;
		}
	    } else {
		if ( value === null ) {
		    storage.removeItem( key );
		} else {
		    parsed = store.stringify({
			data: value,
			expires: options.expires ? now + options.expires : null
		    });
		    try {
			storage.setItem( key, parsed );
			// quota exceeded
		    } catch( error ) {
			// expire old data and try again
			store[ storageType ]();
			try {
			    storage.setItem( key, parsed );
			} catch( error ) {
			    throw store.error();
			}
		    }
		}
	    }

	    return ret;
	});
    }

    // localStorage + sessionStorage
    // IE 8+, Firefox 3.5+, Safari 4+, Chrome 4+, Opera 10.5+, iPhone 2+, Android 2+
    for ( var webStorageType in { localStorage: 1, sessionStorage: 1 } ) {
	// try/catch for file protocol in Firefox and Private Browsing in Safari 5
	try {
	    // Safari 5 in Private Browsing mode exposes localStorage
	    // but doesn't allow storing data, so we attempt to store and remove an item.
	    // This will unfortunately give us a false negative if we're at the limit.
	    window[ webStorageType ].setItem(store.prefix, "x" );
	    window[ webStorageType ].removeItem(store.prefix );
	    createFromStorageInterface( webStorageType, window[ webStorageType ] );
	} catch( e ) {}
    }

    // globalStorage
    // non-standard: Firefox 2+
    // https://developer.mozilla.org/en/dom/storage#globalStorage
    if ( !store.types.localStorage && window.globalStorage ) {
	// try/catch for file protocol in Firefox
	try {
	    createFromStorageInterface( "globalStorage",
			                window.globalStorage[ window.location.hostname ] );
	    // Firefox 2.0 and 3.0 have sessionStorage and globalStorage
	    // make sure we default to globalStorage
	    // but don't default to globalStorage in 3.5+ which also has localStorage
	    if ( store.type === "sessionStorage" ) {
		store.type = "globalStorage";
	    }
	} catch( e ) {}
    }

    // userData
    // non-standard: IE 5+
    // http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx
    (function() {
	// IE 9 has quirks in userData that are a huge pain
	// rather than finding a way to detect these quirks
	// we just don't register userData if we have localStorage
	if ( store.types.localStorage ) {
	    return;
	}

	// append to html instead of body so we can do this from the head
	var div = document.createElement( "div" ),
	attrKey = store.prefix; // was "amplify" and not __amplify__
	div.style.display = "none";
	document.getElementsByTagName( "head" )[ 0 ].appendChild( div );

	// we can't feature detect userData support
	// so just try and see if it fails
	// surprisingly, even just adding the behavior isn't enough for a failure
	// so we need to load the data as well
	try {
	    div.addBehavior( "#default#userdata" );
	    div.load( attrKey );
	} catch( e ) {
	    div.parentNode.removeChild( div );
	    return;
	}

	store.addType( "userData", function( key, value, options ) {
	    div.load( attrKey );
	    var attr, parsed, prevValue, i, remove,
	    ret = value,
	    now = (new Date()).getTime();

	    if ( !key ) {
		ret = {};
		remove = [];
		i = 0;
		while ( attr = div.XMLDocument.documentElement.attributes[ i++ ] ) {
		    parsed = store.parse( attr.value );
		    if ( parsed.expires && parsed.expires <= now ) {
			remove.push( attr.name );
		    } else {
			ret[ attr.name ] = parsed.data;
		    }
		}
		while ( key = remove.pop() ) {
		    div.removeAttribute( key );
		}
		div.save( attrKey );
		return ret;
	    }

	    // convert invalid characters to dashes
	    // http://www.w3.org/TR/REC-xml/#NT-Name
	    // simplified to assume the starting character is valid
	    // also removed colon as it is invalid in HTML attribute names
	    key = key.replace( /[^\-._0-9A-Za-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u037f-\u1fff\u200c-\u200d\u203f\u2040\u2070-\u218f]/g, "-" );
	    // adjust invalid starting character to deal with our simplified sanitization
	    key = key.replace( /^-/, "_-" );

	    if ( value === undefined ) {
		attr = div.getAttribute( key );
		parsed = attr ? store.parse( attr ) : { expires: -1 };
		if ( parsed.expires && parsed.expires <= now ) {
		    div.removeAttribute( key );
		} else {
		    return parsed.data;
		}
	    } else {
		if ( value === null ) {
		    div.removeAttribute( key );
		} else {
		    // we need to get the previous value in case we need to rollback
		    prevValue = div.getAttribute( key );
		    parsed = store.stringify({
			data: value,
			expires: (options.expires ? (now + options.expires) : null)
		    });
		    div.setAttribute( key, parsed );
		}
	    }

	    try {
		div.save( attrKey );
		// quota exceeded
	    } catch ( error ) {
		// roll the value back to the previous value
		if ( prevValue === null ) {
		    div.removeAttribute( key );
		} else {
		    div.setAttribute( key, prevValue );
		}

		// expire old data and try again
		store.userData();
		try {
		    div.setAttribute( key, parsed );
		    div.save( attrKey );
		} catch ( error ) {
		    // roll the value back to the previous value
		    if ( prevValue === null ) {
			div.removeAttribute( key );
		    } else {
			div.setAttribute( key, prevValue );
		    }
		    throw store.error();
		}
	    }
	    return ret;
	});
    }());

}(this));
