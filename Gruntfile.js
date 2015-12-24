// Gruntfile.js
// https://github.com/yearofmoo/angularjs-seed-repo/blob/master/Gruntfile.js

module.exports = function (grunt) {
    // load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        shell: {
            options: {
                stdout: true
            },
            protractor_install: {
                command: 'node ./node_modules/protractor/bin/webdriver-manager update'
            },
            pixdiff_patch: {
                command: 'cp patch/pix-diff.js node_modules/pix-diff/index.js'
            },
            npm_install: {
                command: 'npm install'
            }
        },
        protractor: {
            options: {
                keepAlive: false,
                configFile: "./protractor.e2e.conf.js",
                args: {
                    troubleshoot: true
                }
            },
            framework: 'jasmine2',
            auto: {
                keepAlive: true,
                options: {
                    args: {
                        params: {
                            meetingId: false,
                            meetingPin: false,
                            avcEnabled: false,
                            guest: true
                        },
                        seleniumPort: 4444,
                        troubleshoot: true
                    }
                }
            },
            debug: {
                keepAlive: true,
                options: {
                    args: {
                        //seleniumPort: 4444,
                        troubleshoot: true
                    }
                }
            },
            stressTest: {
                options: {
                    keepAlive: false,
                    configFile: "./protractor.stress.conf.js"
                }
            },
            remoteTest: {
                options: {
                    keepAlive: false,
                    configFile: "./protractor.e2e.multi.js"
                }

            },
            testIE: {
                options: {
                    keepAlive:false,
                    configFile: "./protractor.e2eIE.conf.js",
                    args: {
                        seleniumPort: 4444,
                        troubleshoot: true
                    }
                }
            },
            testFirefox: {
                options: {
                    keepAlive: false,
                    configFile: "./e2e.firefox.conf.js",
                    args: {
                        seleniumPort: 4444,
                        troubleshoot: true
                    }
                }
            }
        },
        //watch: {
        //    files: ['**/*.js'],
        //    tasks: ['e2e']
        //},
        jshint: {
            all: ['*.js', '**/*.js'],
            options: {
                ignores: ['node_modules/**/*.js', 'patch/**', 'firefox/**', 'deprecated/**'],
                jshintrc: true
            }
        }
    });

    grunt.registerTask('setParams', "set the protractor params value", function(n){
        var params = grunt.config.data.protractor.auto.options.args.params;
        params.meetingId = grunt.option('meetingId');
        params.meetingPin = grunt.option('meetingPin');
        params.avcEnabled = grunt.option('avcEnabled');
        params.guest = grunt.option('guest');
    });

    grunt.registerTask('e2e', ['protractor:auto']);
    grunt.registerTask('e2e-ff', ['protractor:testFirefox']);
    grunt.registerTask('e2e-ie', ['protractor:testIE']);
    grunt.registerTask('stress', ['protractor:stressTest']);
    grunt.registerTask('deb', ['protractor:debug']);
    grunt.registerTask('remote_e2e', ['protractor:remoteTest']);

    //installation-related
    grunt.registerTask('install', ['shell:protractor_install', 'shell:pixdiff_patch']);
    grunt.registerTask('update', ['shell:npm_install']);

    grunt.registerTask('remote', ['jshint', 'remote_e2e']);

    grunt.registerTask('test', ['jshint', 'e2e']);

    grunt.registerTask('default', ['e2e']);
    grunt.registerTask('debug', ['jshint', 'deb']);

    grunt.loadNpmTasks("grunt-contrib-connect");

    /**
     * Uses protractor to add a protractor user to a meeting.
     *
     * @param {string} meetingID
     * @param {string} meetingPin
     * @param {boolean} avcEnabled
     * @param {boolean} guest
     */
    grunt.registerTask('join', ['setParams','test']);

    // runs protractor tests using chrome.
    grunt.registerTask('test', ['jshint', 'e2e']);

    // runs protractor tests using firefox.
    grunt.registerTask('test-ff', ['jshint', 'e2e-ff']);

    //runs protractor tests using Internet Explorer.
    grunt.registerTask('test-ie', ['jshint', 'e2e-ie']);

};