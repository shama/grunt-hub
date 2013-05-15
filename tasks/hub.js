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
    var options = this.options({
      concurrent: 3,
    });
    grunt.verbose.writeflags(options, 'Options');

    var done = this.async();
    var errorCount = 0;
    // Get process.argv options without grunt.cli.tasks to pass to child processes
    var cliArgs = grunt.util._.without.apply(null, [[].slice.call(process.argv, 2)].concat(grunt.cli.tasks));
    // Get it's own gruntfile
    var ownGruntfile = grunt.option('gruntfile') || grunt.file.expand({filter: 'isFile'}, '{G,g}runtfile.{js,coffee}')[0];
    ownGruntfile = path.resolve(process.cwd(), ownGruntfile);

    var lastGruntFileWritten;
    function write(gruntfile, buf, isError) {
      if (gruntfile !== lastGruntFileWritten) {
        grunt.log.writeln('');
        grunt.log.writeln('');
        grunt.log.writeln('>> '.cyan + gruntfile + ':\n');
      }
      grunt.log[(isError) ? 'error' : 'write'](buf);
      lastGruntFileWritten = gruntfile;
    }

    // our queue for concurrently ran tasks
    var queue = grunt.util.async.queue(function(run, next) {
      grunt.log.ok('Running [' + run.tasks + '] on ' + run.gruntfile);
      var child = grunt.util.spawn({
        // Use grunt to run the tasks
        grunt: true,
        // Run from dirname of gruntfile
        opts: {cwd: path.dirname(run.gruntfile)},
        // Run task to be run and any cli options
        args: run.tasks.concat(cliArgs || [])
      }, function(err, res, code) {
        if (err) { errorCount++; }
        next();
      });
      child.stdout.on('data', function(buf) {
        write(run.gruntfile, buf);
      });
      child.stderr.on('data', function(buf) {
        write(run.gruntfile, buf, true);
      });
    }, options.concurrent);

    // When the queue is all done
    queue.drain = function() {
      done((errorCount === 0));
    };

    this.files.forEach(function(files) {
      var gruntfiles = grunt.file.expand({filter: 'isFile'}, files.src);
      gruntfiles.forEach(function(gruntfile) {
        gruntfile = path.resolve(process.cwd(), gruntfile);

        // Skip it's own gruntfile. Prevents infinite loops.
        if (gruntfile === ownGruntfile) { return; }

        queue.push({
          gruntfile: gruntfile,
          tasks: files.tasks || ['default']
        });
      });
    });

  });

};
