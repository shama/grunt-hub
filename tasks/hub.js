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

  var helpers = require('grunt-lib-contrib').init(grunt);
  var path = require('path');

  // Find the grunt bin
  var gruntBin = path.resolve(process.cwd(), 'node_modules', '.bin', 'grunt');
  if (process.platform === 'win32') { gruntBin += '.cmd'; }

  grunt.registerMultiTask('hub', 'Run multiple grunt projects', function() {
    var options = helpers.options(this);
    grunt.verbose.writeflags(options, 'Options');

    // TODO: ditch this when grunt v0.4 is released
    this.files = this.files || helpers.normalizeMultiTaskFiles(this.data, this.target);

    var done = this.async();
    var tasks = this.data.tasks || 'default';

    grunt.util.async.forEachSeries(this.files, function(files, next) {
      var gruntfiles = grunt.file.expandFiles(files.src);
      grunt.util.async.forEachSeries(gruntfiles, function(gruntfile, n) {
        grunt.log.ok('Running [' + tasks + '] on ' + gruntfile);
        // Spawn the tasks
        grunt.util.spawn({
          cmd: gruntBin,
          opts: {cwd: path.dirname(gruntfile)},
          args: grunt.util._.union(tasks, [].slice.call(process.argv, 2))
        }, function(err, res, code) {
          if (code !== 0) { grunt.log.error(res.stderr); }
          grunt.log.writeln(res.stdout).writeln('');
          n();
        });
      }, next);
    }, done);
    
  });

};
