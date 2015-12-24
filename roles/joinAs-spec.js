var nconf = require('nconf'),
    MEALoginPage = require('../pageObjects/loginPageObj'),
    MEAUser = require('../helpers/userObj'),
    encryption = require('plcm-encryption'),
    loginHelpers = require('../helpers/loginHelpers');

var Promise = require('bluebird');

var utils = require('../helpers/utils');

nconf.file('test', 'conf.json');
nconf.file('permission', '../permissions.json');
nconf.load();

var meaurl = loginHelpers.getMEAUrl(),
    authUserInfo = nconf.get("test_config").users.authenticated[0],
    presenterInfo = nconf.get("test_config").users.authenticated[1],
    guestInfo = nconf.get("test_config").users.guest[0];

var meetingInfo = {avcEnabled: false};

var saveScreenShots = nconf.get("test_config").pixdiff.generate;
var testScreenShots = nconf.get("test_config").pixdiff.test;

describe('creating an ad-hoc meeting to test role assignment', function () {
    it('creating adhoc meeting is successful', function (done) {
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

describe('we join with the correct role', function () {

    it('UnauthenticatedUsersJoinAs works as expected', function (done) {
        var user = new MEAUser(guestInfo, meetingInfo, browser);
        user.goToMainPage()
            .then(function () {
                return user.getRole();
            })
            .then(function (role) {
                var expectedRole = nconf.get('RoleAssignment').UnauthenticatedUsersJoinAs.toLowerCase();
                if (role.toLowerCase() === expectedRole) {
                    done();
                } else {
                    done.fail("Role assignment incorrect, expected " + expectedRole + " got " + role);
                }
            });
    });

    it('HostJoinsAs works as expected', function (done) {
        var user = new MEAUser(authUserInfo, meetingInfo, browser);
        user.goToMainPage()
            .then(function () {
                return user.getRole();
            })
            .then(function (role) {
                var expectedRole = nconf.get('RoleAssignment').HostJoinsAs.toLowerCase();
                if (role.toLowerCase() === expectedRole) {
                    done();
                } else {
                    done.fail("Role assignment incorrect, expected " + expectedRole + " got " + role);
                }
            });
    });

    it('UsersSharingHostDomainJoinAs works as expected', function (done) {
        var user = new MEAUser(presenterInfo, meetingInfo, browser);
        user.goToMainPage()
            .then(function () {
                return user.getRole();
            })
            .then(function (role) {
                var expectedRole = nconf.get('RoleAssignment').UsersSharingHostDomainJoinAs.toLowerCase();
                if (role.toLowerCase() === expectedRole) {
                    done();
                } else {
                    done.fail("Role assignment incorrect, expected " + expectedRole + " got " + role);
                }
            });
    });

});