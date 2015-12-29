
var nconf = require('nconf'),
    encryption = require('plcm-encryption'),
    wspAgentType = "wsp-authentication/.mea.agent.wsp-authentication",
    wspClientLib = require('wsp-rest-client'),
    credentialKey = "targetcredentials",
    Promise = require('bluebird'),
    urlKey = "targeturl",
    meaSettings = '../settings.json',
    _ = require('lodash');

nconf.file('app', meaSettings);
nconf.file('test', 'conf.json');
nconf.load();

/**
 * Create a WSP conference and returns the conference object
 * @param userInfo, info of the owner of the meeting
 * @param meetingInfo, meeting properties
 * @returns {{Promise}}
 */
function createWSPMeeting(userInfo, meetingInfo) {
    var wspAgentInfo = wspClientLib.helpers.getWSPAuthAgentInfo(meaSettings),
        conferenceInfo = {};

    var wspClient, wspConnection;

    wspClient = wspClientLib.WSPClient({
        url: wspAgentInfo.url,
        rejectUnauthorized: wspAgentInfo.rejectUnauthorized
    });

    wspConnection = wspClientLib.WSPConnection(wspClient);
    // get the token for our wsp user
    return wspConnection.authenticateAsync(userInfo.userName, userInfo.password)
        .then(function(result) {
            userInfo.wspToken = result.tokenId;
            wspConnection.saveAuthCredentials(
                userInfo.userName,
                userInfo.wspToken);

            return wspConnection.createConferenceAsync(meetingInfo);
        })
        .then(function(result){
            conferenceInfo = result;
            return Promise.resolve(conferenceInfo);
        });
}

function cancelWSPMeeting(userInfo, wspMeetingId) {
    var wspAgentInfo = wspClientLib.helpers.getWSPAuthAgentInfo(meaSettings),
        conferenceInfo = {};

    var wspClient, wspConnection;

    wspClient = wspClientLib.WSPClient({
        url: wspAgentInfo.url,
        rejectUnauthorized: wspAgentInfo.rejectUnauthorized
    });

    wspConnection = wspClientLib.WSPConnection(wspClient);
    // get the token for our wsp user
    return wspConnection.authenticateAsync(userInfo.userName, userInfo.password)
        .then(function(result) {
            userInfo.wspToken = result.tokenId;
            wspConnection.saveAuthCredentials(
                userInfo.userName,
                userInfo.wspToken);

            return wspConnection.cancelConferenceAsync(wspMeetingId);
        })
        .then(function(result){
            return Promise.resolve(result);
        });
}

module.exports = {
    getMEAUrl: function() {
        return nconf.get('environments')[0].general.urls.internal_secure;
    },
    getWSPUrl: function() {
        var wspAgentInfo = wspClientLib.helpers.getWSPAuthAgentInfo(meaSettings);
        return wspAgentInfo.url;
    },
    /**
     * Returns a promise which will get resolved to the meeting url
     * @param meetingOptions
     */
    getMeetingUrl: function(meetingOptions) {
        var meaurl = this.getMEAUrl(),
            urlparams,
            pageurl;

        if (meetingOptions.embedded) {
            urlparams = '?embedded=true&token=$token&username=$username' +
                '&meeting=$meeting&referer=$wsp/userapp/#mea/$meeting';
            urlparams = urlparams.replace(/\$meeting/g,
                meetingOptions.lobbyCode);
            urlparams = urlparams.replace(/\$wsp/g, this.getWSPUrl());
            urlparams = urlparams.replace(/\$username/g,
                meetingOptions.userInfo.userName);
            return this.getTokenForWSPUser(meetingOptions.userInfo)
                .then(function(token) {
                    urlparams = urlparams.replace(/\$token/g, token);
                    pageurl = meaurl + '/' + urlparams;
                    return Promise.resolve(pageurl);
                });
        } else {
            pageurl = meaurl + '/' + meetingOptions.lobbyCode;
            return Promise.resolve(pageurl);
        }
    },
    /**
     * Creates an ad-hoc meeting and returns a promise
     * @param userInfo
     * @returns {*}
     */
    createAdHocMeeting: function(userInfo) {
        var meetingInfo = {
            "name": "e2e test adhoc conference",
            "description": "adhoc conference",
            "type": "AD_HOC",
            "createdBy": {
                "userName": userInfo.userName
            }
        };
        return createWSPMeeting(userInfo, meetingInfo);
    },
    /**
     * Creates a scheduled meeting and returns a promise
     * @param userInfo
     * @param meetingInfo
     * @returns {Promise}
     */
    createScheduledMeeting: function(userInfo, meetingInfo) {
        var currTime = new Date(),
            minfromNow = (new Date(currTime.getTime() + 60*1000))
                .toISOString(),
            hourfromNow = (new Date(currTime.getTime() + 60*60*1000))
                .toISOString();
        var info = {
            "name": "e2e test scheduled conference",
            "description": "scheduled conference",
            "type": "SCHEDULED",
            "createdBy": {
                "userName": userInfo.userName
            },
            "startTime": minfromNow,
            "endTime": hourfromNow
        };
        info = _.extend(info, meetingInfo);
        return createWSPMeeting(userInfo, info);
    },
    cancelScheduledMeeting: function(userInfo, wspMeetingId) {
        return cancelWSPMeeting(userInfo, wspMeetingId);
    },
    /**
     *
     * @param userInfo
     * @param browser -- protractor instance
     * @returns {Promise}
     */
    createWSPLocalUser: function(userInfo) {
        var wspAgentInfo,
            wspClient,
            wspAuthAgentToken,
            wspConnection;

        wspAgentInfo = wspClientLib.helpers.getWSPAuthAgentInfo(meaSettings);
        wspClient = wspClientLib.WSPClient({
            url: wspAgentInfo.url,
            rejectUnauthorized: wspAgentInfo.rejectUnauthorized
        });
        wspConnection = wspClientLib.WSPConnection(wspClient);
        return wspConnection.authenticateAsync(wspAgentInfo.userName, wspAgentInfo.password)
            .then(function(result) {
                wspAuthAgentToken = result.tokenId;
                wspConnection.saveAuthCredentials(
                    wspAgentInfo.userName,
                    wspAuthAgentToken);
                return wspConnection.createWSPUserAsync(userInfo);
            })
            .then(function(result) {
                return Promise.resolve(result);
            })
            .catch(function(err) {
                if (err.wspResponse &&
                    err.wspResponse.message.indexOf('already exists.') > -1){
                    return Promise.reject(new Error(err.wspResponse.message));
                } else {
                    return Promise.reject(false);
                }
            });

        //wspConnection.close();
        //return userCreated;
    },

    createWSPMeeting: function(userInfo, meetingInfo) {
        var info = {
            "name": "e2e test conference",
            "description": "conference",
            "type": "AD_HOC",
            "createdBy": {
                "userName": userInfo.userName
            }
        };
        info = _.extend(info, meetingInfo);
        return createWSPMeeting(userInfo, info);
    },

    /**
     *
     * @param token
     * @returns {Promise}
     */
    getTokenForWSPUser: function(userInfo) {
        var wspAgentInfo,
            wspClient,
            tokenInfo,
            wspConnection;

        wspAgentInfo = wspClientLib.helpers.getWSPAuthAgentInfo(meaSettings);
        wspClient = wspClientLib.WSPClient({
            url: wspAgentInfo.url,
            rejectUnauthorized: wspAgentInfo.rejectUnauthorized
        });


        wspConnection = wspClientLib.WSPConnection(wspClient);
        return wspConnection.authenticateAsync(
            userInfo.userName,
            userInfo.password)
            .then(function(result) {
                tokenInfo = result.tokenId;
                wspConnection.saveAuthCredentials(userInfo.userName, tokenInfo);
                return wspConnection.checkSelfTokenAsync(
                    userInfo.userName,
                    tokenInfo);})
            .then(function(result) {
                tokenInfo = result.tokenId;
                return Promise.resolve(tokenInfo);
            });

    },

    /**
     * https://github.com/angular/protractor/issues/610
     * @name waitForUrlToChangeTo
     * @description Wait until the URL changes to match a provided regex
     * @param {RegExp} urlRegex wait until the URL changes to match this regex
     * @param {browserInst} browser protractor browser instance
     * @returns {!webdriver.promise.Promise} Promise
     */
    waitForUrlToChangeTo: function(urlRegex, browserInst) {
        var currentUrl;
        logger.debug('Waiting for the url ' + urlRegex);
        return browserInst.wait(function () {
            return browserInst.getCurrentUrl()
                .then(function compareCurrentUrl(url) {
                    var ret = urlRegex.test(url);
                    logger.debug('Waiting for ' + url + ' to change to ' + urlRegex);
                    if (ret) {
                        logger.debug('Successfully transitioned to ' + urlRegex);
                    }
                    return ret;
                });
        }, 10000);
    },

    waitForPluginToMakeASipCall: function() {
        return browser.sleep(10*1000);
    }
};
