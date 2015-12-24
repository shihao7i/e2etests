/*jshint loopfunc: true */

var nconf = require('nconf'),
    MEALoginPage = require('./loginPageObj'),
    MEAUser = require('../helpers/userObj'),
    loginHelpers = require('../helpers/loginHelpers'),
     _ = require('lodash');

nconf.file('test', 'conf.json');
nconf.load();

var meaurl = loginHelpers.getMEAUrl(),
    userInfo = nconf.get("test_config").users.authenticated[0],
    userInfo2 = nconf.get("test_config").users.authenticated[1],
    guestInfo  = nconf.get("test_config").users.guest[0];


var saveScreenShots = nconf.get("test_config").pixdiff.generate,
    testScreenShots = nconf.get("test_config").pixdiff.test;

var meetingInfo = {avcEnabled: false};


// spec.js
xdescribe('can see login notifications', function() {
    var now = new Date();
    var testInfo = [
        {
            // meeting in the future
            name: 'meeting has not started',
            type: "SCHEDULED",
            startTime:  (new Date(now.getTime() + 1000 * 60 * 60)).toISOString(),
            endTime:  (new Date(now.getTime() + 2 * 1000 * 60 * 60)).toISOString()
        },
        {
            // generic meeting
            name: 'test cancelled meeting',
            type: "SCHEDULED"
        },
        {
            // meeting with a participant pin
            name: 'missing participant pin',
            type: "AD_HOC",
            participantPasscode: "1"
        },
        {
            // meeting with an invalid pin
            name: 'invalid participant pin',
            type: "AD_HOC",
            participantPasscode: "2"
        },
        {
            // meeting with auth required
            name: 'auth required meeting',
            type: "AD_HOC",
            "authRequired": true
        },
        {
            // meeting with auth required
            name: 'meeting to test invalid credentials',
            type: "AD_HOC"
        }
        //{
        //    // generic meeting
        //    name: 'test ended meeting',
        //    type: "AD_HOC"
        //}
    ];
    var expectedResponses = [
        "The meeting you requested has not started. Try again later or contact the meeting organizer.",
        "The meeting you requested was cancelled. Contact the meeting organizer.",
        "This meeting requires a meeting PIN.",
        "Invalid Meeting PIN.",
        "This meeting requires authentication.",
        "Authentication failed. Enter valid username and password."
        //"The meeting you requested has ended. Contact the meeting organizer."
    ];

    var meetings = [];

    describe('can create meetings to test login notifications', function() {
        testInfo.map(function (info) {
            it('can create meeting for test case with ' + info.name, function(done) {
                loginHelpers.createScheduledMeeting(userInfo, info)
                    .then(function(result) {
                        meetings.push({
                            id: result.presentedId,
                            wspId: result.id
                        });
                        done();
                    });
            });
        });

        it('can cancel created meeting', function(done) {
            logger.debug('Trying to cancel meeting ' + meetings[1].wspId);
            loginHelpers.cancelScheduledMeeting(userInfo, meetings[1].wspId)
                .then(function(result) {
                    expect(result.status).toBe("CANCELLED");
                    done();
                });
        });

        //it('can end meeting', function(done) {
        //    var info = {avcEnable: false, id: meetings[5].id};
        //    var user = new MEAUser(userInfo, info, browser);
        //    user.goToMainPage()
        //        .then(function() {
        //            return user.mainPage.endMeetingButton.click();
        //        })
        //        .then(function() {
        //            return user.mainPage.endMeeting.endMeetingforAllButton.click();
        //        })
        //        .nodeify(done);
        //});

        for(var i = 0; i < expectedResponses.length; i++) {
            (function(i) {
                it('can see notification for ' + testInfo[i].name, function (done) {
                    var loginInfo = guestInfo;
                    var meetingInfo = {avcEnable: false, id: meetings[i].id};
                    logger.debug(meetingInfo);

                    // Test specific specializations go here
                    if (expectedResponses[i] === 'Invalid Meeting PIN.') {
                        // Add some invalid pin
                        meetingInfo.pin = '1234';
                    }
                    if (expectedResponses[i] === 'Authentication failed. Enter valid username and password.') {
                        loginInfo = userInfo;
                        loginInfo.password = 'something wrong';
                    }

                    // Begin test
                    var user = new MEAUser(loginInfo, meetingInfo, browser);
                    user.goToLoginPage()
                        .then(function() {
                            return user.loginPage.login(meetingInfo, loginInfo);
                        })
                        .then(function() {
                            return browser.wait(function () {
                                return user.loginPage.notification.getText()
                                    .then(function readNotificationText(text) {
                                        if (text.length > 0) {
                                            logger.debug("Login notification text:" + text);
                                            return text;
                                        } else {
                                            logger.debug("waiting for notification text ...");
                                        }
                                    });
                            }, 5000);
                        })
                        .then(function(text){
                            expect(text).toBe(expectedResponses[i]);
                            var filename = 'login_notifications_' + testInfo[i].name.replace(/\s/g, '_');
                            if (saveScreenShots) {
                                expect(browser.pixdiff.saveRegion(user.loginPage.notificationUI, filename)).not.toBeNull();
                            }
                            if (testScreenShots) {
                                expect(browser.pixdiff.checkRegion(user.loginPage.notificationUI, filename)).toMatch();
                            }
                            done();
                        });
                });
            })(i);
        }
    });



});
