var	smoosh = require('smoosh'),
    path = require('path'),
    pkg = require('../package.json'),
    version = pkg.version;


module.exports.build = buildIt;

function buildIt(options) {
	
	console.log('Building NDDB v.' + version + ' with:');
	
	// Defining variables
	
	var re = new RegExp('node_modules.+');
	
	var rootDir = __dirname + '/../';
	var distDir =  rootDir + 'build/';
	
	//cyclic objects support
	var shelf_json = [
	  rootDir + "node_modules/JSON/json2.js",           
	];
	
	
	//cyclic objects support
	var shelf_cycle = [
	  rootDir + "external/cycle.js",           
	];
	
	// shelf
	var shelf = [
	  rootDir + "shelf.js",           
	];
	
	//shelf.js
	var shelf_fs = [
	  rootDir + "lib/shelf.fs.js",
	];
	
	// CREATING build array
	var files = [];
	
	// 0. JSON
	if (options.json || options.all || options.standard) {
	  console.log('  - json');
	  files = files.concat(shelf_json);
	}
	
	// 1. Cycle
	if (options.cycle || options.all || options.standard) {
	  console.log('  - cycle');
	  files = files.concat(shelf_cycle);
	}
	
	
	// 2. Shelf.js
	files = files.concat(shelf);
	
	// 3. Shelf.fs.js
	if (options.fs || options.all) {
	  console.log('  - fs');
	  files = files.concat(shelf_fs);
	}
	
	console.log('Adding ' + files.length + ' files');
	
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
	        
	        "shelf": files
	    }
	};
	
	var run_it = function(){
	    // Smooshing callback chain
	    // More information on how it behaves can be found in the smoosh Readme https://github.com/fat/smoosh
	    smoosh
	        .config(config) // hand over configurations made above
	        // .clean() // removes all files out of the nodegame folder
	        .run() // runs jshint on full build
	        .build() // builds both uncompressed and compressed files
	        .analyze(); // analyzes everything
	
	    console.log('shelf.js created');
	}
	
	run_it();
}