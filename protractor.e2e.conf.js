//https://raw.githubusercontent.com/yearofmoo/angularjs-seed-repo/master/test/protractor.conf.js
// A reference configuration file.

exports.config = {
    // ----- How to setup Selenium -----
    //
    // There are three ways to specify how to use Selenium. Specify one of the
    // following:
    //
    // 1. seleniumServerJar - to start Selenium Standalone locally.
    // 2. seleniumAddress - to connect to a Selenium server which is already
    //    running.
    // 3. sauceUser/sauceKey - to use remote Selenium servers via SauceLabs.

    // The location of the selenium standalone server .jar file.
    seleniumServerJar: './node_modules/protractor/selenium/selenium-server-standalone-2.47.1.jar',
    // The port to start the selenium server on, or null if the server should
    // find its own unused port.
    seleniumPort: null,
    // Chromedriver location is used to help the selenium standalone server
    // find chromedriver. This will be passed to the selenium jar as
    // the system property webdriver.chrome.driver. If null, selenium will
    // attempt to find chromedriver using PATH.
    chromeDriver: './node_modules/protractor/selenium/chromedriver',
    // Additional command line options to pass to selenium. For example,
    // if you need to change the browser timeout, use
    // seleniumArgs: ['-browserTimeout=60'],
    seleniumArgs: ['-Dwebdriver.firefox.profile=default'],

    // If sauceUser and sauceKey are specified, seleniumServerJar will be ignored.
    // The tests will be run remotely using SauceLabs.
    sauceUser: null,
    sauceKey: null,

    //Waiting for Page Synchronization:Before performing any action, Protractor asks Angular to wait until the page is synchronized.
    //Asynchronous Script Timeout:Sets the amount of time to wait for an asynchronous script to finish execution before throwing an error.
    //Default timeout: 11 seconds
    allScriptsTimeout: 30000,

    // ----- What tests to run -----
    //
    // Spec patterns are relative to the location of this config.
    // Order our specs
    specs: [
        './setup/*spec.js',
        './pageObjects/*spec.js',
        './roles/*spec.js',
        './chat/*spec.js',
        './roster/*spec.js',
        './features/**/*spec.js'
    ],

    exclude: [
        './node_modules/*'
    ],

    // ----- Capabilities to be passed to the webdriver instance ----
    //
    // For a full list of available capabilities, see
    // https://code.google.com/p/selenium/wiki/DesiredCapabilities
    // and
    // https://code.google.com/p/selenium/source/browse/javascript/webdriver/capabilities.js
    capabilities: {
        'browserName': 'chrome',
        //'browserName': 'firefox',
        'chromeOptions': {
            'args': ['--always-authorize-plugins', '--use-fake-ui-for-media-stream']
        },
        shardTestFiles: false,
        maxInstances: 1
    },

    //capabilities: {
    //    'browserName': 'firefox',
    //    "firefox_profile": "protractor",
    //    shardTestFiles: false,
    //    maxInstances: 4
    //},

    // A base URL for your application under test. Calls to protractor.get()
    // with relative paths will be prepended with this.
    baseUrl: '',
    getPageTimeout: 30000,
    onPrepare: function() {
        // Attach a global logger to be used across this test
        global.logger = require('plcm-logger');
        logger.init('e2etests', 'trace,error,debug'.split(','), 'file'.split(','));
        logger.debug('Starting e2etests!');

        //https://www.npmjs.com/package/jasmine-spec-reporter
        var SpecReporter = require('jasmine-spec-reporter');
        //https://github.com/mlison/protractor-jasmine2-screenshot-reporter
        var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');
        //https://www.npmjs.com/package/pix-diff
        var PixDiff = require('pix-diff');

        var width = 1100,
            height = 825;

        browser.pixdiff = new PixDiff({
            basePath: 'referenceui/',
            width: 1920,
            height: 1080
        });

        browser.driver.manage().window().setSize(width, height);

        // add jasmine spec reporter
        jasmine.getEnv().addReporter(
            new SpecReporter({
                displayStacktrace: true
            }));
        jasmine.getEnv().addReporter(
            new HtmlScreenshotReporter({
                dest: 'target/screenshots',
                filename: 'index.html'
            })
        );
    },

    // Selector for the element housing the angular app - this defaults to
    // body, but is necessary if ng-app is on a descendant of <body>
    rootElement: 'body',

    framework: 'jasmine2',

    // ----- Options to be passed to minijasminenode -----
    jasmineNodeOpts: {
        // onComplete will be called just before the driver quits.
        onComplete: null,
        // If true, display spec names.
        isVerbose: true,
        // If true, print colors to the terminal.
        showColors: true,
        // If true, include stack traces in failures.
        includeStackTrace: true,
        // Default time to wait in ms before a test fails.
        defaultTimeoutInterval: 60000,
        // Remove protractor dot reporter
        print: function() {}
    }
};