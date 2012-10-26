/*
 * grunt-hub
 * https://github.com/shama/grunt-hub
 *
 * Copyright (c) 2012 Kyle Robinson Young
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';

  // TODO: ditch this when grunt v0.4 is released
  grunt.util = grunt.util || grunt.utils;

  var async = grunt.util.async;
  var _ = grunt.util._;
  var hub = require('./lib/hub').init(grunt);
  var path = require('path');
  var Gaze = require('gaze').Gaze;

  // Find the grunt bin
  var gruntBin = path.resolve(process.cwd(), 'node_modules', '.bin', 'grunt');
  if (process.platform === 'win32') { gruntBin += '.cmd'; }

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
    // Grunt v0.4 compat
    mock.unregisterTasks = function() {};
    return mock;
  }());

  grunt.registerTask('watch', 'Watch multiple grunt projects', function(target) {
    this.requiresConfig('watch');
    // Build an array of files/tasks objects
    var targets = hub.getTargets.apply(this, [grunt.config('watch'), target]);

    // Message to display when waiting for changes
    var waiting = 'Waiting...';
    // File changes to be logged.
    var changedFiles = Object.create(null);
    // List of changed / deleted file paths.
    grunt.file.watchFiles = {changed: [], deleted: [], added: []};

    // Call to close this task
    var done = this.async();

    // Run the tasks for the changed files
    var runTasks = grunt.util._.debounce(function runTasks(gruntfile, tasks) {
      grunt.log.ok();
      var fileArray = Object.keys(changedFiles);
      fileArray.forEach(function(filepath) {
        var status = changedFiles[filepath];
        // Log which file has changed, and how.
        grunt.log.ok('File "' + filepath + '" ' + status + '.');
        // Add filepath to grunt.file.watchFiles for grunt.file.expand* methods.
        grunt.file.watchFiles[status].push(filepath);
      });
      changedFiles = Object.create(null);
      // Spawn the tasks as a child process
      grunt.util.spawn({
        cmd: gruntBin,
        opts: {cwd: path.dirname(gruntfile)},
        args: grunt.util._.union(tasks, [].slice.call(process.argv, 2))
      }, function(err, res, code) {
        if (code !== 0) { grunt.log.error(res.stderr); }
        grunt.log.writeln(res.stdout).writeln('').write(waiting);
      });
    }, 250);

    // Get gruntfiles and their watch targets
    var gruntfiles = Object.create(null);
    targets.forEach(function(target) {
      if (typeof target.files === 'string') {
        target.files = [target.files];
      }
      grunt.file.expandFiles(target.files).forEach(function(gruntfile) {
        gruntfile = path.resolve(process.cwd(), gruntfile);

        // Attempt to read gruntfile
        try {
          require(gruntfile)(mockgrunt);
        } catch (e) {
          grunt.log.error(gruntfile);
          grunt.log.error(e.message);
          return;
        }

        // Read watch in other config
        var config = grunt.config.init(mockgrunt.config);
        if (!config.watch) {
          grunt.log.error('No watch target defined in ' + gruntfile);
          return;
        }

        // Process the remote targets
        var _targets = _.chain(hub.getTargets(config.watch)).map(function(_target) {
          // If tasks specified local, run that instead of remote
          if (target.tasks) {
            _target.tasks = target.tasks;
          }
          if (typeof _target.files === 'string') {
            _target.files = [_target.files];
          }
          // Process templates for remote files
          _target.files = grunt.util.recurse(_target.files, function(f) {
            if (typeof f !== 'string') { return f; }
            return grunt.template.process(f, config);
          });
          return _target;
        }).value();

        gruntfiles[gruntfile] = _targets;
      });
    });

    // Start watching files
    Object.keys(gruntfiles).forEach(function(gruntfile) {
      var targets = gruntfiles[gruntfile];
      grunt.log.ok('Watching ' + gruntfile + ' targets...');
      targets.forEach(function(target) {
        if (typeof target.files === 'string') {
          target.files = [target.files];
        }
        var patterns = grunt.util._.chain(target.files).flatten().uniq().value();
        var gaze = new Gaze(patterns, {
          cwd: path.dirname(gruntfile)
        }, function(err) {
          if (err) {
            grunt.log.error(err.message);
            return done();
          }
          // On changed/added/deleted
          this.on('all', function(status, filepath) {
            changedFiles[filepath] = status;
            runTasks(gruntfile, target.tasks);
          });
          // On watcher error
          this.on('error', function(err) { grunt.log.error(err); });
        });
      });
    });

    // Keep the process alive
    setInterval(function() {}, 250);
  });

};
