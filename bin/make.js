#!/usr/bin/env node

// Shelf.js make script

/**
 * Module dependencies.
 */

var program = require('commander'),
    os = require('os'),
    fs = require('fs'),
    path = require('path'),
    pkg = require('../package.json'),
    version = pkg.version;

var build = require('./build.js').build;

var buildDir =  __dirname + '/../build/';

var deleteIfExist = function(file) {
	file = file || filename;
	if (path.existsSync(file)) {
		var stats = fs.lstatSync(file);
		if (stats.isDirectory()) {
			fs.rmdir(file, function (err) {
				if (err) throw err;  
			});
		}
		else {
			fs.unlink(file, function (err) {
				if (err) throw err;  
			});
		}
		
	}
};

var cleanBuildDir = function(dir, ext) {
	ext = ext || '.js';
	dir = dir || buildDir;
	if (dir[dir.length] !== '/') dir = dir + '/';
	fs.readdir(dir, function(err, files) {
	    files.filter(function(file) { return path.extname(file) ===  ext; })
	         .forEach(function(file) { deleteIfExist(dir + file); });
	    
	    console.log('Build directory cleaned');
	});
}

function list(val) {
	return val.split(',');
}

program
  .version(version);

program  
	.command('clean')
	.description('Removes all files from build folder')
	.action(function(){
		cleanBuildDir();
});

program
  	.command('build [options]')
  	.description('Creates a custom build of shelf.js')
  	.option('-c, --cycle', 'with support cyclic objects serialization')
  	.option('-j, --json', 'with JSON support for old browsers')
  	.option('-l, --lib <items>', 'choose libraries to include', list)
  	.option('-a, --all', 'Full build of Shelf.js')
  	.option('-C, --clean', 'clean build directory')
  	.option('-A, --analyse', 'analyse build')
  	.option('-o, --output <file>', 'output file (without .js)')
  	.action(function(env, options){
		build(options);
});
   

program  
.command('multibuild')
.description('Creates pre-defined shelf.js builds')
.action(function(){
	console.log('Multi-build for Shelf.js v.' + version);
	build({
		all: true,
		output: "shelf-full",
	});
	build({
		lib: ['amplify','cookie'],
		output: "shelf-browser",
	});
	build({
		lib: ['amplify'],
		output: "shelf-amplify",
	});
	build({
		lib: ['cookie'],
		output: "shelf-cookie",
	});
	build({
		lib: ['fs'],
		output: "shelf-fs",
	});
	
});

//program
//.command('doc')
//.description('Builds documentation files')
//.action(function(){
//	console.log('This command is temporarily disabled.');
	//console.log('Building documentation for Shelf.js v.' + version);
	// http://nodejs.org/api.html#_child_processes
//	var root =  __dirname + '/../';
//	var command = root + 'node_modules/.bin/docker -i ' + root + ' index.js init.node.js nodeGame.js lib/ addons/ -o ' + root + 'docs/';
//	var child = exec(command, function (error, stdout, stderr) {
//		util.print(stdout);
//		util.print(stderr);
//		if (error !== null) {
//			console.log('build error: ' + error);
//		}
//	});
//});

// Parsing options
program.parse(process.argv);