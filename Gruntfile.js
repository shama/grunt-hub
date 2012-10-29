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
        files: '<%= hub.all.src %>'
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'tasks/*.js']
    },
    nodeunit: {
      all: ['test/**/*_test.js']
    }
  });

  // Load external tasks
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Load watch and hub tasks
  grunt.loadTasks('tasks');
  
  grunt.registerTask('default', ['hub']);
};
