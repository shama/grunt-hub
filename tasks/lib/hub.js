/*
 * grunt-hub
 * https://github.com/shama/grunt-hub
 *
 * Copyright (c) 2012 Kyle Robinson Young
 * Licensed under the MIT license.
 */

'use strict';

exports.init = function(grunt) {
  var exports = {};

  // Find watch tasks and files in a config
  exports.getTargets = function(watch, target) {
    var targets = target ? [target] : Object.keys(watch).filter(function(key) {
      return typeof watch[key] !== 'string' && !Array.isArray(watch[key]);
    });
    targets = targets.map(function(target) {
      // Fail if any required config properties have been omitted
      target = ['watch', target];
      this.requiresConfig && this.requiresConfig(target.concat('files'), target.concat('tasks'));
      return grunt.config(target);
    }, this);

    // Allow "basic" non-target format
    if (typeof watch.files === 'string' || Array.isArray(watch.files)) {
      targets.push({files: watch.files, tasks: watch.tasks});
    }
    return targets;
  };

  return exports;
};

