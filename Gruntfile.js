'use strict';

module.exports = function (grunt) {

	grunt.initConfig({
		env: {
			test: {
				NODE_ENV: 'test'
			},
			dev : {
				NODE_ENV: 'development'
			},
			prod: {
				NODE_ENV: 'production'
			}
		},
		mochaTest: {
			test        : {
				options: {
					reporter: 'spec',
					require : 'test/config/coverage_blanket',
					quiet   : false
				},
				src    : ['test/**/*.js']
			},
			coverage    : {
				options: {
					reporter   : 'html-cov',
					quiet      : true,
					captureFile: 'build/coverage.html'
				},
				src    : ['test/**/*.js']
			},
			'travis-cov': {
				options: {
					reporter: 'travis-cov'
				},
				src    : ['test/**/*.js']
			}
		},

		// monitors the compiled .js files so that external builders (e.g. WebStorm) trigger restart
		nodemon  : {
			dev: {
				options: {
					file             : './server.js',
					watchedExtensions: ['js', 'json'],
					watchedFolders   : ['.']
				}
			}
		},

		// execute 'grunt curl' manually to refresh the external definition files
		curl      : {
			'ts-definitions/mocha/mocha.d.ts'          : 'https://github.com/borisyankov/DefinitelyTyped/raw/master/mocha/mocha.d.ts',
			'ts-definitions/node/node.d.ts'            : 'https://github.com/borisyankov/DefinitelyTyped/raw/master/node/node.d.ts',
			'ts-definitions/should/should.d.ts'        : 'https://github.com/borisyankov/DefinitelyTyped/raw/master/should/should.d.ts',
			'ts-definitions/sinon/sinon.d.ts'    	   : 'https://github.com/borisyankov/DefinitelyTyped/raw/master/sinon/sinon.d.ts',
			'ts-definitions/node_redis/node_redis.d.ts': 'https://github.com/borisyankov/DefinitelyTyped/raw/master/node_redis/node_redis.d.ts'
		}
	});

	// These plugins provide necessary tasks
	grunt.loadNpmTasks('grunt-typescript');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-curl');

	// Task aliases
	grunt.registerTask('createReports', ['env:test', 'mochaTest:coverage']);
	grunt.registerTask('_runTests', ['env:test', 'mochaTest']);
	grunt.registerTask('test', ['_runTests']);
	grunt.registerTask('dev', ['env:dev', 'nodemon']);
	grunt.registerTask('prod', ['env:prod', 'nodemon']);

	// Default task
	grunt.registerTask('default', ['test']);
};
