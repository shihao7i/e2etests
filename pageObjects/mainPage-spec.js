var Promise      = require('bluebird'),
    nconf        = require('nconf'),
    loginHelpers = require('../helpers/loginHelpers'),
    MEAUser      = require('../helpers/userObj'),
    utils        = require('../helpers/utils'),
    _            = require('lodash');

nconf.file('test', 'conf.json');
nconf.load();

var meaurl = loginHelpers.getMEAUrl(),
    authUserInfo = nconf.get("test_config").users.authenticated[0],
    presenterInfo = nconf.get("test_config").users.authenticated[1];

var meetingInfo = {avcEnabled: true};

var saveScreenShots = nconf.get("test_config").pixdiff.generate,
    testScreenShots = nconf.get("test_config").pixdiff.test;

describe('creating an ad-hoc meeting to join as a chairperson for main-page', function () {
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

// spec.js
describe('as a chairperson, main page object works as expected with audio & video', function () {
    var user, page;

    beforeEach(function (done) {
        user = new MEAUser(authUserInfo, meetingInfo, browser);
        user.goToMainPage()
            .then(function() {
                page = user.mainPage;
                done();
            });
    });

    it('can take us to the main page', function () {
        expect(browser.getLocationAbsUrl()).toContain('/main');
    });

    it('has the main menu icons we expect to have', function () {
        if (saveScreenShots) {
            expect(browser.pixdiff.saveRegion(page.horizontalButtonsArea, 'mainPage_mainMenu_chairperson_avc')).not.toBe(null);
        }
        if (testScreenShots) {
            expect(browser.pixdiff.checkRegion(page.horizontalButtonsArea, 'mainPage_mainMenu_chairperson_avc')).toMatch();
        }
    });

    // recording is not always available, check before enabling this
    //it('can click on record button', function () {
    //    expect(page.recordButton.getAttribute('class')).not.toContain('record-active');
    //    page.recordButton.click();
    //    browser.wait(function() {
    //        return page.recordButton.getAttribute('class')
    //            .then(function(value) {
    //                //logger.debug(value);
    //                return value.indexOf('record-active') !== -1;
    //            });
    //    }, 3500);
    //    expect(page.recordButton.getAttribute('class')).toContain('record-active');
    //});
});

describe('as a participant, main page object works as expected with audio & video', function () {
    var user, page;

    beforeEach(function (done) {
        user = new MEAUser(presenterInfo, meetingInfo, browser);
        return user.goToMainPage()
            .then(function() {
                page = user.mainPage;
                done();
            });
    });

    it('can take us to the main page', function () {
        expect(browser.getLocationAbsUrl()).toContain('/main');
    });

    it('has the main menu icons we expect to have', function () {
        if (saveScreenShots) {
            expect(browser.pixdiff.saveRegion(page.horizontalButtonsArea, 'mainPage_mainMenu_presenter_avc')).not.toBe(null);
        }
        if (testScreenShots) {
            expect(browser.pixdiff.checkRegion(page.horizontalButtonsArea, 'mainPage_mainMenu_presenter_avc')).toMatch();
        }
    });

    it('can click on content menu', function () {
        expect(page.contentButton.evaluate('contentVisible')).toBe(false);
        page.contentButton.click();
        expect(page.contentButton.evaluate('contentVisible')).toBe(true);
    });

    it('can click on main menu buttons', function () {
        expect(page.micButton.evaluate('toggleMicButton')).toBe(false);
        page.micButton.click();
        expect(page.micButton.evaluate('toggleMicButton')).toBe(true);
        expect(page.videoButton.evaluate('toggleVideoButton')).toBe(false);
        page.videoButton.click();
        expect(page.videoButton.evaluate('toggleVideoButton')).toBe(true);
        expect(page.speakerButton.evaluate('toggleVolumeButton')).toBe(false);
        page.speakerButton.click();
        expect(page.speakerButton.evaluate('toggleVolumeButton')).toBe(true);
        expect(page.selfViewButton.evaluate('toggleSelfViewButton')).toBe(true);
        page.selfViewButton.click();
        expect(page.selfViewButton.evaluate('toggleSelfViewButton')).toBe(false);

        if (saveScreenShots) {
            expect(browser.pixdiff.saveRegion(page.horizontalButtonsArea, 'mainPage_mainMenu_toggled_presenter_avc')).not.toBe(null);
        }
        if (testScreenShots) {
            expect(browser.pixdiff.checkRegion(page.horizontalButtonsArea, 'mainPage_mainMenu_toggled_presenter_avc')).toMatch();
        }
    });

    it('can click on end button ', function () {
        expect(page.endMeetingPanel.evaluate('isEndMeeting')).toBe(null);
        page.endMeetingButton.click();
        expect(page.endMeetingPanel.evaluate('isEndMeeting')).toBe(true);
    });

    xit('displays correct text on mouseOver', function () {
        expect(page.micButton.getAttribute('title')).toBe('Mute microphone');
        //TODO: DEV, fix this
        expect(page.videoButton.getAttribute('title')).toBe('Mute video');
        expect(page.speakerButton.getAttribute('title')).toBe('Mute speaker');
        //TODO: DEV, fix this
        expect(page.selfViewButton.getAttribute('title')).toBe('turn off Self View');

        page.micButton.click();
        page.videoButton.click();
        page.speakerButton.click();
        page.selfViewButton.click();

        expect(page.micButton.getAttribute('title')).toBe('Unmute microphone');
        //TODO: DEV, fix this
        expect(page.videoButton.getAttribute('title')).toBe('Video');
        expect(page.speakerButton.getAttribute('title')).toBe('Unmute speaker');
        //TODO: Is this bug?
        expect(page.selfViewButton.getAttribute('title')).toBe('Self View');
    }, "Fix mouse over text");
});


