//http://angular.github.io/protractor/#/page-objects
//'use strict';
var Promise = require('bluebird'),
    loginHelpers = require('../helpers/loginHelpers'),
    utils = require('../helpers/utils'),
    _ = require('lodash'),
    assert = require('assert');

var MEAURL = loginHelpers.getMEAUrl();

var MEALoginPage    = function(userInfo, meetingInfo, browserInst){
    assert(userInfo, "MEALogin page must have userInfo as an argument");
    assert(meetingInfo, "MEALogin needs to have a meetingInfo argument");
    assert(browserInst, "MEALogin page must have browserInst as an argument");
    var  $, $$, element;
    $ = browserInst.$;
    $$ = browserInst.$$;
    element = browserInst.element;
    var page = this;
    page.browser = browserInst;
    page.userInfo = userInfo;
    page.meetingInfo = meetingInfo || {};
    // Page elements
    page.guestCheckbox = $('[ng-click="userInfo.isGuest = !userInfo.isGuest;guestCheckBoxClicked()"]');
    page.avcEnabledCheckbox = $('[ng-click="switchAVCMode()"]');
    page.nameInput = element(by.model('userInfo.username'));
    page.passwordInput = element(by.model('userInfo.password'));
    page.emailInput = element(by.model('userInfo.email'));

    page.continueToMeetingButton = $('[ng-click="continueToMeeting()"]');
    page.rememberMeCheckbox = $('[ng-click="userInfo.rememberMe = !userInfo.rememberMe"]');
    page.meetingIDInput = element.all(by.model('meetingInfo.meetingID')).first();
    page.meetingPinInput = element.all(by.model('meetingInfo.meetingPin')).first();
    page.avcHelpIcon = $$('.avc_switch_helper_icon').first();
    page.tooltipContent = $('.tooltip');
    page.joiningAsDisplayName = $('.autoDisplayName');
    page.notification = $('.error-text');
    page.notificationUI = $('.login-notification');

    // TODO: do these refer to the same element?
    page.logOutBtn = element(by.css(".logOutBtn"));
    //page.logoutButton = $('[ng-click="logOut()"]');

    /** ----------------------------------------------------------------------------------
     *                  BROWSER SPECIFIC ELEMENTS
     *  ----------------------------------------------------------------------------------
     */

        // this works on firefox and chrome
    page.joinMeetingButton =  element(by.css('.text-input.text-black.wait-complete'));

    // this only works on chrome
    // page.joinMeetingButton = element(by.css('.login-join-container'));
    /** --------------------------------------------------------------------------------*/

    page.get = function() {
        return Promise.resolve(page.browser.driver.manage().deleteAllCookies())
            .then(function() {
                var url = meetingInfo.url || MEAURL;
                return page.browser.get(url);
            });
    };

    page.logout = function() {
        return utils.clickIfDisplayed(page.logOutBtn);
    };

    page.login = function(meetingParams, userParams) {
        if (!userParams){
            userParams = page.userInfo;
        }

        // If some one else has already logged in, just logout
        return Promise.resolve(page.setAVCMode(meetingParams.avcEnabled))
            .then(function() {
                if (userParams.isGuest !== undefined) {
                    return page.setGuestMode(userParams.isGuest === true);
                } else {
                    return Promise.resolve(true);
                }
            })
            .then(function() {
                var actions = [];
                if (userParams.isGuest !== undefined) {
                    if (userParams.isGuest) {
                        actions = [page.nameInput.sendKeys(userParams.userName),
                            page.emailInput.sendKeys(userParams.email),
                            page.meetingIDInput.sendKeys(meetingParams.id)];
                    } else {
                        assert(userParams.userName, "Login Error: authenticated user must have userName");
                        assert(userParams.password, "Login Error: authenticated user must have password");
                        assert(meetingParams.id, "Login Error: authenticated user must have meeting id");
                        actions = [page.nameInput.sendKeys(userParams.userName),
                            page.passwordInput.sendKeys(userParams.password),
                            page.meetingIDInput.sendKeys(meetingParams.id)];
                    }
                } else {
                    // Nothing to do here ...
                }
                if (meetingParams.pin) {
                    actions.push(page.meetingPinInput.sendKeys(meetingParams.pin));
                }
                return Promise.all(actions);
            })
            .then(function() {
                logger.debug('Clicking join button ...');
                return page.joinMeetingButton.click();
            })
            .then(function() {
                return Promise.resolve(true);
            })
            .catch(function(err) {
                logger.error('Exception ' + err);
                logger.error(err.stack);
                return Promise.reject(err);
            });
    };

    page.isGuestMode = function() {
        return page.guestCheckbox.isSelected();
    };

    page.isAVCEnabled = function() {
        return page.avcEnabledCheckbox.isSelected();
    };

    page.setGuestMode = function(mode) {
        return utils.set(page.guestCheckbox, mode);
    };

    /**
     * Returns a promise that sets the AVC mode
     * @param mode
     */
    page.setAVCMode = function(mode) {
        var getCheckboxValue = page.avcEnabledCheckbox.isSelected();
        return getCheckboxValue
            .then(function(checked) {
                if ((typeof mode) === typeof String()){
                    switch (mode){
                        case 'true': mode = true; break;
                        case 'false': mode = false; break;
                    }
                }
                if (checked === mode) {
                    return Promise.resolve(true);
                } else {
                    // page.avcEnabledCheckbox.click() doesn't work, chrome says the element is not visible
                    // so we execute a javascript call to do the click for us
                    // https://github.com/angular/protractor/blob/master/docs/faq.md
                    return page.browser.executeScript("$('[ng-click=\"switchAVCMode()\"]').click()");
                }
            });
    };

    page.waitForAVCOptionToAppear = function() {
        return page.browser.wait(function() {
            return page.avcEnabledCheckbox.isEnabled();
        }, 5000);
    };

    page.setUp = function(){
        return this.get();
    };
};

module.exports = MEALoginPage;