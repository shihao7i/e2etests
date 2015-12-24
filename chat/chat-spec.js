var Promise = require('bluebird'),
    nconf = require('nconf'),
    loginHelpers = require('../helpers/loginHelpers'),
    MEAUser = require('../helpers/userObj'),
    utils = require('../helpers/utils'),
    _ = require('lodash');

nconf.file('test', 'conf.json');
nconf.load();

var meaurl = loginHelpers.getMEAUrl(),
    authUser1Info = nconf.get("test_config").users.authenticated[0],
    authUser2Info = nconf.get("test_config").users.authenticated[1],
    presenterInfo = nconf.get("test_config").users.authenticated[2];

var meetingInfo = {avcEnabled: false};

var saveScreenShots = nconf.get("test_config").pixdiff.generate;
var testScreenShots = nconf.get("test_config").pixdiff.test;

describe('creating an ad-hoc meeting to join for chat', function () {
    it('creating adhoc meeting is successful', function(done) {
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

describe('2 users can chat', function() {
    var user1, user2;
    beforeEach(function(done) {
        var width = 1100,
            height = 825;
        var browser2 =  browser.forkNewDriverInstance();
        browser2.driver.manage().window().setSize(width, height);
        user1 = new MEAUser(authUser1Info, meetingInfo, browser);
        user2 = new MEAUser(authUser2Info, meetingInfo, browser2);
        Promise.all([user1.goToMainPage(), user2.goToMainPage()])
            .nodeify(done);
    });

    afterEach(function(done) {
        Promise.resolve(user2.browser.quit())
            .nodeify(done);
    });

    it('can login and exchange messages', function() {
        expect(user1.browser.getCurrentUrl()).toContain('#/main');
        expect(user2.browser.getCurrentUrl()).toContain('#/main');

        //user1.mainPage.sideMenu.chatButton.click();
        //user2.mainPage.sideMenu.chatButton.click();

        user1.selectMenu('Chat');
        user2.selectMenu('Chat');

        expect(user1.mainPage.getChatHistory().count()).toBe(0);
        expect(user2.mainPage.getChatHistory().count()).toBe(0);

        user1.mainPage.sideMenu.chat.sendMessage('hello');

        expect(user1.mainPage.getChatHistory().count()).toBe(1);
        expect(user2.mainPage.getChatHistory().count()).toBe(1);

        expect(user1.getMostRecentMessage()).toContain('hello');
        expect(user2.getMostRecentMessage()).toContain('hello');

        user2.mainPage.sideMenu.chat.sendMessage('hi');

        expect(user1.mainPage.getChatHistory().count()).toBe(2);
        expect(user2.mainPage.getChatHistory().count()).toBe(2);

        expect(user1.getMostRecentMessage()).toContain('hi');
        expect(user2.getMostRecentMessage()).toContain('hi');
    });

    it('can show badge notifications for missed chats', function() {
        user1.mainPage.sideMenu.rosterButton.click();
        user2.mainPage.sideMenu.chatButton.click();
        // chat badge should be hidden for user1
        expect(user1.mainPage.sideMenu.chat.badge.getAttribute('class')).toContain('ng-hide');
        // receiving a message should increment the badge count
        user2.mainPage.sideMenu.chat.sendMessage('hi');
        expect(user1.mainPage.sideMenu.chat.badge.getAttribute('class')).not.toContain('ng-hide');
        expect(user1.mainPage.sideMenu.chat.badgeCount.evaluate('item.notifications')).toBe(1);

        user2.mainPage.sideMenu.chat.sendMessage('hello!');
        expect(user1.mainPage.sideMenu.chat.badgeCount.evaluate('item.notifications')).toBe(2);
    });

    xit('can show header chat notifications for missed if no tabs are open', function() {
        // side Menu opens by default
        user2.mainPage.sideMenu.chatButton.click();
        var chat1 = user1.mainPage.sideMenu.chat;
        var chat2 = user2.mainPage.sideMenu.chat;
        // chat badge should be hidden for user1
        expect(chat1.notificationIndicator.getAttribute('class')).toContain('ng-hide');
        // receiving a message should increment the badge count
        chat2.sendMessage('hi');
        expect(chat1.notificationIndicator.getAttribute('class')).not.toContain('ng-hide');
        expect(chat1.notificationIndicator.evaluate('pendingChatNotifications')).toBe(1);

        chat2.sendMessage('hello!');
        expect(chat1.notificationIndicator.evaluate('pendingChatNotifications')).toBe(2);

        // clicking on indicator takes the user to the chat menu
        expect(user1.mainPage.sideMenu.chatButton.getAttribute('class')).not.toContain('active');
        chat1.notificationIndicator.click();
        expect(user1.mainPage.sideMenu.chatButton.getAttribute('class')).toContain('active');
    });

    it('chat persists through rejoin', function() {
        user1.mainPage.sideMenu.chatButton.click();
        user2.mainPage.sideMenu.chatButton.click();

        expect(user1.mainPage.getChatHistory().count()).not.toBe(0);
        expect(user2.mainPage.getChatHistory().count()).not.toBe(0);
    });
});