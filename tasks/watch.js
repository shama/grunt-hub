/*
 * grunt-hub
 * https://github.com/shama/grunt-hub
 *
 * Copyright (c) 2012 Kyle Robinson Young
 * Licensed under the MIT license.
 */
/*jshint node:true*/

module.exports = function(grunt) {
  'use strict';

  // TODO: ditch this when grunt v0.4 is released
  grunt.util = grunt.util || grunt.utils;

  var path = require('path');
  var chokidar = require('chokidar');
  var async = grunt.util.async;
  var _ = grunt.util._;
  var helper = require('../lib/helper');

  // Neuter a mock grunt except initConfig
  var mockgrunt = (function() {
    var mock = {};
    var func = function() {};
    for (var key in grunt) {
      mock[key] = func;
    }
    mock.initConfig = function(cfg) {
      this.config = cfg;
    };
    return mock;
  }());

  grunt.registerMultiTask('watch', 'Watch multiple grunt projects', function() {
    var gruntfiles = helper.normalizeFiles(this).files;
    var tasks = helper.normalizeFiles(this).tasks;
    var done = this.async();

    async.forEach(gruntfiles, function(gruntfile, next) {
      gruntfile = path.resolve(gruntfile);

      // Attempt to read gruntfile
      try {
        require(gruntfile)(mockgrunt);
      } catch (e) {
        grunt.log.error(gruntfile);
        grunt.log.error(e.message);
        return next();
      }

      // Parse gruntfile config for tasks and files
      var config = grunt.config.init(mockgrunt.config);
      var targets = helper.getTargets(config);
      var patterns = _.chain(targets).pluck('files').flatten().value();

      // Get directories to watch
      var watchDirs = _.uniq(grunt.file.expandFiles(patterns).map(function(file) {
        return path.resolve(path.dirname(gruntfile), path.dirname(file));
      }));

      // Keep track of changed files
      var changedFiles = {};

      // Watch them folders
      var watcher = chokidar.watch(watchDirs);

      // On change/unlink/added
      watcher.on('all', function(status, filepath) {

        // Bring back to relative path for matching
        filepath = path.relative(path.dirname(gruntfile), filepath);

        // Is a matching file?
        if (grunt.file.isMatch(patterns, filepath)) {
          changedFiles[filepath] = status;
          hasChanged();
        }
      });

      // Run tasks on changed files
      var hasChanged = _.debounce(function() {
        grunt.log.ok();

        // Process, report and clear require cache for changed files
        var fileArray = Object.keys(changedFiles);
        fileArray.forEach(function(filepath) {
          var status = changedFiles[filepath];
          // Log which file has changed, and how.
          grunt.log.ok('File "' + filepath + '" ' + status + '.');
          // Clear the modified file's cached require data.
          grunt.file.clearRequireCache(filepath);
        });

        // Find the tasks we should run
        var runTasks = (tasks !== '0') ? tasks : (function() {
          var returnTasks = [];
          targets.forEach(function(target) {
            // What files in fileArray match the target.files pattern(s)?
            var files = grunt.file.match(target.files, fileArray);
            // Enqueue specified tasks if at least one matching file was found.
            if (files.length > 0 && target.tasks) {
              returnTasks.push(target.tasks);
           }
          });
          return returnTasks;
        }());

        // Actually run the tasks!
        helper.runTasks(gruntfile, _.flatten(runTasks));
      }, 250);

      // On watcher error
      watcher.on('error', function(err) {
        grunt.log.error(err.message);
      });

      // Process the next gruntfile
      next();
    });

    // keep alive
    setInterval(function() {}, 1000);
  });

};
