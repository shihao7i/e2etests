var Promise      = require('bluebird'),
    loginHelpers = require('../helpers/loginHelpers'),
    utils        = require('../helpers/utils');

var meaurl = loginHelpers.getMEAUrl();

var MEAEndMeetingPage = function(user, meetingInfo, browserInst) {
    var page = this,
        $,
        $$,
        element;

    if (browserInst === undefined) {
        browserInst = browser;
    }

    $       = browserInst.$;
    $$      = browserInst.$$;
    element = browserInst.element;
    page.url         = meaurl + '/' + meetingInfo.id;
    page.userInfo    = user;
    page.meetingInfo = meetingInfo;
    page.browserInst = browserInst;

    page.checkbox           = $('[ng-model="endMeetingOption.noExitConfirmation"]');
    page.optionsContainer   = $('.options-container');
    page.leaveMeetingButton = $('[ng-click="exitMeeting()"]');
    page.endMeetingforAllButton = $('[ng-click="endMeetingForAll()"]');

    page.endMeetingPagePanel = element(by.css('.info-box')).$('.info-text');
    page.returnMeetingButton = element(by.css('.button-icon.back-icon'));
    page.closeButton         = $('[ng-click="redirectToHome(false)"]');
    page.endMeetingOptions = $('.caxis-end-meeting-options');

    // For Taking Screen Shot
    page.confirmationPage = $('.participant-option-list.middle-dialog');
    page.theMeetingEngPage = $('.drop-participant.middle-dialog');

    page.returnToMain = function() {
        return page.returnMeetingButton.click()
            .then(function() {
                return page.browserInst.wait(function () {
                   return page.endMeetingOptions.isDisplayed()
                       .then(function(val) {
                          return val === false;
                       });
                });
            });
    };

};

module.exports = MEAEndMeetingPage;


