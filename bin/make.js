#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander'),
    os = require('os'),
    pkg = require('../package.json'),
    version = pkg.version;

var build = require('./build.js').build;

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
  .option('-f, --fs', 'with file system writing support')
  .option('-l, --lib <items>', 'choose libraries to include', list)
  .option('-a, --all', 'Full build of Shelf.js')
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
		browser: true,
		output: "shelf-browser",
	});
	build({
		amplify: true,
		output: "shelf-amplify",
	});
	build({
		cookie: true,
		output: "shelf-cookie",
	});
	build({
		node: true,
		output: "shelf-node",
	});
	
});

program
.command('doc')
.description('Builds documentation files')
.action(function(){
	console.log('Building documentation for nodegame-client v.' + version);
	// http://nodejs.org/api.html#_child_processes
	var root =  __dirname + '/../';
	var command = root + 'node_modules/.bin/docker -i ' + root + ' index.js init.node.js nodeGame.js lib/ addons/ -o ' + root + 'docs/';
	var child = exec(command, function (error, stdout, stderr) {
		util.print(stdout);
		util.print(stderr);
		if (error !== null) {
			console.log('build error: ' + error);
		}
	});
});

// Parsing options
program.parse(process.argv);