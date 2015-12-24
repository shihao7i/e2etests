/*jshint loopfunc: true */
var Promise = require('bluebird'),
    nconf = require('nconf'),
    loginHelpers = require('../../helpers/loginHelpers'),
    MEAUser = require('../../helpers/userObj'),
    utils = require('../../helpers/utils'),
    _ = require('lodash'),
    EmbeddedUser = require('./byod-pageObj.js');

nconf.file('test', 'conf.json');
nconf.load();

var meaurl = loginHelpers.getMEAUrl();

var authUser1Info = nconf.get("test_config").users.authenticated[0],
    authUser2Info = nconf.get("test_config").users.authenticated[4];

var meetingInfo = {avcEnabled: false};

var saveScreenShots = nconf.get("test_config").pixdiff.generate,
    testScreenShots = nconf.get("test_config").pixdiff.test;


var requests = {
    ServiceListRequest: {
        command: 'polycom.ServiceListRequest()',
        response: [
            {
                'source': 'polycom',
                'event': 'ServiceListResponse',
                'value': {
                    "services": [
                        {
                            "service": "authentication",
                            "versions": ["1"]
                        },
                        {
                            "service": "epctrl",
                            "versions": ["1"]
                        },
                        {
                            "service": "location",
                            "versions": ["1"]
                        },
                        {
                            "service": "meetingCollab",
                            "versions": ["1"]
                        }
                    ]
                }
            }
        ]
    },

    ServiceVersionRequest_Good_Example1: {
        command: "polycom.ServiceVersionRequest({'service': 'epctrl','versions': ['1', '2']})",
        response: [
            {
                "source": "polycom",
                "event": "ServiceVersionResponse",
                "value": {"service": "epctrl", "version": "1", "status": true}
            }
        ]
    },

    ServiceVersionRequest_Good_Example2: {
        command: "polycom.ServiceVersionRequest({'service': 'authentication','versions': ['1']})",
        response: [
            {
                "source": "polycom",
                "event": "ServiceVersionResponse",
                "value": {"service": "authentication", "version": "1", "status": true}
            }
        ]
    },

    ServiceVersionRequest_Bad_Example1: {
        command: "polycom.ServiceVersionRequest({'service': 'unknown','versions': ['1']})",
        response: [
            {
                "source": "polycom",
                "event": "ServiceVersionResponse",
                "value": {"service": "unknown", "version": "", "status": false}
            }
        ]
    },

    ServiceVersionRequest_Bad_Example2: {
        command: "polycom.ServiceVersionRequest({'service': 'authentication','versions': ['2']})",
        response: [
            {
                "source": "polycom",
                "event": "ServiceVersionResponse",
                "value": {"service": "authentication", "version": "", "status": false}
            }
        ]
    },

    'polycom.getVersion()': {
        'command': 'polycom.getVersion()',
        response: [
            {
                "source": "polycom",
                "event": "version",
                "value": {
                    "version": function(value) {
                        return /^\d\.\d\.\d\.\d+\-\d+/.test(value);
                    }
                }
            }
        ]
    },
    'polycom.setLogLevel({level: "error"})': {
        'command': 'polycom.setLogLevel({level: "error"}); logger.debug("hello"); logger.error("hi");',
        response: [{
            source: "polycom",
            event: "Log",
            value: {
                message: function(value) {
                    return /.*hi/.test(value);
                },
                level: 'error'
            }
        }]
    }

};

describe('creating an ad-hoc meeting to test polycom.* apis', function () {
    it('creating adhoc meeting is successful', function (done) {
        loginHelpers.createAdHocMeeting(authUser1Info)
            .then(function (result) {
                meetingInfo.id = result.presentedId;
                //logger.debug('Ad-Hoc meeting id = ' + meetingInfo.id);
                //logger.debug(result);
                expect(meetingInfo.id).not.toBe(undefined);
                done();
            });
    });
});

describe('can exercise other polycom apis', function () {
    beforeEach(function (done) {
        var meeting = {
            id: meetingInfo.id,
            url: meaurl + '/?onload=protractorCallback',
            avcEnabled: false
        };
        this.byodUser = new EmbeddedUser(authUser1Info, meeting, browser);
        Promise.resolve(this.byodUser.loadPage())
            .then(this.byodUser.waitForCallbackResponse)
            .nodeify(done);
    });

    afterEach(function () {
    });

    for (var req in requests) {
        if (requests.hasOwnProperty(req)) {
            (function (testCase, request) {
                it('can respond to our request ' + testCase, function (done) {
                    var self = this;
                    Promise.resolve(browser.executeScript(request.command))
                        .return(request.response.length)
                        .then(this.byodUser.waitForCallbackResponse)
                        .then(function (responses) {
                            logger.debug(responses);
                            logger.debug(request.response);
                            expect(responses.length).toBe(request.response.length);
                            var copyObj = _.cloneDeep(responses);
                            _.merge(copyObj, request.response, utils.matchCustomizer);
                            expect(responses).toEqual(copyObj);
                            done();
                        });
                });
            })(req, _.cloneDeep(requests[req]));
        }
    }

});