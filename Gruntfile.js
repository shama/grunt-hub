module.exports = function(grunt) {
  grunt.initConfig({
    hub: {
      all: {
        src: ['../*/Gruntfile.js'],
        tasks: ['jshint'],
      },
    },
    jshint: {
      files: ['Gruntfile.js', 'tasks/**/*js'],
      options: { jshintrc: '.jshintrc' },
    },
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadTasks('tasks');
  grunt.registerTask('default', ['jshint']);
};
