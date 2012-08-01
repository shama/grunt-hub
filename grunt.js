module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    hub: {
      //'lint test': ['../*/grunt.js'],
      all: {
        //files: ['../*/grunt.js'],
        files: ['../grunt-jam/grunt.js', '../grunt-docs/grunt.js'],
        tasks: ['lint']
      }
    },
    watch: '<config:hub.all.files>',
    lint: {
      files: ['grunt.js', 'tasks/*.js']
    }
  });

  grunt.loadTasks('tasks');
  grunt.registerTask('default', ['hub']);
};
