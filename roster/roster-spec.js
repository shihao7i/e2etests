/*jshint loopfunc: true */

var Promise = require('bluebird'),
    nconf = require('nconf'),
    loginHelpers = require('../helpers/loginHelpers'),
    MEAUser = require('../helpers/userObj'),
    utils = require('../helpers/utils');
var _ = require('lodash');

nconf.file('test', 'conf.json');
nconf.load();

var meaurl = loginHelpers.getMEAUrl(),
    authUser1Info = nconf.get("test_config").users.authenticated[0],
    authUser2Info = nconf.get("test_config").users.authenticated[1],
    presenterInfo = nconf.get("test_config").users.authenticated[1],
    guestUserInfo = nconf.get("test_config").users.guest[0];

var meetingInfo = {avcEnabled: false};

var saveScreenShots = nconf.get("test_config").pixdiff.generate;
var testScreenShots = nconf.get("test_config").pixdiff.test;

xdescribe('creating an ad-hoc meeting to join for roster feature test', function () {
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

xdescribe('roster features work', function() {
    for(var i = 0; i < 1; i++) {
        (function (j) {
            describe('testing avc && non-avc modes', function () {
                var avcEnabled = j !== 0;
                beforeEach(function(done) {
                    var meeting = {
                        id: meetingInfo.id,
                        avcEnabled: avcEnabled
                    };
                    logger.debug('testing roster functionality in mode', meeting);
                    this.chair = new MEAUser(authUser1Info, meeting, browser);
                    this.p1 = new MEAUser(authUser2Info, meeting, browser.forkNewDriverInstance());
                    this.p2 = new MEAUser(guestUserInfo, meeting, browser.forkNewDriverInstance());
                    this.name1 = this.p1.getRosterDisplayName();
                    this.name2 = this.p2.getRosterDisplayName();
                    Promise.all([this.chair.goToMainPage(), this.p1.goToMainPage(), this.p2.goToMainPage()])
                        .nodeify(done);
                });

                afterEach(function(done) {
                   Promise.all([this.p1.browser.quit(), this.p2.browser.quit()])
                       .nodeify(done);
                });

                it('chair can see other users', function () {
                    expect(this.chair.userIsPresent(this.name1)).toBe(true);
                    expect(this.chair.userIsPresent(this.name2)).toBe(true);
                    expect(this.chair.getAttendeeRole(this.name1)).toBe('participant');
                    expect(this.chair.getAttendeeRole(this.name2)).toBe('guest');
                });

                it('chair can demote other users', function() {
                    this.chair.changeAttendeeRole(this.name1, 'guest');
                    expect(this.chair.getAttendeeRole(this.name1)).toBe('guest');
                    expect(this.p2.getAttendeeRole(this.name1)).toBe('guest');
                    expect(this.p1.getRole()).toBe('guest');
                });

                it('chair can promote other users', function() {
                    this.chair.changeAttendeeRole(this.name1, 'chairperson');
                    expect(this.chair.getAttendeeRole(this.name1)).toBe('chairperson');
                    expect(this.p1.getRole()).toBe('chairperson');
                    expect(this.p2.getAttendeeRole(this.name1)).toBe('chairperson');
                });

                it('chair can drop other users', function() {
                    expect(this.chair.userIsPresent(this.name1)).toBe(true);
                    expect(this.p2.userIsPresent(this.name1)).toBe(true);
                    this.chair.dropAttendee(this.name1);
                    expect(this.chair.userIsPresent(this.name1)).toBe(false);
                    expect(this.p2.userIsPresent(this.name1)).toBe(false);
                    // TODO: check if p1 is in end meeting screen
                });

            });
        })(i);
    }
});
