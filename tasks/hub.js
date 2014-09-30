/*
 * grunt-hub
 * https://github.com/shama/grunt-hub
 *
 * Copyright (c) 2014 Kyle Robinson Young
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';

  var path = require('path');
  var chalk = require('chalk');
  var async = require('async');
  var _ = require('lodash');

  var defaultDependencyFns = {
    // Dependency function to depend on a project's bower dependencies.
   'bower': function(gruntfile, allGruntfiles) {
      var projectPath = path.dirname(gruntfile);
      var bowerJson = require(path.join(projectPath, "bower.json"));
      var bowerDependencies = _.extend(bowerJson.dependencies, bowerJson.devDependencies);
      var dependencies = [];
      // for each dependency...
      Object.keys(bowerDependencies).forEach(function(dependencyName) {
        var dependencyValue = bowerDependencies[dependencyName];
        var dependencyPath = path.resolve(projectPath, dependencyValue);
        // check if there's a Gruntfile we know about in that directory...
        allGruntfiles.forEach(function(gruntfile2) {
          if (path.dirname(gruntfile2) == dependencyPath) {
            // and depend on that Gruntfile if so.
            dependencies.push(gruntfile2);
          }
        });
      });
      return dependencies;
    }
  }

  grunt.registerMultiTask('hub', 'Run multiple grunt projects', function() {
    var options = this.options({
      // TODO: Re-enable this once caolan/async#637 is merged.
      /* concurrent: 3, */
      allowSelf: false,
      bufferOutput: false,
      dependencyFn: false
    });
    var args = this.args;

    if (typeof options.dependencyFn === 'string' && !defaultDependencyFns[options.dependencyFn]) {
      grunt.log.error('Named dependency function "%s" not supported. (options: [%s])',
        options.dependencyFn,
        Object.keys(defaultDependencyFns).join(', '));
      return;
    }

    var cliArgs = process.argv.slice(2)
      .filter(function(arg, index, arr) {
        return (
          // Remove arguments that were tasks to this Gruntfile.
          !(_.contains(grunt.cli.tasks, arg)) &&
          // Remove "--gruntfile=project/Gruntfile.js" and "--gruntfile".
          !(/^--gruntfile(=.*)?/.test(arg)) &&
          // Remove anything that follows "--gruntfile" (i.e. as its argument).
          !(index > 0 && arr[index-1] === '--gruntfile')
        );
      });

    // Get it's own gruntfile
    var ownGruntfile = grunt.option('gruntfile') || grunt.file.expand({filter: 'isFile'}, '{G,g}runtfile.{js,coffee}')[0];
    ownGruntfile = path.resolve(process.cwd(), ownGruntfile || '');

    // Manage buffered and unbuffered output from gruntfiles.
    var outputManager = {
      lastGruntFileWritten: undefined,
      outputBuffers: {},

      init: function(gruntfile) {
        if (options.bufferOutput) {
          outputManager.outputBuffers[gruntfile] = [];
        }
      },
      write: function(gruntfile, fn, data) {
        if (options.bufferOutput) {
          outputManager.outputBuffers[gruntfile].push({
            fn: fn,
            data: data
          });
        }
        else {
          if (gruntfile !== outputManager.lastGruntFileWritten) {
            grunt.log.writeln('');
            grunt.log.writeln('');
            grunt.log.writeln(chalk.cyan('>> ') + gruntfile + ':\n');
          }
          fn(data);
          outputManager.lastGruntFileWritten = gruntfile;
        }
      },
      flush: function(gruntfile) {
        if (options.bufferOutput) {
          grunt.log.writeln('');
          grunt.log.writeln(chalk.cyan('>> ') + 'From ' + gruntfile + ':\n');
          outputManager.outputBuffers[gruntfile].forEach(function(lineData) {
            lineData.fn(lineData.data);
          });
          outputManager.outputBuffers[gruntfile] = [];
        }
      }
    }

    var errorCount = 0;
    var asyncTasks = {};

    // Create the async task callbacks and dependencies.
    // See https://github.com/caolan/async#auto.
    this.files.forEach(function(filesMapping) {

      var gruntfiles = grunt.file.expand({filter: 'isFile'}, filesMapping.src)
        .map(function(gruntfile) {
          return path.resolve(gruntfile);
        });
      if (!options.allowSelf) {
        gruntfiles = _.without(gruntfiles, ownGruntfile);
      }
      if (!gruntfiles.length) {
        grunt.log.warn('No Gruntfiles matched the file patterns: "' + filesMapping.orig.src.join(', ') + '"');
        return;
      }

      gruntfiles.forEach(function(gruntfile) {

        // Get the dependencies for this Gruntfile.
        var dependencies = [];
        var dependencyFn = options.dependencyFn;
        if (dependencyFn) {
          if (typeof dependencyFn === 'string') {
            dependencyFn = defaultDependencyFns[dependencyFn];
          }
          try {
            dependencies = dependencyFn(gruntfile, gruntfiles);
          }
          catch (e) {
            grunt.log.error(
              'Could not get dependencies for Gruntfile (' + e.message + '): ' + gruntfile + '. ' +
              'Assuming no dependencies.');
          }

          dependencies.forEach(function(dependency) {
            if (!_.contains(gruntfiles, dependency)) {
              grunt.log.warn('Dependency "' + dependency + '" not contained in src glob (dependency of ' + gruntfile + ')');
            }
          })
        }

        // Get the subtasks to run.
        var gruntTasksToRun = (
          (args.length < 1 ? false : args) ||
          filesMapping.tasks ||
          ['default']
        );

        // Create the async task function to run once all dependencies have run.
        // Output is collected and printed as a batch once the task completes.
        var asyncTaskFn = function(callback) {
          grunt.log.writeln('');
          grunt.log.writeln(chalk.cyan('>> ') + 'Running [' + gruntTasksToRun + '] on ' + gruntfile);

          outputManager.init(gruntfile);

          // Spawn the child process.
          var child = grunt.util.spawn({
            grunt: true,
            opts: {cwd: path.dirname(gruntfile)},
            args: [].concat(gruntTasksToRun, cliArgs || [], '--gruntfile=' + gruntfile)
          }, function(err, res, code) {
            if (err) { errorCount++; }
            outputManager.flush(gruntfile);
            callback(err);
          });

          // Buffer its stdout and stderr, to be printed on completion.
          child.stdout.on('data', function(data) {
            outputManager.write(gruntfile, grunt.log.write, data);
          });
          child.stderr.on('data', function(data) {
            outputManager.write(gruntfile, grunt.log.error, data);
          });
        };

        asyncTasks[gruntfile] = dependencies.concat([asyncTaskFn]);
      });
    });

    if (_.isEmpty(asyncTasks)) {
      grunt.warn('No Gruntfiles matched any of the provided file patterns');
    }
    else {
      var done = this.async();
      async.auto(asyncTasks, function(err, results) {
        grunt.log.writeln('');
        grunt.log.writeln(chalk.cyan('>> ') + 'From ' + ownGruntfile + ':');
        done(err);
      // TODO: Re-enable this once caolan/async#637 is merged.
      }/*, options.concurrency*/);
    }

  });

};
