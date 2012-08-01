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

  grunt.registerMultiTask('hub', 'Run multiple grunt projects', function() {
    var files = grunt.helper('normalizeFiles', this).files;
    var tasks = grunt.helper('normalizeFiles', this).tasks;
    var done = this.async();

    async.forEachSeries(files, function(file, next) {

      grunt.helper('gruntConfig', file, tasks, function(err) { next(); });

    }, function() {
      done();
    });
    
  });

};
