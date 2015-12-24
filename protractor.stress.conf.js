//This is for stress testing, so increase the timeout
exports.config = {
    seleniumServerJar: './node_modules/protractor/selenium/selenium-server-standalone-2.45.0.jar',
    seleniumPort: null,
    chromeDriver: './node_modules/protractor/selenium/chromedriver',
    seleniumArgs: [],

    // Order our specs
    specs: [
        './stress/*spec.js'
    ],

    exclude: [
        './node_modules/*'
    ],

    capabilities: {
        'browserName': 'chrome',
        'chromeOptions': {
            'args': ['--always-authorize-plugins']
        },
        shardTestFiles: false,
        maxInstances: 1,
        count: 1
    },

    baseUrl: '',
    getPageTimeout: 30000,
    onPrepare: function() {
    },
    rootElement: 'body',
    framework: 'jasmine2',

    // ----- Options to be passed to minijasminenode -----
    jasmineNodeOpts: {
        // onComplete will be called just before the driver quits.
        onComplete: null,
        // If true, display spec names.
        isVerbose: false,
        // If true, print colors to the terminal.
        showColors: true,
        // If true, include stack traces in failures.
        includeStackTrace: true,
        // Default time to wait in ms before a test fails
        defaultTimeoutInterval: 10*60*1000
    }
};