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

  grunt.registerMultiTask('hub', 'Run multiple grunt projects', function() {
    var options = helpers.options(this);
    grunt.verbose.writeflags(options, 'Options');

    // TODO: ditch this when grunt v0.4 is released
    this.files = this.files || helpers.normalizeMultiTaskFiles(this.data, this.target);

    var done = this.async();
    var tasks = this.data.tasks || 'default';
    // Get process.argv options without grunt.cli.tasks to pass to child processes
    var cliArgs = grunt.util._.without.apply(null, [[].slice.call(process.argv, 2)].concat(grunt.cli.tasks));
    // Get it's own gruntfile
    var ownGruntfile = grunt.option('gruntfile') || grunt.file.expand({filter: 'isFile'}, '{G,g}runtfile.{js,coffee}')[0];
    ownGruntfile = path.resolve(process.cwd(), ownGruntfile);

    grunt.util.async.forEachSeries(this.files, function(files, next) {
      var gruntfiles = grunt.file.expand({filter: 'isFile'}, files.src);
      grunt.util.async.forEachSeries(gruntfiles, function(gruntfile, n) {
        gruntfile = path.resolve(process.cwd(), gruntfile);

        // Skip it's own gruntfile. Prevents infinite loops.
        if (gruntfile === ownGruntfile) { return; }

        grunt.log.ok('Running [' + tasks + '] on ' + gruntfile);

        // Spawn the tasks
        grunt.util.spawn({
          // Use the node that spawned this process
          cmd: process.argv[0],
          // Run from dirname of gruntfile
          opts: {cwd: path.dirname(gruntfile)},
          // Run grunt this process uses, append the task to be run and any cli options
          args: grunt.util._.union([process.argv[1]].concat(tasks), cliArgs)
        }, function(err, res, code) {
          if (code !== 0) { grunt.log.error(res.stderr); }
          grunt.log.writeln(res.stdout).writeln('');
          n();
        });
      }, next);
    }, done);
    
  });

};
