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
        src: ['../*/Gruntfile.js'],
        tasks: ['jshint']
      }
    },
    watch: {
      all: {
        files: ['<%= hub.all.files %>'],
        tasks: ['jshint']
      }
    }
  });

  grunt.loadNpmTasks('grunt-hub');

  grunt.registerTask('default', ['hub']);
};
