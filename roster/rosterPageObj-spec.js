var nconf        = require('nconf'),
    Promise      = require('bluebird'),
    loginHelpers = require('../helpers/loginHelpers'),
    th           = require('../helpers/testHelpers');

nconf.file('test', 'conf.json');
nconf.file('permission', '../permissions.json');
nconf.load();

// Authenticated Users
var authUser1Info = nconf.get("test_config").users.authenticated[0],
    authUser2Info = nconf.get("test_config").users.authenticated[1],
    authUser3Info = nconf.get("test_config").users.authenticated[2];

// Guest Users
var guest1Info = nconf.get("test_config").users.guest[0],
    guest2Info = nconf.get("test_config").users.guest[1],
    guest3Info = nconf.get("test_config").users.guest[2];

// spec.js
// test if the chairperson can drop other users from the meeting
describe('chairperson works as expected', function () {
    var users, userArgs, originalTimeout, meeting;

    beforeEach(function () {
        users = [];
        userArgs = [authUser1Info, authUser2Info, guest1Info];
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 3 * 60 * 1000;
    });

    afterEach(function (done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        authUser1Info  = nconf.get("test_config").users.authenticated[0];
        authUser2Info = nconf.get("test_config").users.authenticated[1];
        th.tearDown(users).nodeify(done);
    });

    it('can drop participant and guest from the meeting', function (done) {
        loginHelpers.createAdHocMeeting(authUser1Info).then(
            function (result) {
                meeting = { id: result.presentedId };
                return th.userSetUp(users, userArgs, meeting, 3);
            }
        ).then(
            function () {
                return users[0].dropAttendee(users[1].getRosterDisplayName());
            }
        ).then(
            function () {
                return users[0].dropAttendee(users[2].getRosterDisplayName());
            }
        ).then(
            function () {
                done();
            }
        ).catch(
            function (error) {
                expect(error).toBe(' NO ERROR');
            }
        );
    });
});

// test if the 1st chairperson can change the roles of other users and drop the 2nd chairperson from the meeting
describe('chairperson works as expected', function () {
    var users, userArgs, originalTimeout, meeting;

    beforeEach(function () {
        users = [];
        userArgs = [authUser1Info, authUser2Info, guest1Info];
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 3 * 60 * 1000;
    });

    afterEach(function(done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        authUser1Info  = nconf.get("test_config").users.authenticated[0];
        authUser2Info = nconf.get("test_config").users.authenticated[1];
        th.tearDown(users).nodeify(done);
    });

    it('can promote user: participant -> 2nd chairperson, and drop 2nd chairperson from the meeting ', function (done) {
        loginHelpers.createAdHocMeeting(authUser1Info).then(
            function (result) {
                meeting = {id: result.presentedId};
                return th.userSetUp(users, userArgs, meeting, 3);
            }
        ).then(
            function () {
                return th.changeRoleAndConfirm(users[0], users[1], users[2], 'chairperson');
            }
        ).then(
            function () {
                return users[0].dropAttendee(users[1].getRosterDisplayName());
            }
        ).then(
            function () {
                done();
            }
        ).catch(
            function (error) {
                expect(error).toBe(' NO ERROR');
            }
        );
    });

    it('can promote user: guest -> participant -> 2nd chairperson, and demote user: 2nd chairperson -> participant -> guest', function (done) {
        loginHelpers.createAdHocMeeting(authUser2Info).then(
            function (result) {
                meeting = {id: result.presentedId};
                return th.userSetUp(users, userArgs, meeting, 3);
            }
        ).then(
            function () {
                return th.changeRoleAndConfirm(users[1], users[2], users[0], 'participant');
            }
        ).then(
            function () {
                return th.changeRoleAndConfirm(users[1], users[2], users[0], 'chairperson');
            }
        ).then(
            function () {
                return th.changeRoleAndConfirm(users[1], users[2], users[0], 'participant');
            }
        ).then(
            function () {
                return th.changeRoleAndConfirm(users[1], users[2], users[0], 'guest');
            }
        ).then(
            function () {
                done();
            }
        ).catch(
            function (error) {
                expect(error).toBe(' NO ERROR');
            }
        );
    });
});

describe('the 2nd chairperson works as expected', function () {
    var userArgs, users, originalTimeout, meeting;

    beforeEach(function () {
        users = [];
        userArgs = [authUser1Info, guest1Info, guest2Info];
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL =  5 * 60 * 1000;
    });

    afterEach(function (done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        authUser1Info  = nconf.get("test_config").users.authenticated[0];
        th.tearDown(users).nodeify(done);
    });

    it('can drop the original chairperson from the meeting', function (done) {
        loginHelpers.createAdHocMeeting(authUser1Info).then(
            function (result) {
                meeting = {id: result.presentedId};
                return th.userSetUp(users, userArgs, meeting, 3);
            }
        ).then(
            function () {
                return th.changeRoleAndConfirm(users[0], users[1], users[2], 'chairperson');
            }
        ).then(
            function () {
                return users[1].dropAttendee(users[0].getRosterDisplayName());
            }
        ).then(
            function () {
                done();
            }
        ).catch(
            function (error) {
                expect(error).toBe(' NO ERROR');
            }
        );

    });

    it('can change the role of other users, including the original chairperson and drop them from the meeting', function (done) {
        loginHelpers.createAdHocMeeting(authUser1Info).then(
            function (result) {
                meeting = {id: result.presentedId};
                return th.userSetUp(users, userArgs, meeting, 3);
            }
        ).then(
            function () {
                return th.changeRoleAndConfirm(users[0], users[1], users[2], 'chairperson');
            }
        ).then(
            function () {
                return th.changeRoleAndConfirm(users[1], users[0], users[2], 'participant');
            }
        ).then(
            function () {
                return th.changeRoleAndConfirm(users[1], users[0], users[2], 'guest');
            }
        ).then(
            function () {
                return th.changeRoleAndConfirm(users[1], users[0], users[2], 'participant');
            }
        ).then(
            function () {
                return th.changeRoleAndConfirm(users[1], users[0], users[2], 'chairperson');
            }
        ).then(
            function () {
                return th.changeRoleAndConfirm(users[1], users[2], users[0], 'participant');
            }
        ).then(
            function () {
                return th.changeRoleAndConfirm(users[1], users[2], users[0], 'chairperson');
            }
        ).then(
            function () {
                return th.changeRoleAndConfirm(users[1], users[2], users[0], 'participant');
            }
        ).then(
            function () {
                return th.changeRoleAndConfirm(users[1], users[2], users[0], 'guest');
            }
        ).then(
            function () {
                return users[1].dropAttendee(users[0].getRosterDisplayName());
            }
        ).then(
            function () {
                return users[1].dropAttendee(users[2].getRosterDisplayName());
            }
        ).then(
            function () {
                done();
            }
        ).catch(
            function (error) {
                expect(error).toBe(' NO ERROR');
            }
        );

    });
});

describe("roster page works as expected", function () {
    var userArgs, users, originalTimeout, meeting, roster;

    beforeEach(function () {
        users = [];
        userArgs = [authUser3Info, authUser2Info, guest1Info, guest2Info];
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL =  3 * 60 * 1000;
    });

    afterEach(function (done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        authUser2Info = nconf.get("test_config").users.authenticated[1];
        authUser3Info = nconf.get("test_config").users.authenticated[2];
        th.tearDown(users).nodeify(done);
    });

    it('can click all groups heading, show correct total attendee count and correct group title Info', function (done) {
        loginHelpers.createAdHocMeeting(authUser3Info).then(
            function (result) {
                meeting = {id: result.presentedId};
                return th.userSetUp(users, userArgs, meeting, 4);
            }
        ).then(
            function () {
                roster = users[0].getRosterPage();
                expect(roster.rosterItems.count()).toBe(roster.getAttendeeCount());
                return roster.chairPersonsPanel.getAttribute('class');
            }
        ).then(
            function (result) {
                expect(result).toContain('open-panel');
                return roster.chairPersonsButton.click();
            }
        ).then(
            function () {
                return roster.chairPersonsPanel.getAttribute('class');
            }
        ).then(
            function (result) {
                expect(result).toContain('close-panel');
                roster.chairPersonsButton.click();
                return roster.participantsPanel.getAttribute('class');
            }
        ).then(
            function (result) {
                expect(result).toContain('open-panel');
                return roster.participantsButton.click();
            }
        ).then(
            function () {
                return roster.participantsPanel.getAttribute('class');
            }
        ).then(
            function (result) {
                expect(result).toContain('close-panel');
                return roster.participantsButton.click();
            }
        ).then(
            function () {
                return roster.guestsPanel.getAttribute('class');
            }
        ).then(
            function (result) {
                expect(result).toContain('open-panel');
                return roster.guestsButton.click();
            }
        ).then(
            function () {
                return roster.guestsPanel.getAttribute('class');
            }
        ).then(
            function (result) {
                expect(result).toContain('close-panel');
                expect(roster.expectedGuestsTitle.getText()).toEqual(roster.expectedGuestsTitle.getText());
                return roster.guestsButton.click();
            }
        ).then(
            function () {
                return users[0].dropAttendee(users[2].getRosterDisplayName());
            }
        ).then(
            function () {
                expect(roster.rosterItems.count()).toBe(roster.getAttendeeCount());
                expect(roster.expectedGuestsTitle.getText()).toEqual(roster.expectedGuestsTitle.getText());
                return Promise.resolve();
            }
        ).then(
            function () {
                done();
            }
        ).catch(
            function (error) {
                expect(error).toBe(' NO ERROR');
            }
        );
    });
});
// test if the guest can make a request for sharing content and the chairperson can respond to the request
describe('the chairperson and guests work as expected', function () {
    var userArgs, users, originalTimeout, meeting;

    beforeEach(function () {
        users = [];
        userArgs = [authUser1Info, guest1Info, authUser2Info];
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 3 * 60 * 1000;
    });

    afterEach(function (done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        authUser1Info  = nconf.get("test_config").users.authenticated[0];
        th.tearDown(users).nodeify(done);
    });

    it('guest can make a request for sharing content and chairperson can ignore it', function (done) {
        loginHelpers.createAdHocMeeting(authUser1Info).then(
            function (result) {
                meeting = {id: result.presentedId};
                return th.userSetUp(users, userArgs, meeting, 3);
            }
        ).then(
            function () {
                expect(users[1].mainPage.sideMenu.roster.guestReguestPanel.getText()).toBe('To share content, click to ask for Presentation Rights');
                return users[1].makeARequest();
            }
        ).then(
            function () {
                browser.sleep(1000);
                expect(users[1].mainPage.sideMenu.roster.guestReguestPanel.getText()).toBe('Request sent. Please wait.');
                return users[0].responseToRequest(false);
            }
        ).then(
            function () {
                browser.sleep(1000);
                expect(users[1].mainPage.sideMenu.roster.guestReguestPanel.getText()).toBe('Request denied');
                return Promise.resolve();
            }
        ).then(
            function () {
                done();
            }
        ).catch(
            function (error) {
                expect(error).toBe(' NO ERROR');
            }
        );
    });

    it('guest can make a request for sharing content and chairperson can allow it', function (done) {
        loginHelpers.createAdHocMeeting(authUser1Info).then(
            function (result) {
                meeting = {id: result.presentedId};
                return th.userSetUp(users, userArgs, meeting, 3);
            }
        ).then(
            function () {
                expect(users[1].mainPage.sideMenu.roster.guestReguestPanel.getText()).toBe('To share content, click to ask for Presentation Rights');
                return users[1].makeARequest();
            }
        ).then(
            function () {
                browser.sleep(1000);
                expect(users[1].mainPage.sideMenu.roster.guestReguestPanel.getText()).toBe('Request sent. Please wait.');
                return users[0].responseToRequest(true);
            }
        ).then(
            function () {
                return users[2].getAttendeeRole(users[1].getRosterDisplayName());
            }
        ).then(
            function (result) {
                expect(result).toBe('participant');
                return users[0].getAttendeeRole(users[1].getRosterDisplayName());
            }
        ).then(
            function (result) {
                expect(result).toBe('participant');
                return Promise.resolve();
            }
        ).then(
            function () {
                done();
            }
        ).catch(
            function (error) {
                expect(error).toBe(' NO ERROR');
            }
        );
    });

    it('the demoted guest can make a request for sharing content and chairperson can ignore it', function (done) {
        loginHelpers.createAdHocMeeting(authUser1Info).then(
            function (result) {
                meeting = {id: result.presentedId};
                return th.userSetUp(users, userArgs, meeting, 3);
            }
        ).then(
            function () {
                return th.changeRoleAndConfirm(users[0], users[2], users[1], 'guest');
            }
        ).then(
            function () {
                expect(users[2].mainPage.sideMenu.roster.guestReguestPanel.getText()).toBe('To share content, click to ask for Presentation Rights');
                return users[2].makeARequest();
            }
        ).then(
            function () {
                browser.sleep(1000);
                expect(users[2].mainPage.sideMenu.roster.guestReguestPanel.getText()).toBe('Request sent. Please wait.');
                return users[0].responseToRequest(false);
            }
        ).then(
            function () {
                browser.sleep(1000);
                expect(users[2].mainPage.sideMenu.roster.guestReguestPanel.getText()).toBe('Request denied');
                return Promise.resolve();
            }
        ).then(
            function () {
                done();
            }
        ).catch(
            function (error) {
                expect(error).toBe(' NO ERROR');
            }
        );
    });

    it('the demoted guest can make a request for sharing content and chairperson can allow it', function (done) {
        loginHelpers.createAdHocMeeting(authUser1Info).then(
            function (result) {
                meeting = {id: result.presentedId};
                return th.userSetUp(users, userArgs, meeting, 3);
            }
        ).then(
            function () {
                return th.changeRoleAndConfirm(users[0], users[2], users[1], 'guest');
            }
        ).then(
            function () {
                expect(users[2].mainPage.sideMenu.roster.guestReguestPanel.getText()).toBe('To share content, click to ask for Presentation Rights');
                return users[2].makeARequest();
            }
        ).then(
            function () {
                browser.sleep(1000);
                expect(users[2].mainPage.sideMenu.roster.guestReguestPanel.getText()).toBe('Request sent. Please wait.');
                return users[0].responseToRequest(true);
            }
        ).then(
            function () {
                return users[1].getAttendeeRole(users[2].getRosterDisplayName());
            }
        ).then(
            function (result) {
                expect(result).toBe('participant');
                return users[0].getAttendeeRole(users[2].getRosterDisplayName());
            }
        ).then(
            function (result) {
                expect(result).toBe('participant');
                return Promise.resolve();
            }
        ).then(
            function () {
                done();
            }
        ).catch(
            function (error) {
                expect(error).toBe(' NO ERROR');
            }
        );
    });
});
// test if the guest can make a request for sharing content and the 2nd chairperson can respond to the request
describe('the 2nd chairperson and guests work as expected', function () {
    var userArgs, users, originalTimeout, meeting;

    beforeEach(function () {
        userArgs = [authUser1Info, guest2Info, guest3Info];
        users = [];
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 3 * 60 * 1000;
    });

    afterEach(function (done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        authUser1Info  = nconf.get("test_config").users.authenticated[0];
        guest1Info = nconf.get("test_config").users.guest[0];
        guest2Info = nconf.get("test_config").users.guest[1];
        guest3Info = nconf.get("test_config").users.guest[2];
        th.tearDown(users).nodeify(done);
    });

    it('guest can make a request for sharing content and the 2nd chairperson can ignore it', function (done) {
        loginHelpers.createAdHocMeeting(authUser1Info).then(
            function (result) {
                meeting = {id: result.presentedId};
                return th.userSetUp(users, userArgs, meeting, 3);
            }
        ).then(
            function () {
                return th.changeRoleAndConfirm(users[0], users[2], users[1], 'chairperson');
            }
        ).then(
            function () {
                expect(users[1].mainPage.sideMenu.roster.guestReguestPanel.getText()).toBe('To share content, click to ask for Presentation Rights');
                return users[1].makeARequest();
            }
        ).then(
            function () {
                browser.sleep(1000);
                expect(users[1].mainPage.sideMenu.roster.guestReguestPanel.getText()).toBe('Request sent. Please wait.');
                return users[2].responseToRequest(false);
            }
        ).then(
            function () {
                browser.sleep(1000);
                expect(users[1].mainPage.sideMenu.roster.guestReguestPanel.getText()).toBe('Request denied');
                return done();
            }
        ).catch(
            function (error) {
                expect(error).toBe(' NO ERROR');
            }
        );
    });

    it('guest can make a request for sharing content and the 2nd chairperson can allow it', function (done) {
        loginHelpers.createAdHocMeeting(authUser1Info).then(
            function (result) {
                meeting = {id: result.presentedId};
                return th.userSetUp(users, userArgs, meeting, 3);
            }
        ).then(
            function () {
                return th.changeRoleAndConfirm(users[0], users[2], users[1], 'chairperson');
            }
        ).then(
            function () {
                expect(users[1].mainPage.sideMenu.roster.guestReguestPanel.getText()).toBe('To share content, click to ask for Presentation Rights');
                return users[1].makeARequest();
            }
        ).then(
            function () {
                browser.sleep(1000);
                expect(users[1].mainPage.sideMenu.roster.guestReguestPanel.getText()).toBe('Request sent. Please wait.');
                return users[2].responseToRequest(true);
            }
        ).then(
            function () {
                return users[2].getAttendeeRole(users[1].getRosterDisplayName());
            }
        ).then(
            function (result) {
                expect(result).toBe('participant');
                return users[0].getAttendeeRole(users[1].getRosterDisplayName());
            }
        ).then(
            function (result) {
                expect(result).toBe('participant');
                return done();
            }
        ).catch(
            function (error) {
                expect(error).toBe(' NO ERROR');
            }
        );
    });
});

describe('the chairperson works as we expected with audio & video', function () {
    var userArgs, users, originalTimeout, meeting;

    beforeEach(function () {
        users = [];
        userArgs = [authUser1Info, authUser2Info, guest3Info];
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 3 * 60 * 1000;
    });

    afterEach(function (done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        authUser1Info  = nconf.get("test_config").users.authenticated[0];
        authUser2Info = nconf.get("test_config").users.authenticated[1];
        th.tearDown(users).nodeify(done);
    });

    it('can mute and unmute all other attendees', function (done) {
        loginHelpers.createAdHocMeeting(authUser1Info).then(
            function (result) {
                meeting = {id: result.presentedId, avcEnabled: true};
                return th.userSetUp(users, userArgs, meeting, 3);
            }
        ).then(
            function () {
                return th.muteAllOtherAttendeesAndConfirm(users[0], users[1], users[2], true);
            }
        ).then(
            function () {
                return users[0].browser.sleep(1000);
            }
        ).then(
            function () {
                return th.muteAllOtherAttendeesAndConfirm(users[0], users[1], users[2], false);
            }
        ).then(
            function () {
                done();
            }
        ).catch(
            function (error) {
                expect(error).toBe(' NO ERROR');
            }
        );
    });

    it('can mute and umute attendee', function (done) {
        loginHelpers.createAdHocMeeting(authUser1Info).then(
            function (result) {
                meeting = {id: result.presentedId, avcEnabled: true};
                return th.userSetUp(users, userArgs, meeting, 3);
            }
        ).then(
            function () {
                return th.muteAttendeeAndConfirm(users[0], users[1], users[2], true);
            }
        ).then(
            function () {
                return users[0].mainPage.sideMenu.roster.escButton.click();
            }
        ).then(
            function () {
                return th.muteAttendeeAndConfirm(users[0], users[1], users[2], false);
            }
        ).then(
            function () {
                done();
            }
        ).catch(
            function (error) {
                expect(error).toBe(' NO ERROR');
            }
        );
    });
});