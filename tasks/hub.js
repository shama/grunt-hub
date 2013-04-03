/*
 * grunt-hub
 * https://github.com/shama/grunt-hub
 *
 * Copyright (c) 2013 Kyle Robinson Young
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';

  var path = require('path');

  grunt.registerMultiTask('hub', 'Run multiple grunt projects', function() {
    var options = this.options();
    grunt.verbose.writeflags(options, 'Options');

    var done = this.async();
    var errorCount = 0;
    var tasks = this.data.tasks || 'default';
    // Get process.argv options without grunt.cli.tasks to pass to child processes
    var cliArgs = grunt.util._.without.apply(null, [[].slice.call(process.argv, 2)].concat(grunt.cli.tasks));
    // Get it's own gruntfile
    var ownGruntfile = grunt.option('gruntfile') || grunt.file.expand({filter: 'isFile'}, '{G,g}runtfile.{js,coffee}')[0];
    ownGruntfile = path.resolve(process.cwd(), ownGruntfile);

    var childProcesses = [];
    var lastGruntFileWritten;

    function write(gruntfile, buf, isError) {
      var id = gruntfile === lastGruntFileWritten ? '   ' : ('>> '.cyan + gruntfile + ':\n');
      if (isError) {
        grunt.log.error(id + buf);
      } else {
        grunt.log.writeln(id + buf);
      }
      lastGruntFileWritten = gruntfile;
    }

    function completeSpawnedProcess(child) {
      childProcesses.splice(childProcesses.indexOf(child), 1);
      if (childProcesses.length === 0) {
        var withoutErrors = (errorCount === 0);
        done(withoutErrors);
      }
    }

    grunt.util.async.forEachSeries(this.files, function(files, next) {
      var gruntfiles = grunt.file.expand({filter: 'isFile'}, files.src);
      grunt.util.async.forEachSeries(gruntfiles, function(gruntfile, n) {
        gruntfile = path.resolve(process.cwd(), gruntfile);

        // Skip it's own gruntfile. Prevents infinite loops.
        if (gruntfile === ownGruntfile) { return n(); }

        grunt.log.ok('Running [' + tasks + '] on ' + gruntfile);

        // Spawn the tasks
        var child = grunt.util.spawn({
          // Use the node that spawned this process
          cmd: process.argv[0],
          // Run from dirname of gruntfile
          opts: {cwd: path.dirname(gruntfile)},
          // Run grunt this process uses, append the task to be run and any cli options
          args: grunt.util._.union([process.argv[1]].concat(tasks), cliArgs)
        }, function(err, res, code) {
          if (err) { errorCount++; }
          completeSpawnedProcess(child);
        });

        child.stdout.on('data', function(buf) {
          write(gruntfile, buf);
        });

        child.stderr.on('data', function(buf) {
          write(gruntfile, buf, true);
        });

        childProcesses.push(child);

        n();

      }, next);
    });

  });

};
