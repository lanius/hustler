module.exports = function(grunt) {
  grunt.initConfig({
    lint: {
      files: ['src/core.js']
    },

  	concat: {
      dist: {
        src: ['src/core.js', 'src/parser/parser.js'],
        dest: 'build/hustler.js'
      }
    },

    min: {
      dist: {
      	src: ['build/hustler.js'],
      	dest: 'build/hustler.min.js'
      }
  	},

    watch: {
      files: 'src/*.js',
      tasks: 'default'
    },

    shell: {
      generate_parser: {
        command: 'pegjs --export-var hustler.parser src/parser/hustler.pegjs src/parser/parser.js'
      }
    },

    jasmine: { // to run tests, PhantomJS required. http://phantomjs.org/
      all: ['tests/specrunner.html']
    },

  });

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-jasmine-task');

  // alias
  grunt.registerTask('genparser', 'shell'); 
  grunt.registerTask('test', 'jasmine');

  grunt.registerTask('default', 'genparser lint test concat min');
};
