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
      files: ['src/*.js', 'src/parser/*.pegjs', 'tests/*.js'],
      tasks: 'default'
    },

    shell: {
      generate_parser: {
        command: 'pegjs --export-var hustler._module.parser src/parser/hustler.pegjs src/parser/parser.js'
      }
    }

  });

  grunt.loadNpmTasks('grunt-shell');

  // alias
  grunt.registerTask('genparser', 'shell'); 

  grunt.registerTask('default', 'genparser lint concat min');
};
