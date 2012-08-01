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

  // neuter a mock grunt except initConfig
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
    var files = grunt.helper('normalizeFiles', this).files;
    var tasks = grunt.helper('normalizeFiles', this).tasks;
    var done = this.async();

    async.forEach(files, function(file, next) {
      file = path.resolve(file);

      // attempt to read gruntfile
      try {
        require(file)(mockgrunt);
      } catch (e) {
        grunt.log.error(file);
        grunt.log.error(e.message);
      }

      var config = grunt.config.init(mockgrunt.config);
      if (!config.watch || !config.watch.files) {
        return next();
      }

      // gather watch tasks and files from gruntfile
      var watchTasks = config.watch.tasks;
      var watchFiles = config.watch.files.map(function(watchFile) {
        return path.join(path.dirname(file), watchFile);
      });
      watchFiles = grunt.file.expandFiles(watchFiles);

      // watch them files
      grunt.log.writeln('watching '.cyan + file + '...');
      var throttle = false;
      var watcher = chokidar.watch(watchFiles);
      watcher.on('all', function(action, filepath) {

        if (!throttle) {
          throttle = true;
          grunt.helper('gruntConfig', file, watchTasks, function(err) {
            setTimeout(function() { throttle = false; }, 1000);
          });
        }

      });
      watcher.on('error', function(err) {
        grunt.log.error(err.message);
      });

    });

    // keep alive
    setInterval(function() {}, 1000);
    
  });

};
