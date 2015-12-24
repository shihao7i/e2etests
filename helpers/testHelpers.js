var nconf = require('nconf');
var fs = require('fs');
var loginHelpers = require('../helpers/loginHelpers');
var MEAUser = require('../helpers/userObj');
var Promise = require('bluebird');
var utils = require('../helpers/utils');

module.exports = (function () {
    var meetingFile = './meetingConf.json';
    var helpers = {
        VoidPromise: function () {
            return Promise.resolve(true);
        },

        ifBrowserQuit: function (b) {
            if (b) {
                return b.quit().then(function () {
                    return Promise.resolve(true);
                });
            } else {
                return Promise.resolve(true);
            }
        },

        // PRE: userParams.length >= size, meetingInfo has valid id
        // POST: userArr has size number of users.
        //  --> a Promise that resolves once each user has been taken to the mea main page.
        userSetUp: function (userArr, userParams, meetingInfo, size) {
            logger.debug('th.userSetUp');
            var width = 1100,
                height = 825;
            var thingsToDo = [];
            var b = null;
            for (var i = 0; i < size; i++) {
                if (i === 0) {
                    b = browser;
                } else {
                    b = browser.forkNewDriverInstance();
                    b.driver.manage().window().setSize(width, height);
                }
                userArr[i] = new MEAUser(userParams[i], meetingInfo, b);
                thingsToDo.push(userArr[i].goToMainPage());
            }
            return Promise.settle(thingsToDo);
        },

        tearDown: function (userArr) {
            logger.debug('th.tearDown');
            var thingsToDo = [];
            // only quit the forked browsers
            for (var i = 1; i < userArr.length; i++) {
                if (userArr[i]) {
                    thingsToDo.push(userArr[i].browser.quit());
                }
            }
            return Promise.settle(thingsToDo);
        },

        expectAllHistoryToBe: function (userArr, count) {
            function expectHistoryToBe(user, i, uArr) {
                expect(user.getChatHistory().count()).toBe(count);
            }

            userArr.forEach(expectHistoryToBe);
        },

        expectAllUrlToBe: function (userArr, url) {
            function expectURL(user, i, uArr) {
                expect(user.browser.driver.getCurrentUrl()).toBe(url);
            }
            userArr.forEach(expectURL);
        },

        newChairUser: function (chairUserInfo, browserInst) {
            return loginHelpers.createAdHocMeeting(chairUserInfo)
                .then(function (wspMeeting) {
                    var chairUser = new MEAUser(
                        chairUserInfo,
                        {id: wspMeeting.presentedId},
                        browserInst);
                    return Promise.resolve(chairUser);
                });
        },

        /**
         * PRE: roster tab is open
         *
         * @method changeRoleAndConfirm
         * @param {object} chair
         * @param {object} target
         * @param {object} observer
         * @param {string} newRole
         * @return {Promise}
         * @public
         */
        changeRoleAndConfirm: function (chair, target, observer, newRole) {
            logger.debug('th.changeRoleAndConfirm');
            newRole = newRole.toLowerCase();
            var targetName = target.getRosterDisplayName();
            return chair.changeAttendeeRole(targetName, newRole)
                .then(function () {
                    return browser.wait(function () {
                        return Promise.all([(expect(chair.getAttendeeRole(targetName)).toBe(newRole)),
                                            (expect(observer.getAttendeeRole(targetName)).toBe(newRole)),
                                            (expect(target.getRole()).toBe(newRole))]);
                    }, 1500);
                });
        },

        /**
         * PRE: roster tab is open
         *
         * @method muteAllOtherAttendeesAndConfirm
         * @param {object} chair
         * @param {object} participant
         * @param {object} guest
         * @param {boolean} mode
         * @return {Promise}
         * @public
         */
        muteAllOtherAttendeesAndConfirm: function (chair, participant, guest, mode) {
            var participantName = participant.getRosterDisplayName();
            var guestName = guest.getRosterDisplayName();
            return chair.muteAllOtherAttendees(mode)
                .then(function () {
                    return browser.sleep(3000);
                })
                .then(function () {
                    return browser.wait(function () {
                        return Promise.all([(expect(chair.getAttendeeMuteStatus(participantName)).toBe(mode)),
                                            (expect(guest.getAttendeeMuteStatus(participantName)).toBe(mode)),
                                            (expect(chair.getAttendeeMuteStatus(guestName)).toBe(mode)),
                                            (expect(participant.getAttendeeMuteStatus(guestName)).toBe(mode))]);
                    }, 1000);
                });
        },

        /**
         * PRE: roster tab is open
         *
         * @method muteAllOtherAttendeesAndConfirm
         * @param {object} chair
         * @param {object} target
         * @param {object} observer
         * @param {boolean} mode
         * @return {Promise}
         * @public
         */
        muteAttendeeAndConfirm: function (chair, target, observer, mode) {
            var targetName = target.getRosterDisplayName();
            return chair.muteAttendee(targetName, mode)
                .then(function () {
                    return browser.sleep(3000);
                })
                .then(function () {
                    return browser.wait(function () {
                        return Promise.all([(expect(chair.getAttendeeMuteStatus(targetName)).toBe(mode)),
                                            (expect(observer.getAttendeeMuteStatus(targetName)).toBe(mode))]);
                    }, 1000);
                });
        },

        waitForAllAttendeesToLogIn: function (user, attendeeCount) {
            var roster = user.getRosterPage();
            return user.browser.wait(function () {
                return roster.getAttendeeCount()
                    .then(function (count) {
                        return count === attendeeCount;
                    });
            });
        },

        waitForChatHistory: function (user, chatCount) {
            return user.browser.wait(function () {
                return user.getChatHistory().count()
                    .then(function (count) {
                        return count === chatCount;
                    });
            });
        },

        setGuestAndAvcForAll: function (guestVal, avcVal, userArgs) {
            function setVals(user, index, array) {
                user.isGuest = guestVal;
                user.avcEnabled = avcVal;
            }

            userArgs.forEach(setVals);
        },

        saveMeetingInfo: function (meetingInfo) {
            fs.writeFileSync(meetingFile, JSON.stringify(meetingInfo));
        },

        cleanMeetingInfo: function () {
            if (fs.existsSync(meetingFile)) {
                fs.unlinkSync(meetingFile);
            }
        },

        meetingSetUp: function (userArgs, browser) {

            var getMeetingInfo = null;
            if (userArgs.chair) {
                var meeting = null;
                getMeetingInfo = loginHelpers.createAdHocMeeting(userArgs)
                    .then(function (meetingInfo) {
                        // write meeting Info to disk
                        helpers.saveMeetingInfo(meetingInfo);
                        return Promise.resolve(meetingInfo);
                    });
            } else {
                var contents = null;
                getMeetingInfo = browser.wait(function () {
                    //console.log('inside  wait');
                    return Promise.resolve(fs.existsSync(meetingFile))
                        .then(function (ready) {
                            //console.log('inside  func');
                            if (ready) {
                                contents = fs.readFileSync(meetingFile, 'utf8');
                                logger.debug('conts');
                            }
                            return ready;
                        });
                })

                    .then(function () {
                        return Promise.resolve(JSON.parse(contents));
                    });
            }

            return getMeetingInfo.then(function (meetingInfo) {
                var meeting = {id: meetingInfo.presentedId};

                logger.debug('meeting: ', meeting);
                return Promise.resolve(meeting);
            });
        }
    };
    return helpers;
})();