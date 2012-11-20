var	smoosh = require('smoosh'),
	fs = require('fs'),
    path = require('path'),
    J = require('JSUS').JSUS;

var pkg = require('../package.json'),
    version = pkg.version;


module.exports.build = buildIt;

var buildName = function(lib) {
	return 'shelf.' + lib.toLowerCase() + '.js';
};

function buildIt(options) {
	
	console.log('Building Shelf.js v.' + version + ' with:');
	
//	console.log(options)
	
	// output file
	var out = options.output || "shelf";
	
	if (path.extname(out) === '.js') {
		out = path.basename(out, '.js');
	}
	
	
	// Defining variables	
	var rootDir = path.resolve(__dirname, '..') + '/';
	var libDir = rootDir + 'lib/';
	var distDir =  rootDir + 'build/';
		
	//JSON support
	var JSONDir = J.resolveModuleDir('JSON', __dirname);
	
	var shelf_json = [
	  JSONDir + "json2.js",           
	];
	
	
	//cyclic objects support
	var shelf_cycle = [
	  rootDir + "external/cycle.js",           
	];
	
	// shelf
	var shelf = [
	  rootDir + "shelf.js",           
	];
	
	//shelf libs
	var shelflibs = {};
	var files = fs.readdirSync(libDir);
	for (var i in files) {
		if (path.extname(files[i]) === '.js') {
			var name = path.basename(files[i], '.js').substr(6).toLowerCase();
			shelflibs[name] = libDir + files[i];
		}
	}

	
	
	// CREATING build array
	var files = [];
	
	// 0. JSON
	if (options.json || options.all) {
	  console.log('  - json');
	  files = files.concat(shelf_json);
	}
	
	// 1. Cycle
	if (options.cycle || options.all) {
	  console.log('  - cycle');
	  files = files.concat(shelf_cycle);
	}
	
	
	// 2. Shelf.js
	console.log('  - shelf.js core');
	files = files.concat(shelf);
	
	// 3. Last: shelf libs

	if (!options.lib || options.all) {
		console.log('  - shelf.js all libs');
		files = files.concat(J.obj2Array(shelflibs));
	}
	else { 
		var selected = options.lib;
		for (var i in selected) {
			if (selected.hasOwnProperty(i)) {
				if (!('string' === typeof selected[i])) continue;
				var name = selected[i];
				if (shelflibs[name]) {
					console.log('  - shelf.js lib: ' + selected[i]);
					files.push(shelflibs[name]);
				}
				else {
					console.log('  - ERR: shelf.js lib not found: ' + name);
				}
			}
		}
	}
	
	// Configurations for file smooshing.
	var config = {
	    // VERSION : "0.0.1",
	    
	    // Use JSHINT to spot code irregularities.
	    JSHINT_OPTS: {
	        boss: true,
	        forin: true,
	        browser: true,
	    },
	    
	    JAVASCRIPT: {
	        DIST_DIR: '/' + distDir,
	    }
	};
	
	config.JAVASCRIPT[out] = files;
	
	var run_it = function(){
		// https://github.com/fat/smoosh
		// hand over configurations made above
	    var smooshed = smoosh.config(config);
	    
	    // removes all files from the build folder
	    if (options.clean) {
	    	smooshed.clean();
	    }
	    
	    // builds both uncompressed and compressed files
	    smooshed.build(); 
	        
    	if (options.analyse) {
    		smooshed.run(); // runs jshint on full build
    		smooshed.analyze(); // analyzes everything
    	}
	
	    console.log('Shelf.js build created!');
	}
	
	run_it();
}