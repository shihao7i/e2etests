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
    'auth.Login(good credentials)': {
        command: '.auth.Login({username:"' +
        authUser1Info.userName + '", password:"' + authUser1Info.password + '"})',
        response: [
            {
                "source": "auth",
                "event": "LoginResponse",
                "value": {
                    "username": authUser1Info.userName,
                    "authenticated": true,
                    "displayName": authUser1Info.firstName + ' ' + authUser1Info.lastName,
                    "userAddress": authUser1Info.email,
                    "userId": function (value) {
                        return /^\w{32}$/.test(value);
                    }
                }
            }
        ]
    },
    'auth.Login(bad credentials)': {
        command: '.auth.Login({username:"bad", password:"password"})',
        response: [
            {
                "source": "auth",
                "event": "LoginResponse",
                "value": {
                    "error": {
                        "errorKey": "MEA_ERROR_INVALID_USERNAME_PASSWORD_MSG",
                        "errorDescription": " Invalid username or password"
                    }
                }
            }
        ]
    }
    // TODO: add SPNEGO SSO
};

describe('creating an ad-hoc meeting to test auth.* apis', function () {
    it('creating adhoc meeting is successful', function (done) {
        loginHelpers.createAdHocMeeting(authUser1Info)
            .then(function (result) {
                meetingInfo.id = result.presentedId;
                expect(meetingInfo.id).not.toBe(undefined);
                done();
            });
    });
});

describe('can exercise other auth apis', function () {
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