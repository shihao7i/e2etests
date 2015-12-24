// requirments
var loginHelpers = require('../helpers/loginHelpers'),
    MEALoginPage = require('../pageObjects/loginPageObj'),
    MEAMediaInitPage = require('../pageObjects/caxisMediaInitializationPageObj'),
    MEAMainPage = require('../pageObjects/mainPageObj'),
    utils = require('./utils'),
    Promise = require('bluebird'),
    nconf = require('nconf'),
    _ = require('lodash');

nconf.file('test', 'conf.json');
nconf.load();

// global variables
var MEAURL = loginHelpers.getMEAUrl();
var DEFAULT_meetingInfo = _.extend(
    nconf.get("test_config").meetings.default[0],
    {
        url: MEAURL
    }
);


var DEFAULT_userInfo = nconf.get("test_config").users.guest[0];

//  MEAUser Object
// TODO: gsankar, change this to take in just an object, I don't want to pass in null, null, browser
function MEAUser(userInfo, meetingInfo, browserInst) {
    logger.trace('creating MEAUser with ', userInfo, meetingInfo);
    var user = this;
    // check the constructor arguments
    user.userInfo = userInfo || DEFAULT_userInfo;
    user.meetingInfo = meetingInfo || DEFAULT_meetingInfo;
    user.browser = browserInst || browser;

    user.loginPage = null;
    user.mediaInitPage = null;
    user.mainPage = null;

    /*
     -------------------------   Accessor Methods    --------------------------------------
     */

    /**
     * gets the users name that is displayed in the roster.
     * @returns {string}
     */
    user.getRosterDisplayName = function () {
        var displayName;
        if (user.userInfo.isGuest) {
            displayName =  user.userInfo.userName;
        } else {
            displayName = user.userInfo.firstName + ' ' + user.userInfo.lastName;
        }
        logger.debug('user\'s display name is ' + displayName);
        return displayName;
    };

    user.getMeetingInfo = function () {
        return user.meetingInfo;
    };

    user.getChatHistory = function () {
        //print(user.userInfo.userName+': user.getChatHistory()');
        return this.mainPage.sideMenu.chat.getHistory();
    };

    // --> string
    user.getMostRecentMessage = function () {
        //print(user.userInfo.userName+': user.getMostRecentMessage()');
        return user.mainPage.sideMenu.chat.getMostRecent();
    };

    // gets a message from chat history,
    // i=0 --> most recent message
    // i=1 --> second most recent message
    // PRE: 0 <= i < user.getChatHistory().count()
    // --> string
    user.getMessage = function (i) {
        //print(user.userInfo.userName+': user.getMessage()');
        return user.mainPage.sideMenu.chat.getMostRecent(i);
    };

    user.getRole = function () {
        return this.mainPage.getRole();
    };

    user.getRosterPage = function () {
        return this.mainPage.sideMenu.roster;
    };

    /* --------------------------------------------------------------------------------*/

    /**
     *
     * @returns {*} Promise
     */
    user.goToLoginPage = function () {
        user.loginPage = new MEALoginPage(user.userInfo, user.meetingInfo, user.browser);
        return user.loginPage.get();
    };

    user.goToMediaInitPage = function () {
        //print('user.goToMediaInitPage, user.userInfo: ' + user.userInfo);
        //print('user.goToMediaInitPage, user.meetingInfo: '+ user.meetingInfo);
        user.mediaInitPage = new MEAMediaInitPage(user.userInfo, user.meetingInfo, user.browser);
        return user.mediaInitPage.setUp();
    };

    user.goToMainPage = function () {
        if (!user.mainPage) {
            user.mainPage = new MEAMainPage(user.userInfo, user.meetingInfo, user.browser);
        }
        return user.mainPage.setUp();
    };

    user.login = function () {
        logger.debug("In loginPage()");
        if (!user.loginPage) {
            logger.debug("creating login page");
            user.loginPage = new MEALoginPage(user.userInfo, user.meetingInfo, user.browser);
        }
        return user.loginPage.get()
            .then(function () {
                //print('user.login(), user.meetingInfo: ');
                //printObj(user.meetingInfo);
                //print('user.login(), user.meetingInfo.id: ' + user.meetingInfo.id);

                return user.loginPage.login(user.meetingInfo, user.userInfo);
            })
            .then(user.browser.getCurrentUrl)
            .then(function (url) {
                user.meetingInfo.url = url;
                user.mainPage = new MEAMainPage(user.userInfo, user.meetingInfo, user.browser);
                return Promise.resolve(true);
            })
            .then(null, function (err) {
                return Promise.reject("Failed to login");
            });
    };

    user.selectMenu = function (option) {
        //print(user.userInfo.userName+': user.selectMenu: '+ option);
        var self = user;
        switch (option) {
            case 'Roster':
                return self.mainPage.selectRosterButton(true);
            case 'Chat':
                return self.mainPage.selectChatButton(true);
            case 'Settings':
                return self.mainPage.selectSettingsButton(true);
            case 'Layout':
                return self.mainPage.selectLayoutButton(true);
            case 'SideMenu':
                return self.mainPage.selectSideMenuButton(true);
        }
    };

    user.sendChatMessage = function (mesg) {
        //print(user.userInfo.userName+': user.sendChatMessage('+mesg+')');
        return user.selectMenu('Chat')
            .then(function () {
                return user.mainPage.sideMenu.chat.sendMessage(mesg);
            });
    };

    user.userLogout = function () {
        //print('user.userLogout');
        return user.mainPage.end.click()
            .then(function () {
                return user.mainPage.leaveThisMeetingButton.click();
            })
            .then(function () {
                return user.mainPage.closeButton.click();
            })
            .then(function () {
                if (!user.loginPage) {
                    user.loginPage = new MEALoginPage(user.userInfo, user.meetingInfo, user.browser);
                }
                return Promise.resolve(true);
            })
            .then(function () {
                return user.loginPage.logOutBtn.click();
            });
    };

    /**
     * gets the role of attendeeName from users perspective.
     *  PRE: roster tab is open
     *
     * @method getAttendeeRole
     * @param {string} attendeeName
     * @return {Promise}
     * @public
     */
    user.getAttendeeRole = function (attendeeName) {
        //print('user.getAttendeeRole()');
        var roster = user.mainPage.sideMenu.roster;
        return user.selectMenu('Roster')
            .then(function () {
                return roster.setTargetElement(attendeeName);
            })
            .then(function () {
                return roster.getTargetElementPersonObj();
            })
            .then(function (personObj) {
                return Promise.resolve(personObj.role.toLowerCase());
            });
    };

    /**
     * Gets the speaker's state of attendeeName from users perspective.
     * *  PRE: roster tab is open
     *
     * @method getAttendeeMuteStatus
     * @param {string} attendeeName
     * @return {Promise}
     * @public
     */
    user.getAttendeeMuteStatus = function (attendeeName) {
        //print('user.getAttendeeMuteStatus()');
        var roster = user.mainPage.sideMenu.roster;
        return user.selectMenu('SideMenu')
            .then(function () {
                return roster.setTargetElement(attendeeName);
            })
            .then(function () {
                return roster.getTargetElementPersonObj();
            })
            .then(function (personObj) {
                return Promise.resolve(personObj.muteStatus);
            });
    };

    /**
     * Either promotes or demotes an attendee to a new role. The new role is given as a
     * string with possible values: "guest", "participant", or "chairperson".
     * PRE: user has chairperson privileges.
     * *  PRE: roster tab is open
     *
     * @method changeAttendeeRole
     * @param {string} attendeeName
     * @param {string} newRole
     * @return {Promise}
     * @public
     */
    user.changeAttendeeRole = function (attendeeName, newRole) {
        var roster = user.mainPage.sideMenu.roster;
        return user.selectMenu('Roster')
            .then(function () {
                return roster.setTargetElement(attendeeName);
            })
            .then(function (index) {
                return roster.promoteTargetElement(index, newRole);
            });
    };

    /**
     * Drops attendeeName from the meeting. For dropping authenticated users, using getRosterDisplayName to get
     * the correct displayName(first name + las name) then pass it as argument to dropAttendee function.
     * PRE: user has chairperson privileges.
     * *  PRE: roster tab is open
     *
     * @method dropAttendee
     * @param {string} attendeeName
     * @return {Promise}
     * @public
     */
    user.dropAttendee = function (attendeeName) {
        var roster = user.mainPage.sideMenu.roster;
        return user.selectMenu('Roster')
            .then(function () {
                return roster.setTargetElement(attendeeName);
            })
            .then(function () {
                return roster.dropTargetElement();
            });
    };

    /**
     * Returns a promise that resolves to true if a user is in the meeting, otherwise
     * false.
     **  PRE: roster tab is open
     *
     * @method userIsPresent
     * @param {string} userName
     * @returns {Promise}
     * @public
     */
    user.userIsPresent = function (userName) {
        // If a user calls this method with their own name it will return false
        // because the roster adds '(Me)' to their name.
        //TODO: add functionality for checking a users own name.
        var roster = user.mainPage.sideMenu.roster;
        return user.selectMenu('Roster')
            .then(function () {
                return roster.getAllAttendeeNames();
            })
            .then(function (nameList) {
                for(var i = 0; i < nameList.length; i++) {
                    logger.debug('Checking if ' + userName + ' matches ' + nameList[i]);
                    if (nameList[i] === userName) {
                        return Promise.resolve(true);
                    }
                }
                return Promise.resolve(false);
            });
    };

    /**
     * As a chairperson who has right to mute all other attendees except himself/herself
     * PRE: user has chairperson privileges.
     * *  PRE: roster tab is open
     *
     * @method muteAllOtherAttendees
     * @param  {boolean}
     * @return {Promise}
     * @public
     */
    user.muteAllOtherAttendees = function (mode) {
        var roster = user.mainPage.sideMenu.roster;
        return user.selectMenu('SideMenu')
            .then(function () {
                if (mode === true) {
                    return roster.clickMuteAllButton();
                } else if (mode === false) {
                    return roster.clickUnmuteAllButton();
                } else {
                    return Promise.reject('please pass true or false as an argument');
                }
            });
    };

    /**
     * As a chairperson who has right to mute/unmute a specific participant or guest
     * PRE: user has chairperson privileges.
     * *  PRE: roster tab is open
     *
     * @method muteAttendee
     * @param {string} attendeeName
     * @param {boolean} mode
     * @return {Promise}
     * @public
     */
    user.muteAttendee = function (attendeeName, mode) {
        var roster = user.mainPage.sideMenu.roster;
        return user.selectMenu('SideMenu')
            .then(function () {
                if (mode === true || mode === false) {
                    return user.selectMenu('Roster')
                        .then(function () {
                            return roster.setTargetElement(attendeeName);
                        })
                        .then(function () {
                            return roster.clickMuteAttendeeButton();
                        });
                } else {
                    return Promise.reject('please pass true or false as an argument');
                }
            });
    };

    /**
     * As a guest login with audio/video who has right to make a request for sharing content
     * PRE: login as guest with audio/video
     * *  PRE: roster tab is open
     *
     * @method makeARequest
     * @return {Promise}
     * @public
     */
    user.makeARequest = function () {
        var roster = user.mainPage.sideMenu.roster;
        return roster.clickRequestButton();
    };

    /**
     * As a chairperson who has right to reply to the request from guest
     * PRE: user has chairperson privileges.
     * *  PRE: roster tab is open
     *
     * @method responseToRequest
     * @param {boolean} mode
     * @return {Promise}
     * @public
     */
    user.responseToRequest = function (mode) {
        var roster = user.mainPage.sideMenu.roster;
        return roster.clickResponseButton(mode);
    };
}

module.exports = MEAUser;



