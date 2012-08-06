#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander'),
    os = require('os'),
    pkg = require('../package.json'),
    version = pkg.version;

var build = require('./build.js').build;

program
  .version(version);

program
  .command('build [options]')
  .description('Creates a custom build of shelf.js')
  .option('-c, --cycle', 'with support cyclic objects serialization')
  .option('-j, --json', 'with JSON support for old browsers')
  .option('-f, --fs', 'with file system writing support')
  .option('-a, --all', 'Full build of Shelf.js')
  .option('-A, --analyse', 'analyse build')
  .option('-o, --output <file>', 'output file (without .js)')
  .action(function(env, options){
		build(options);
});
   

// Parsing options
program.parse(process.argv);