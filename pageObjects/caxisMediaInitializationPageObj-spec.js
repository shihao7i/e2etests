var nconf = require('nconf'),
    loginHelpers = require('../helpers/loginHelpers'),
    MEAUser = require('../helpers/userObj'),
    _ = require('lodash'),
    utils = require('../helpers/utils');

nconf.file('test', 'conf.json');
nconf.load();

var meaurl = loginHelpers.getMEAUrl(),
    authUserInfo = nconf.get("test_config").users.authenticated[0],
    presenterInfo = nconf.get("test_config").users.authenticated[1],
    guestUserInfo = nconf.get("test_config").users.guest[0];

var meetingInfo = {avcEnabled: true};

var saveScreenShots = nconf.get("test_config").pixdiff.generate,
    testScreenShots = nconf.get("test_config").pixdiff.test;

describe('creating an ad-hoc meeting to join as a chairperson', function () {
    it('creating adhoc meeting is successful', function (done) {
        loginHelpers.createAdHocMeeting(authUserInfo)
            .then(function (result) {
                meetingInfo.id = result.presentedId;
                logger.debug('Ad-Hoc meeting id = ' + meetingInfo.id);
                //logger.debug(result);
                expect(meetingInfo.id).not.toBe(undefined);
                done();
            });
    });
});

// spec.js
describe('can use the caxis media initialization page object', function () {
    var user, page;

    beforeEach(function (done) {
        user = new MEAUser(guestUserInfo, meetingInfo, browser);
        user.goToMediaInitPage()
            .then(function () {
                page = user.mediaInitPage;
                done();
            });
    });

    it('can take us to the caxisMediaInitialization page', function () {
        expect(browser.getCurrentUrl()).toContain('/caxisMediaInitialization');
    });

    it('has the UI we expect it to have', function () {
        if (saveScreenShots) {
            expect(browser.pixdiff.saveScreen('mediainitpage')).not.toBeNull();
        }
        if (testScreenShots) {
            var blockOut = page.getVideoPreviewCoordinates();
            expect(browser.pixdiff.checkScreen('mediainitpage'),
                {blockOut: blockOut}).toBeTruthy();
        }
    });

    it('can click on all the buttons', function () {
        expect(page.cameraButton.evaluate('toggleVideoButton')).toBe(false);
        expect(page.micButton.evaluate('toggleMicButton')).toBe(false);
        expect(page.speakersButton.evaluate('toggleVolumeButton')).toBe(false);

        page.cameraButton.click();
        page.micButton.click();
        page.speakersButton.click();

        expect(page.cameraButton.evaluate('toggleVideoButton')).toBe(true);
        expect(page.micButton.evaluate('toggleMicButton')).toBe(true);
        expect(page.speakersButton.evaluate('toggleVolumeButton')).toBe(true);


        // TODO: does not work in firefox
        // TODO: mediaInitPage.getVideoPreviewCoordinates() crashes: Cannot read property 'top' of null
        //var blockOut = mediaInitPage.getVideoPreviewCoordinates();
        //expect(browser.pixdiff.checkScreen('mediainitpage_alltoggled'), {blockOut:blockOut}).toBeTruthy();
        //expect(mediaInitPage.cameraButton.evaluate('toggleVideoButton')).toBe(true);
    });


    xit('displays correct text on mouseOver', function () {
        expect(page.cameraButton.getAttribute('title')).toBe('Mute video');
        expect(page.micButton.getAttribute('title')).toBe('Mute microphone');
        expect(page.speakersButton.getAttribute('title')).toBe('Mute speaker');

        page.cameraButton.click();
        page.micButton.click();
        page.speakersButton.click();

        expect(page.cameraButton.getAttribute('title')).toBe('Unmute video');
        expect(page.micButton.getAttribute('title')).toBe('Unmute microphone');
        expect(page.speakersButton.getAttribute('title')).toBe('Unmute speaker');
    }, "Has wrong text, dev needs to fix!");

    // TODO: - Failed: - Expected 'https://devtest-mea-latest.cloudax.is:8443/#/caxisMediaInitialization' to contain '/login'.
    //xit('goes back to the login screen on cancel button', function() {
    //    //mediaInitPage.cancelButton.click();
    //    utils.clickIfDisplayed(mediaInitPage.cancelButton);
    //    expect(browser.getLocationAbsUrl()).toContain('/login');
    //});

    // TODO:
    it('goes to the main screen on continue button', function () {
        page.continueButton.click();
        loginHelpers.waitForUrlToChangeTo(/main/, browser);
    });


});