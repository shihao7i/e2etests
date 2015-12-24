//https://raw.githubusercontent.com/yearofmoo/angularjs-seed-repo/master/test/protractor.conf.js
// A reference configuration file.

//https://github.com/mlison/protractor-jasmine2-screenshot-reporter
var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

// wilson's ip address: "http://10.230.26.98:4444/wd/hub",
// davan's ip address: "http://10.230.26.134:4444/wd/hub",
// rpws ip address: "http://10.218.56.158:4444/wd/hub"
// e2e slave 2: "http://e2eslave2.cloudax.is:4444/wd/hub"
// protractor1: "http://e2eslave1.cloudax.is:4444/wd/hub"
var willsonsAddress = "http://10.230.26.98:4444/wd/hub";
var rpwsAddress = "http://10.218.56.158:4444/wd/hub";
var e2e1Address = "http://e2eslave1.cloudax.is:4444/wd/hub";    // protractor1
var e2e2Address = "http://e2eslave2.cloudax.is:4444/wd/hub";    // e2e slave 2
var e2eMacAddress = "http://10.228.14.184:4444/wd/hub"; // e2e mac
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
    seleniumArgs: [],

    // If sauceUser and sauceKey are specified, seleniumServerJar will be ignored.
    // The tests will be run remotely using SauceLabs.
    sauceUser: null,
    sauceKey: null,

    // ----- What tests to run -----
    //
    // Spec patterns are relative to the location of this config.
    // Order our specs
    specs: [
        //"./multi/helloWorld-spec.js"
        //'./setup/*spec.js',
        //'./login/*spec.js',
        //'./chat/*spec.js'
    ],

    exclude: [
        './node_modules/*'
    ],

    multiCapabilities: [{
        'browserName': 'chrome',
        'chromeOptions': {
            //'args': ['--always-authorize-plugins', '--use-fake-ui-for-media-stream']
        },
        shardTestFiles: false,
        maxInstances: 4,
        //seleniumServerJar: './node_modules/protractor/selenium/selenium-server-standalone-2.45.0.jar',
        seleniumAddress: e2eMacAddress,
        chromeDriver: './node_modules/protractor/selenium/chromedriver',
        //seleniumAddress: rpwsAddress,
        count: 1,
        instanceNum: 4,

        specs: [
            './setup/*spec.js',
            './pageObjects/*spec.js',
            './roles/*spec.js',
            './chat/*spec.js',
            './roster/*spec.js',
            './features/**/*spec.js'
        ],

        // User defined name for the capability that will display in the results log
        // Defaults to the browser name
        logName: 'Chrome - chair'

    }
        //{
        //    'browserName': 'chrome',
        //    'chromeOptions': {
        //        'args': ['--always-authorize-plugins', '--use-fake-ui-for-media-stream']
        //    },
        //    shardTestFiles: false,
        //    maxInstances: 4,
        //    seleniumAddress: rpwsAddress,
        //
        //    count: 1 ,
        //    instanceNum: 1,
        //
        //    //specs: [
        //    //    "./multi/helloWorld-spec.js"
        //    //],
        //
        //    logName: 'Chrome - guest1'
        //},
        //{
        //    'browserName': 'chrome',
        //    'chromeOptions': {
        //        'args': ['--always-authorize-plugins', '--use-fake-ui-for-media-stream']
        //    },
        //    shardTestFiles: false,
        //    maxInstances: 4,
        //    seleniumAddress: e2e1Address,// protractor1
        //    count: 1 ,
        //    instanceNum: 2,
        //
        //    //specs: [
        //    //    "./multi/helloWorld-spec.js"
        //    //],
        //
        //    logName: 'Chrome - guest2'
        //},
        //{
        //    'browserName': 'chrome',
        //    'chromeOptions': {
        //        'args': ['--always-authorize-plugins', '--use-fake-ui-for-media-stream']
        //    },
        //    shardTestFiles: false,
        //    maxInstances: 4,
        //    seleniumAddress: e2e1Address,// protractor1
        //    count: 1 ,
        //    instanceNum: 3,
        //
        //    //specs: [
        //    //    "./multi/helloWorld-spec.js"
        //    //],
        //
        //    logName: 'Chrome - guest2'
        //},
        //{
        //    'browserName': 'chrome',
        //    'chromeOptions': {
        //        'args': ['--always-authorize-plugins', '--use-fake-ui-for-media-stream']
        //    },
        //    shardTestFiles: false,
        //    maxInstances: 4,
        //    seleniumAddress: e2e1Address,// protractor1
        //    count: 1 ,
        //    instanceNum: 4,
        //
        //    //specs: [
        //    //    "./multi/helloWorld-spec.js"
        //    //],
        //
        //    logName: 'Chrome - guest2'
        //},
        //{
        //    'browserName': 'chrome',
        //    'chromeOptions': {
        //        'args': ['--always-authorize-plugins', '--use-fake-ui-for-media-stream']
        //    },
        //    shardTestFiles: false,
        //    maxInstances: 4,
        //    seleniumAddress: rpwsAddress,
        //    count: 1 ,
        //    instanceNum: 5,
        //
        //    //specs: [
        //    //    "./multi/helloWorld-spec.js"
        //    //],
        //
        //    logName: 'Chrome - guest2'
        //},
        //{
        //    'browserName': 'chrome',
        //    'chromeOptions': {
        //        'args': ['--always-authorize-plugins', '--use-fake-ui-for-media-stream']
        //    },
        //    shardTestFiles: false,
        //    maxInstances: 4,
        //    seleniumAddress: rpwsAddress,
        //    count: 1 ,
        //    instanceNum: 6,
        //
        //    //specs: [
        //    //    "./multi/helloWorld-spec.js"
        //    //],
        //
        //    logName: 'Chrome - guest2'
        //},
        //{
        //    'browserName': 'chrome',
        //    'chromeOptions': {
        //        'args': ['--always-authorize-plugins', '--use-fake-ui-for-media-stream']
        //    },
        //    shardTestFiles: false,
        //    maxInstances: 4,
        //    seleniumAddress: rpwsAddress,
        //    count: 1 ,
        //    instanceNum: 7,
        //
        //    //specs: [
        //    //    "./multi/helloWorld-spec.js"
        //    //],
        //
        //    logName: 'Chrome - guest2'
        //},
        //{
        //    'browserName': 'chrome',
        //    'chromeOptions': {
        //        'args': ['--always-authorize-plugins', '--use-fake-ui-for-media-stream']
        //    },
        //    shardTestFiles: false,
        //    maxInstances: 4,
        //    seleniumAddress: e2e2Address,// e2e slave 2
        //    count: 1 ,
        //    instanceNum: 8,
        //
        //    //specs: [
        //    //    "./multi/helloWorld-spec.js"
        //    //],
        //
        //    logName: 'Chrome - guest2'
        //},
        //{
        //    'browserName': 'chrome',
        //    'chromeOptions': {
        //        'args': ['--always-authorize-plugins', '--use-fake-ui-for-media-stream']
        //    },
        //    shardTestFiles: false,
        //    maxInstances: 4,
        //    seleniumAddress: e2e2Address,// e2e slave 2
        //    count: 1 ,
        //    instanceNum: 9,
        //
        //    //specs: [
        //    //    "./multi/helloWorld-spec.js"
        //    //],
        //
        //    logName: 'Chrome - guest2'
        //}
    ],

    // A base URL for your application under test. Calls to protractor.get()
    // with relative paths will be prepended with this.
    baseUrl: '',
    getPageTimeout: 30000,
    //onPrepare: function() {
    //
    //    // If you need access back to the current configuration object,
    //    // use a pattern like the following:
    //    browser.getProcessedConfig().then(function(config) {
    //        // config.capabilities is the CURRENT capability being run, if
    //        // you are using multiCapabilities.
    //        //console.log('Executing capability', config.capabilities);
    //        browser.params.instanceNum = config.capabilities.instanceNum;
    //        //console.log('browser.params.num: ', browser.params.num);
    //    });
    //
    //    jasmine.getEnv().addReporter(
    //        new HtmlScreenshotReporter({
    //            dest: 'target/screenshots',
    //            filename: 'my-report.html'
    //        })
    //    );
    //},
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

    // The params object will be passed directly to the Protractor instance,
    // and can be accessed from your test as browser.params. It is an arbitrary
    // object and can contain anything you may need in your test.
    // This can be changed via the command line as:
    //   --params.login.user 'Joe'
    params: {
        instanceNum: null,
        numAttendees: 2
    },

    // If set, protractor will save the test output in json format at this path.
    // The path is relative to the location of this config.
    resultJsonOutputFile: './result.json',

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
        defaultTimeoutInterval: 60000
    }
};