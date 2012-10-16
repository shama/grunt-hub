/**
 * Example Grunt Hub
 *
 * Edit the hub.all.src to point to your Gruntfile locations.
 * Then run `grunt` or `grunt watch`.
 */
module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    hub: {
      all: {
        src: ['../*/grunt.js'],
        tasks: ['lint']
      }
    },
    watch: {
      all: {
        files: ['<config:hub.all.files>'],
        tasks: ['lint']
      }
    }
  });

  grunt.loadNpmTasks('grunt-hub');
  grunt.registerTask('default', ['hub']);
};
