/**
 * Example Grunt Hub
 *
 * Edit the hub.all.files to point to your Gruntfile locations.
 * Then run `grunt` or `grunt watch`.
 */
module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    hub: {
      all: {
        files: ['../*/grunt.js'],
        tasks: ['lint']
      }
    },
    watch: '<config:hub.all.files>'
  });

  grunt.loadNpmTasks('grunt-hub');
  grunt.registerTask('default', ['hub']);
};
