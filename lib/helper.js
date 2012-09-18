/*
 * grunt-hub
 * https://github.com/shama/grunt-hub
 *
 * Copyright (c) 2012 Kyle Robinson Young
 * Licensed under the MIT license.
 */
/*jshint node:true*/

'use strict';

var grunt = require('grunt');
var helper = module.exports = function() {};

// TODO: ditch this when grunt v0.4 is released
grunt.util = grunt.util || grunt.utils;

var path = require('path');
var spawn = require('child_process').spawn;
var fs = require('fs');

var _ = grunt.util._;

// In Nodejs 0.8.0, existsSync moved from path -> fs.
fs.existsSync = fs.existsSync || path.existsSync;

var cache = {files: [], tasks: []};

// normalize files and tasks input
helper.normalizeFiles = function(obj) {
  if (cache.files.length > 0) {
    return cache;
  }
  if (obj.file.src) {
    cache.files = grunt.file.expandFiles(obj.file.src);
    cache.tasks = obj.file.dest;
  } else {
    cache.files = grunt.file.expandFiles(obj.data.files);
    cache.tasks = obj.data.tasks;
  }
  // remove it's own gruntfile
  cache.files = _.without(cache.files, ['grunt.js', 'Gruntfile.js']);
  return cache;
};

// Find watch tasks and files in a config
helper.getTargets = function(config) {
  if (!config.watch) {
    return [];
  }
  if (config.watch.files) {
    return [config.watch];
  }
  var out = [];
  _.each(config.watch, function(val, key) {
    if (val.files && val.tasks) {
      out.push(val);
    } else {
      key = _.isNumber(key) ? 'default' : key;
      val = _.isArray(val) ? val : [val];
      out.push({files: val, tasks: key});
    }
  });
  return out;
};

// run tasks on another grunt config location
// TODO: Pass along passed args
helper.runTasks = function(gruntfile, tasks, done) {
  var basepath = path.resolve(path.dirname(gruntfile));
  done = done || function() {};

  // Get grunt command local to gruntfile if it exists
  var gruntBin = path.resolve(basepath, 'node_modules', '.bin', 'grunt');
  if (!fs.existsSync(gruntBin)) { gruntBin = 'grunt'; }
  if (process.platform === 'win32') { gruntBin += '.cmd'; }

  var args = [
    '--config',
    gruntfile,
    '--base',
    basepath
  ];
  args.push(tasks);

  grunt.log.writeln('running '.cyan + gruntBin + ' ' + args.join(' '));

  var run = spawn(gruntBin, args);
  run.stderr.on('data', function (data) {
    grunt.log.error(String(data));
  });
  run.stdout.on('data', function (data) {
    grunt.log.write(String(data)).writeln('');
  });
  run.on('exit', done);
};

// ===============================================================
// Grunt 0.4 Copy + Paste Land
// ===============================================================

// Process specified wildcard glob patterns or filenames against a
// callback, excluding and uniquing files in the result set.
var processPatterns = function(patterns, fn) {
  // Filepaths to return.
  var result = [];
  // Flattened, Underscore.js-chainable set of patterns.
  grunt.util._(patterns).chain().flatten().each(function(pattern) {
    // If the first character is ! it should be omitted
    var exclusion = pattern.indexOf('!') === 0;
    // If the pattern is an exclusion, remove the !
    if (exclusion) { pattern = pattern.slice(1); }
    // Find all matching files for this pattern.
    var matches = fn(pattern);
    if (exclusion) {
      // If an exclusion, remove matching files.
      result = grunt.util._.difference(result, matches);
    } else {
      // Otherwise add matching files.
      result = grunt.util._.union(result, matches);
    }
  });
  return result;
};

// Match a filepath or filepaths against one or more wildcard patterns. Returns
// all matching filepaths.
grunt.file.match = grunt.file.match || function(options, patterns, filepaths) {
  if (grunt.util.kindOf(options) !== 'object') {
    filepaths = patterns;
    patterns = options;
    options = {};
  }
  // Return empty set if either patterns or filepaths was omitted.
  if (patterns == null || filepaths == null) { return []; }
  // Normalize patterns and filepaths to arrays.
  if (!Array.isArray(patterns)) { patterns = [patterns]; }
  if (!Array.isArray(filepaths)) { filepaths = [filepaths]; }
  // Return empty set if there are no patterns or filepaths.
  if (patterns.length === 0 || filepaths.length === 0) { return []; }
  // Return all matching filepaths.
  return processPatterns(patterns, function(pattern) {
    return filepaths.filter(grunt.file.glob.minimatch.filter(pattern, options));
  });
};
