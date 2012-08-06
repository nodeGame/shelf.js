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
  .version(version)
  .command('build')
  .description('Creates a custom build of shelf.js')
  .option('-c', '--cycle', 'Build with addons')
  .option('-j', '--json', 'Build with JSON support for old browsers')
  .option('-fs', '--fs', 'Build with file system writing support')
  .option('-s', '--standard', 'Build with support for cyclic objects')
  .option('-a, --all', 'Full build of Shelf.js')
  .option('-d, --doc', 'Build doc')
  .action(build);
   

// Parsing options
program.parse(process.argv);