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

  var path = require('path');
  var async = grunt.util.async;
  var helper = require('../lib/helper');

  grunt.registerMultiTask('hub', 'Run multiple grunt projects', function() {
    var gruntfiles = helper.normalizeFiles(this).files;
    var tasks = helper.normalizeFiles(this).tasks;
    var done = this.async();

    async.forEachSeries(gruntfiles, function(gruntfile, next) {
      gruntfile = path.resolve(gruntfile);

      helper.runTasks(gruntfile, tasks, next);

    }, function() {
      done();
    });
    
  });

};
