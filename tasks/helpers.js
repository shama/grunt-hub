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
  var exec = require('child_process').exec;
  var _ = grunt.util._;

  // normalize files and tasks input
  var cache = {files: [], tasks: []};
  grunt.registerHelper('normalizeFiles', function(obj) {
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
    if (_.isString(cache.tasks)) {
      cache.tasks = cache.tasks.split(' ');
    }
    // remove it's own gruntfile
    cache.files = _.without(cache.files, ['grunt.js', 'Gruntfile.js']);
    return cache;
  });

  // run tasks on another grunt config location
  grunt.registerHelper('gruntConfig', function(file, tasks, done) {
    var basepath = path.resolve(path.dirname(file));

    if (_.isString(tasks)) {
      tasks = [tasks];
    }

    var cmd = 'cd ' + basepath + ' && grunt';
    if (tasks.length > 0) {
      cmd += ' ' + tasks.join(' ');
    }

    grunt.log.writeln('running '.cyan + cmd);
    exec(cmd, function(err, stdout, stderr) {
      if (stderr) {
        grunt.log.error(stderr);
      }
      if (stdout) {
        grunt.log.write(stdout).writeln();
      }
      done();
    });
  });

};