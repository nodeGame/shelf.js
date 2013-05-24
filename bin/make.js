#!/usr/bin/env node

// Shelf.js make script

/**
 * Module dependencies.
 */

var program = require('commander'),
    os = require('os'),
    fs = require('fs'),
    path = require('path'),
    J = require('JSUS').JSUS;

var pkg = require('../package.json'),
    version = pkg.version;

var build = require('./build.js').build;

var rootDir = path.resolve(__dirname, '..') + '/';
var buildDir = rootDir + 'build/';

function list(val) {
	return val.split(',');
}

program
  .version(version);

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

// Parsing options
program.parse(process.argv);