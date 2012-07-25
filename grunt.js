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
      tasks: 'concat min'
    }

  });

  grunt.registerTask('default', 'lint concat min');
};
