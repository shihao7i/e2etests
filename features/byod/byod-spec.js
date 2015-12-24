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

// The following cases are wrong, the below should be based off of settings.json not hardcoded usernames and vmrs
        //login: {
        //    command: "polycom.auth.Login({username:'devtest01', password:'Polycom123'})",
        //    response: [
        //        {
        //            'source': 'auth',
        //            'event': 'LoginResponse',
        //            'value': {
        //                'authenticated': true,
        //                'username': 'devtest07',
        //                'userAddress': 'devtest07@labil.eng',
        //                'displayName': 'devtest07 07',
        //                "userId": "b4df64dcf8ed581e9d6f16e1733ee6f5"
        //            }
        //        }
        //    ]
        //},

        //connectRequest: {
        //    command: "polycom.epctrl.ConnectRequest({'epId': 21})",
        //    response: [
        //        {
        //            'source': 'epctrl',
        //            'event': 'ConnectResponse',
        //            'value': {
        //                "epId": 1978,
        //                "epIp": "10.228.14.240",
        //                "roomName": "MR-Faran",
        //                "epCtrlExists": true,
        //                "commonResponse": {
        //                    "httpStatus": 200,
        //                    "errorDescription": "ok"
        //                }
        //            }
        //        }
        //    ]
        //},

        //joinRequest: {
        //    command: "polycom.meetingCollab.JoinRequest({'meetingID':'442001', 'meetingPin':'1234'})",
        //    response: [
        //        {
        //            "source":"meetingCollab",
        //            "event":"JoinResponse",
        //            "value":{
        //                "organizerUserId":null,
        //                "organizerUserName":"test",
        //                "organizerUserEmail":"test@localhost.com",
        //                "description":"test test's Event",
        //                "agenda":"No agenda set yet",
        //                "invitees":[{"username":"test","userAddress":"test@localhost.com","domain":"local","displayName":"test test"}],
        //                "scheduledStartTime":"2015-07-20T14:45:00.000Z",
        //                "scheduledEndTime":"2015-07-25T15:45:00.000Z"
        //            }
        //        }
        //    ]
        //},

        //setMyLocation: {
        //    command: "polycom.location.SetMyLocation({'locationId': '21'})",
        //},
        //
        //dialToEpRequest: {
        //    command: "polycom.meetingCollab.DialToEpRequest({'epId': '21'})",
        //    response: [
        //        {
        //            "source":"meetingCollab",
        //            "event":"MeetingStatusNotification",
        //            "value":{
        //                "type":"Recording",
        //                "value": {
        //                    "status": true
        //                }
        //            }
        //        }
        //    ]
        //},

        //hangupEpRequest: {
        //    command: "polycom.meetingCollab.HangupEpRequest({'epId': '21'})",
        //    response: [
        //        {"source":"meetingCollab","event":"MeetingStatusNotification",
        //            "value":{
        //                "type":"Recording",
        //                "value": {
        //                "status": true
        //                }
        //            }
        //        }
        //    ]
        //}
    //};

var meetingInfo = {avcEnabled: false};

var saveScreenShots = nconf.get("test_config").pixdiff.generate,
    testScreenShots = nconf.get("test_config").pixdiff.test;

describe('creating an ad-hoc meeting to join for byod features test', function () {
    it('creating adhoc meeting is successful', function (done) {
        loginHelpers.createAdHocMeeting(authUser1Info)
            .then(function (result) {
                meetingInfo.id = result.presentedId;
                logger.debug('Ad-Hoc meeting id = ' + meetingInfo.id);
                logger.debug(result);
                expect(meetingInfo.id).not.toBe(undefined);
                done();
            });
    });
});

describe('byod features work', function () {
    beforeEach(function (done) {
        var meeting = {
            id: meetingInfo.id,
            url: meaurl + '/?onload=protractorCallback',
            avcEnabled: false
        };
        this.byodUser = new EmbeddedUser(authUser1Info, meeting, browser);
        Promise.resolve(this.byodUser.loadPage())
            .nodeify(done);
    });

    afterEach(function () {
    });

    it('onload=callback loads mea in byod mode', function () {
        if (saveScreenShots) {
            expect(browser.pixdiff.saveScreen('byod-loading-page')).not.toBe(null);
        }
        if (testScreenShots) {
            expect(browser.pixdiff.checkScreen('byod-loading-page', {
                threshold: 0.1,
                thresholdType: 'percent'
            })).toMatch();
        }
    });

    it('gave us the inited event on load', function (done) {
        var self = this;
        this.byodUser.waitForCallbackResponse()
            .then(function (responses) {
                logger.debug(responses);
                expect(responses.length).toBe(1);
                expect(responses[0]).toEqual(self.byodUser.INITED_MESSAGE);
                done();
            });
    });

});

// meetnow-byod.cloudax.is shouldn't be used. If you want to test on meetnow-byod.cloudax.is move this spec to someother file and
// use  a separate protract.conf file for this.

//xdescribe('group series as expected', function () {
//    var user, byodUser;
//    beforeEach(function (done) {
//        var browser2 = browser.forkNewDriverInstance();
//        var width = 1100,
//            height = 825;
//
//        var meetingInfo2 = {
//            url: 'https://meetnow-byod.cloudax.is',
//            id: '442001',
//            avcEnabled: false
//        };
//
//        byodUser = new EmbeddedUser({}, {url:'https://meetnow-byod.cloudax.is' + '/?onload=protractorCallback'}, browser);
//        // '/?onload=console.warn'
//        // '/?onload=protractorCallback'
//
//        Promise.resolve(byodUser.loadPage())
//            .then(byodUser.waitForCallbackResponse).nodeify(done);
//
//        browser2.driver.manage().window().setSize(width, height);
//
//        user = new MEAUser(authUser2Info, meetingInfo2, browser2);
//        user.goToMainPage();
//
//    });
//
//    afterEach(function (done) {
//        //browser.pause();
//        user.browser.quit();
//        done();
//    });
//
//    it('can dial to EP and get the answer from group series', function (done) {
//
//        byodUser.browser.executeScript(requests.login.command)
//            .then(byodUser.waitForCallbackResponse)
//            .then(function () {
//                return byodUser.browser.executeScript(requests.connectRequest.command);
//            })
//            .then(byodUser.waitForCallbackResponse)
//            .then(function () {
//                return byodUser.browser.executeScript(requests.joinRequest.command);
//            })
//            .then(function () {
//                return Promise.all([user.browser.sleep(3500), byodUser.browser.sleep(3500)]);
//            })
//            .then(function () {
//                return byodUser.skipButton.click();
//            })
//            .then(function () {
//                return byodUser.browser.executeScript(requests.setMyLocation.command);
//            })
//            .then(function () {
//                return byodUser.browser.executeScript(requests.dialToEpRequest.command);
//            })
//            .then(function () {
//                return Promise.all([user.browser.sleep(3500), byodUser.browser.sleep(3500)]);
//            })
//            .then(function () {
//                //browser.pause();
//                return byodUser.browser.executeScript(requests.hangupEpRequest.command);
//            })
//            .then(function () {
//                done();
//            });
//
//    });
//
//});

//    afterEach(function () {
//    });
//
//    for (var req in requests) {
//        if (requests.hasOwnProperty(req)) {
//            (function (testCase, request) {
//                it('can respond to our request ' + testCase, function (done) {
//                    var self = this;
//                    Promise.resolve(browser.executeScript(request.command))
//                        .return(request.response.length)
//                        .then(this.byodUser.waitForCallbackResponse)
//                        .then(function (responses) {
//                            logger.debug(responses);
//                            logger.debug(request.response);
//                            expect(responses.length).toBe(request.response.length);
//                            //todo: the property value of response could be changed every time, we should skip this to avoid getting error
//                            expect(responses).toEqual(request.response);
//                            done();
//                        });
//                });
//            })(req, _.cloneDeep(requests[req]));
//        }
//    }
//
//});
//
//xdescribe('group series as expected', function () {
//    var user, byodUser;
//    beforeEach(function (done) {
//        var browser2 = browser.forkNewDriverInstance();
//        var width = 1100,
//            height = 825;
//
//        var meetingInfo2 = {
//            url: 'https://meetnow-byod.cloudax.is',
//            id: '442001',
//            avcEnabled: false
//        };
//
//        byodUser = new EmbeddedUser({}, {url:'https://meetnow-byod.cloudax.is' + '/?onload=protractorCallback'}, browser);
//        // '/?onload=console.warn'
//        // '/?onload=protractorCallback'
//
//        Promise.resolve(byodUser.loadPage())
//            .then(byodUser.waitForCallbackResponse).nodeify(done);
//
//        browser2.driver.manage().window().setSize(width, height);
//
//        user = new MEAUser(authUser2Info, meetingInfo2, browser2);
//        user.goToMainPage();
//
//    });
//
//    afterEach(function (done) {
//        //browser.pause();
//        user.browser.quit();
//        done();
//    });
//
//    it('can dial to EP and get the answer from group series', function (done) {
//
//        byodUser.browser.executeScript(requests.login.command)
//            .then(byodUser.waitForCallbackResponse)
//            .then(function () {
//                return byodUser.browser.executeScript(requests.connectRequest.command);
//            })
//            .then(byodUser.waitForCallbackResponse)
//            .then(function () {
//                return byodUser.browser.executeScript(requests.joinRequest.command);
//            })
//            .then(function () {
//                return Promise.all([user.browser.sleep(3500), byodUser.browser.sleep(3500)]);
//            })
//            .then(function () {
//                return byodUser.skipButton.click();
//            })
//            .then(function () {
//                return byodUser.browser.executeScript(requests.setMyLocation.command);
//            })
//            .then(function () {
//                return byodUser.browser.executeScript(requests.dialToEpRequest.command);
//            })
//            .then(function () {
//                return Promise.all([user.browser.sleep(3500), byodUser.browser.sleep(3500)]);
//            })
//            .then(function () {
//                //browser.pause();
//                return byodUser.browser.executeScript(requests.hangupEpRequest.command);
//            })
//            .then(function () {
//                done();
//            });
//
//    });
//
//});

