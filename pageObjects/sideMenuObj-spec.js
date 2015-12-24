var Promise      = require('bluebird'),
    nconf        = require('nconf'),
    loginHelpers = require('../helpers/loginHelpers'),
    MEAUser      = require('../helpers/userObj'),
    _            = require('lodash'),
    utils        = require('../helpers/utils');

nconf.file('test', 'conf.json');
nconf.load();

var meaurl = loginHelpers.getMEAUrl(),
    authUserInfo  = nconf.get("test_config").users.authenticated[0],
    presenterInfo = nconf.get("test_config").users.authenticated[1];

var meetingInfo = {avcEnabled: true};

var saveScreenShots = nconf.get("test_config").pixdiff.generate,
    testScreenShots = nconf.get("test_config").pixdiff.test;

describe('creating an ad-hoc meeting to test side menu', function () {
    it('creating adhoc meeting is successful', function(done) {
        loginHelpers.createAdHocMeeting(authUserInfo)
            .then(function (result) {
                //logger.debug('Meeting Info', result);
                meetingInfo.startTime = result.startTime;
                meetingInfo.id = result.presentedId;
                logger.debug('Ad-Hoc meeting id = ' + meetingInfo.id);
                expect(meetingInfo.id).not.toBe(undefined);
                done();
            });
    });
});

describe('side menu page object works as expected for participant', function() {
    var user, menu, page;

    beforeEach(function (done) {
        user = new MEAUser(presenterInfo, meetingInfo, browser);
        return user.goToMainPage()
            .then(function() {
                page = user.mainPage;
                menu = page.sideMenu;
                done();
            });
    });

    it('has the UI we expect it to have', function () {
        if (saveScreenShots) {
            expect(browser.pixdiff.saveRegion(menu.menuItemsArea, 'sideMenu_menuItems')).not.toBe(null);
        }
        if (testScreenShots) {
            expect(browser.pixdiff.checkRegion(menu.menuItemsArea, 'sideMenu_menuItems')).toMatch();
        }
        //browser.pause();
    });

    //it('roster is open by default', function () {
    //    expect(menu.rosterButton.getAttribute('class')).toContain('active');
    //});

    it('can interact with other side menu buttons', function() {
        menu.rosterButton.click(); // roster panel is open by default, click roster button will close roster panel
        expect(menu.rosterButton.getAttribute('class')).not.toContain('active');

        expect(menu.chatButton.getAttribute('class')).not.toContain('active');
        menu.chatButton.click();
        expect(menu.chatButton.getAttribute('class')).toContain('active');

        expect(menu.settingsButton.getAttribute('class')).not.toContain('active');
        menu.settingsButton.click();
        expect(menu.settingsButton.getAttribute('class')).toContain('active');
    });

    it('help button launches help', function(done) {
        var newWindowHandle, windowHandles;
        Promise.resolve(menu.helpButton.click())
            .then(function () {
                return browser.wait(function() {
                    logger.debug('waiting for help window to open ...');
                    return browser.getAllWindowHandles().then(function(handles) {
                       return handles.length === 2;
                    });
                }, 5000);
            })
            .then(function () {
                return browser.getAllWindowHandles();
            })
            .then(function (handles) {
                windowHandles = handles;
                expect(handles.length).toBe(2);
                newWindowHandle = handles[1];
                logger.debug('Window handles = ' + windowHandles);
                return browser.switchTo().window(newWindowHandle);
            })
            .then(function () {
                var helpUrl = 'http://';
                expect(browser.driver.getCurrentUrl()).toContain(helpUrl);
                return Promise.join(
                    browser.driver.close(),
                    browser.switchTo().window(windowHandles[0])
                );
            })
            .nodeify(done);
    });

    //// TODO: this test is broken. There is no dial pad button.
    //it('can click on dial pad button', function() {
    //    setUp(user).then(function(){
    //        sideMenuPage.dialPadButton.getAttribute('class').then(function(attrValue) {
    //            expect(attrValue).not.toContain('active');
    //        });
    //        sideMenuPage.dialPadButton.click();
    //        sideMenuPage.dialPadButton.getAttribute('class').then(function (attrValue) {
    //            expect(attrValue).toContain('active');
    //        });
    //        return Promise.resolve();
    //    });
    //});

});

describe('side menu page object works as expected for chairperson', function() {
    var user, menu, page;

    //beforeEach(function (done) {
    //    user = new MEAUser(authUserInfo, meetingObj, browser);
    //    user.goToMainPage()
    //        .then(function() {
    //            page = user.mainPage;
    //            menu = page.sideMenu;
    //            done();
    //        });
    //});

    beforeEach(function (done) {
        user = new MEAUser(authUserInfo, meetingInfo, browser);
        return user.goToMainPage()
            .then(function() {
                page = user.mainPage;
                menu = page.sideMenu;
                done();
            });
    });

    it('has the UI we expect it to have', function () {
        if (saveScreenShots) {
            expect(browser.pixdiff.saveRegion(menu.menuItemsArea, 'sideMenuPage_chairperson_menuItems')).not.toBe(null);
        }
        if (testScreenShots) {
            expect(browser.pixdiff.checkRegion(menu.menuItemsArea, 'sideMenuPage_chairperson_menuItems')).toMatch();
        }
    });

    it('can interact with other side menu buttons', function() {
        menu.rosterButton.click(); // roster panel is open by default, click roster button will close roster panel
        expect(menu.rosterButton.getAttribute('class')).not.toContain('active');

        expect(menu.chatButton.getAttribute('class')).not.toContain('active');
        menu.chatButton.click();
        expect(menu.chatButton.getAttribute('class')).toContain('active');

        expect(menu.settingsButton.getAttribute('class')).not.toContain('active');
        menu.settingsButton.click();
        expect(menu.settingsButton.getAttribute('class')).toContain('active');

        expect(menu.addParticipantButton.getAttribute('class')).not.toContain('active');
        menu.addParticipantButton.click();
        expect(menu.addParticipantButton.getAttribute('class')).toContain('active');

    });

    it('has link to the meeting to send to others', function () {
        menu.addParticipantButton.click();
        var text = 'Link to Join the Meeting: ' + loginHelpers.getMEAUrl() + '/' + meetingInfo.id;
        logger.debug(text);
        expect(menu.addParticipantHelper.getLinkToJoinMeeting()).toContain(text);
    });

    it('can get more information', function() {
        menu.addParticipantButton.click();
        menu.otherDetailsButton.click();
        expect(menu.otherDetailsPanel.getAttribute('class')).toContain('open-panel');
    });


});

