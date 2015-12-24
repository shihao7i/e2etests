/*jshint loopfunc: true */

var nconf        = require('nconf'),
    loginHelpers = require('../helpers/loginHelpers'),
    MEAUser      = require('../helpers/userObj'),
    _            = require('lodash'),
    utils        = require('../helpers/utils');

nconf.file('test', 'conf.json');
nconf.file('permission', '../permissions.json');
nconf.load();

var meaurl = loginHelpers.getMEAUrl(),
    authUserInfo = nconf.get("test_config").users.authenticated[0],
    presenterInfo = nconf.get("test_config").users.authenticated[1],
    guestInfo = nconf.get("test_config").users.guest[0];

var users = [
    {
        info: authUserInfo,
        role: 'Chairperson'
    }, {
        info: presenterInfo,
        role: 'Participant'
    }, {
        info: guestInfo,
        role: 'Guest'
    }
];

var meetingInfo = {avcEnabled: false};

var saveScreenShots = nconf.get("test_config").pixdiff.generate,
    testScreenShots = nconf.get("test_config").pixdiff.test;

describe('creating an ad-hoc meeting to test end meeting page', function () {
    it('creating adhoc meeting is successful', function(done) {
        loginHelpers.createAdHocMeeting(authUserInfo)
            .then(function (result) {
                meetingInfo.id = result.presentedId;
                logger.debug('Ad-Hoc meeting id = ' + meetingInfo.id);
                logger.debug(result);
                expect(meetingInfo.id).not.toBe(undefined);
                done();
            });
    });
});

describe('testing end meeting for various roles', function() {
    users.map(function(testUser) {
        (function(testUser) {
            describe('testing end meeting screen for ' + testUser.role, function () {
                var endMeetingPage, mainPage;
                var user;

                beforeEach(function(done) {
                    user = new MEAUser(testUser.info, meetingInfo, browser);
                    user.goToMainPage()
                        .then(function(){
                            mainPage = user.mainPage;
                            endMeetingPage = user.mainPage.endMeeting;
                            var filename = 'mainPage-before-endmeeting_' + testUser.role;
                            if (testScreenShots) {
                                // Snapshot the current state to test it later on
                                expect(browser.pixdiff.saveScreen(filename)).not.toBeNull();
                            }
                            return user.mainPage.clickEndMeetingButton();
                        })
                        .nodeify(done);
                });

                it('has the UI in end meeting page we expect it to have', function () {
                    var filename = 'endMeetingPage_confirmationPage_' + testUser.role;
                    if (saveScreenShots) {
                        expect(browser.pixdiff.saveScreen(filename)).not.toBeNull();
                    }
                    if (testScreenShots) {
                        expect(browser.pixdiff.checkScreen(filename)).toMatch();
                    }
                });

                if (testUser.role !== 'Chairperson') {
                    it('can click on no-exit confirmation checkbox', function() {
                        expect(endMeetingPage.checkbox.isSelected()).toBeFalsy();
                        endMeetingPage.checkbox.click();
                        expect(endMeetingPage.checkbox.isSelected()).toBeTruthy();
                    });
                }

                it('user has end meeting for all option if his role allows it', function() {
                    var allowEndMeetingForAll =  nconf.get("Permissions")[testUser.role].indexOf('EndMeeting') !== -1;
                    logger.debug(testUser.role + ' has end meeting for all option? = ' + allowEndMeetingForAll);
                    expect(endMeetingPage.endMeetingforAllButton.isPresent()).toBe(allowEndMeetingForAll);
                });

                it('can click on return to the meeting button and take us to main page', function() {
                    var filename = 'mainPage-before-endmeeting_' + testUser.role;
                    endMeetingPage.returnToMain();
                    if (testScreenShots) {
                        expect(browser.pixdiff.checkScreen(filename)).toMatch();
                    }
                });

                it('can click on leave this meeting button and take us to meeting ended page', function () {
                    endMeetingPage.leaveMeetingButton.click();
                    expect(endMeetingPage.endMeetingPagePanel.getText()).toBe('You have left the meeting.');
                });

                it('can click on end meeting for all option (if role allows) and we are taken to the meeting ended page', function() {
                    var allowEndMeetingForAll =  nconf.get("Permissions")[testUser.role].indexOf('EndMeeting') !== -1;
                    if (allowEndMeetingForAll) {
                        endMeetingPage.endMeetingforAllButton.click();
                        expect(endMeetingPage.endMeetingPagePanel.getText()).toBe('The meeting ended.');
                    }
                });

            });
        })(testUser);
    });
});

//// spec.js
//describe('end meeting page object works as expected without using cookie ', function() {
//    var user, mainPage, endMeetingPage, originalTimeout;
//
//    beforeEach(function(done) {
//        user = new MEAUser(presenterInfo, meetingInfo, browser);
//        // the tests take a lot longer to run in firefox so we have to increase timeout interval.
//        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
//        jasmine.DEFAULT_TIMEOUT_INTERVAL = 5 * 60 * 1000;
//        user.goToMainPage()
//            .then(function(){
//                mainPage = user.mainPage;
//                if (testScreenShots) {
//                    // Snapshot the current state to test it later on
//                    expect(browser.pixdiff.saveScreen('mainPage-before-endmeeting')).not.toBeNull();
//                }
//                return user.mainPage.endMeetingButton.click();
//            })
//            .then(function(){
//                endMeetingPage = mainPage.endMeeting;
//                done();
//            });
//    });
//
//
//    afterEach(function() {
//        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
//    });
//
//    it('has the UI in confirmation page we expect it to have', function () {
//        if (saveScreenShots) {
//            expect(browser.pixdiff.saveRegion(endMeetingPage.confirmationPage, 'endMeetingPage_confirmationPage')).not.toBeNull();
//        }
//        if (testScreenShots) {
//            expect(browser.pixdiff.checkRegion(endMeetingPage.confirmationPage, 'endMeetingPage_confirmationPage')).toMatch();
//        }
//    });
//
//    it('can click on no-exit confirmation checkbox', function() {
//        expect(endMeetingPage.checkbox.isSelected()).toBeFalsy();
//        endMeetingPage.checkbox.click();
//        expect(endMeetingPage.checkbox.isSelected()).toBeTruthy();
//    });
//
//    it('can click on return to the meeting button and take us to main page', function() {
//        endMeetingPage.returnMeetingButton.click();
//        if (testScreenShots) {
//            expect(browser.pixdiff.checkScreen('mainPage-before-endmeeting')).toMatch();
//        }
//    });
//
//
//    it('can click on leave this meeting button and take us to meeting ended page', function () {
//        endMeetingPage.leaveMeetingButton.click();
//
//        expect(endMeetingPage.endMeetingPagePanel.getText()).toBe('You have left the meeting.');
//        //if (saveScreenShots) {
//        //    expect(browser.pixdiff.saveScreen('endMeetingPage')).not.toBeNull();
//        //}
//        //if (testScreenShots) {
//        //    expect(browser.pixdiff.checkScreen('endMeetingPage')).toMatch();
//        //}
//    });
//});


