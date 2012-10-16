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
        files: '<config:hub.all.src>',
        tasks: ['lint']
      }
    },
    lint: {
      files: ['grunt.js', 'tasks/*.js']
    },
    test: {
      all: ['test/**/*_test.js']
    }
  });

  grunt.loadTasks('tasks');
  grunt.registerTask('default', ['hub']);
};
