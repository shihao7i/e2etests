/*jshint loopfunc: true */
var Promise = require('bluebird'),
    nconf = require('nconf'),
    loginHelpers = require('../../helpers/loginHelpers'),
    MEAUser = require('../../helpers/userObj'),
    utils = require('../../helpers/utils'),
    _ = require('lodash'),
    EmbeddedUser = require('./byod-pageObj.js');

nconf.file('test', 'conf.json');
nconf.file('permission', '../permissions.json');
nconf.load();

var meaurl = loginHelpers.getMEAUrl();

var authUser1Info = nconf.get("test_config").users.authenticated[0],
    authUser2Info = nconf.get("test_config").users.authenticated[4];

var meetingInfo = {avcEnabled: false};

var saveScreenShots = nconf.get("test_config").pixdiff.generate,
    testScreenShots = nconf.get("test_config").pixdiff.test;


var requests = {
    'JoinRequest(meetingID)': {
        command: function(context) {
            return '.meetingCollab.JoinRequest({meetingID: "' +context.byodUser.meetingInfo.id + '"})';
        },
        response: function(context) {
            var role = 'Chairperson'; //context.role;
            var allowRecordingCtrl =  nconf.get("Permissions")[role].indexOf('Record') !== -1;
            var allowRoomCtrlDial =  nconf.get("Permissions")[role].indexOf('RoomCtrlDial') !== -1;
            var allowRoomCtrlHangup =  nconf.get("Permissions")[role].indexOf('RoomCtrlHangup') !== -1;

            return [
                {
                    "source": "meetingCollab",
                    "event": "JoinResponse",
                    "value": _.constant(true)
                },
                {
                    "source": "meetingCollab",
                    "event": "MeetingStatusNotification",
                    "value": {"type": "Recording", "value": {"status": false}}
                },
                {
                    "source": "meetingCollab",
                    "event": "MeetingStatusNotification",
                    "value": {
                        "type": "Privileges",
                        "value": {"RecordingCtrl": allowRecordingCtrl, "RoomCtrlDial": allowRoomCtrlDial, "RoomCtrlHangup": allowRoomCtrlHangup}
                    }
                }
            ];
        }
    }
};

describe('creating an ad-hoc meeting to test meetingCollab.* apis', function () {
    it('creating adhoc meeting is successful', function (done) {
        loginHelpers.createAdHocMeeting(authUser1Info)
            .then(function (result) {
                meetingInfo.id = result.presentedId;
                expect(meetingInfo.id).not.toBe(undefined);
                done();
            });
    });
});


describe('can exercise other meetingCollab apis', function () {
    beforeEach(function (done) {
        var meeting = {
            id: meetingInfo.id,
            url: meaurl + '/?onload=protractorCallback',
            avcEnabled: false
        };
        var authRequest = '.auth.Login({username:"' + authUser1Info.userName +
            '", password:"' + authUser1Info.password + '"})';
        logger.debug(authRequest);
        this.byodUser = new EmbeddedUser(authUser1Info, meeting, browser);
        Promise.resolve(this.byodUser.loadPage())
            .return(1)
            .then(this.byodUser.waitForCallbackResponse)
            .then(function() {
                return browser.executeScript(authRequest);
            })
            .return(1)
            .then(this.byodUser.waitForCallbackResponse)
            .nodeify(done);
    });

    afterEach(function () {
    });

    for (var req in requests) {
        if (requests.hasOwnProperty(req)) {
            (function (testCase, request) {
                it('can respond to our request ' + testCase, function (done) {
                    var command = _.isFunction(request.command) ? request.command(this) : request.command;
                    var response = request.response;
                    if (_.isFunction(response)) {
                        response = request.response(this);
                    }
                    logger.debug('command to execute = ' + command);
                    logger.debug('waiting for response = ' + response);
                    Promise.resolve(browser.executeScript(command))
                        .return(response.length)
                        .then(this.byodUser.waitForCallbackResponse)
                        .then(function (responses) {
                            logger.debug(responses);
                            expect(responses.length).toBe(response.length);
                            var copyObj = _.cloneDeep(responses);
                            _.merge(copyObj, response, utils.matchCustomizer);
                            expect(responses).toEqual(copyObj);
                            done();
                        });
                });
            })(req, _.cloneDeep(requests[req]));
        }
    }

});