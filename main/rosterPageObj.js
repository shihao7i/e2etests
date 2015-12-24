var Promise = require('bluebird'),
    utils   = require('../helpers/utils'),
    assert  = require('assert');

var Roster = function(user, meetingInfo, browserInst){
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
    page.user = user;
    page.meetingInfo = meetingInfo;
    page.browser = browserInst;
    page._targetElement = null;

    // Getting the collection of roster items div tag
    page.rosterItems = $$('.roster-item.byod-roster');

    // Chair Person Element
    page.chairPersonsButton = element(by.repeater('attendeeGroup in attendeeGroups').row(0)).all(by.css('div')).first();
    page.chairPersonsPanel  = $$('.title-column.title-icon').get(0);
    page.chairPersonsTitle  = element(by.repeater('attendeeGroup in attendeeGroups').row(0).column('attendeeGroup["count"]'));
    page.expectedChairPersonsTitle = $$('.title-column.title-name').get(0);
    page.allowRequestButton = $('.roster-ask-allow');
    page.ignoreRequestButton = $('.roster-ask-ignore');

    // Participant Element
    page.participantsButton = element(by.repeater('attendeeGroup in attendeeGroups').row(1)).all(by.css('div')).first();
    page.participantsPanel  = $$('.title-column.title-icon').get(1);
    page.participantsTitle  = element(by.repeater('attendeeGroup in attendeeGroups').row(1).column('attendeeGroup["count"]'));
    page.expectedParticipantsTitle = $$('.title-column.title-name').get(1);

    // Guest Element
    page.guestsButton = element(by.repeater('attendeeGroup in attendeeGroups').row(2)).all(by.css('div')).first();
    page.guestsPanel  = $$('.title-column.title-icon').get(2);
    page.guestsTitle  = element(by.repeater('attendeeGroup in attendeeGroups').row(2).column('attendeeGroup["count"]'));
    page.expectedGuestsTitle = $$('.title-column.title-name').get(2);
    page.guestReguestButton = $('[ng-click="asked || ask()"]');
    page.guestReguestPanel = $('[ng-click="asked || ask()"]').element(by.css('span'));

    // Mute Button
    page.muteOrUnmuteAllButton = $('[ng-click="muteAllClicked(!toggleMuteAllExceptMeButton);"]').all(by.css('span')).first(0);
    page.muteAllExceptMeButton = $('[ng-click="muteAllExceptMe()"]');
    page.muteAttendeeButton = $('[ng-show="showHoverControls"]:not(.ng-hide) [ng-click="muteAttendee(!toggleMuteButton); $event.stopPropagation();"]');

    // dropping attendee from meeting elements
    page.dropUserFromMeetingButton = $('[ng-show="showHoverControls"]:not(.ng-hide) [ng-click="dropClicked($event, true); $event.stopPropagation();"]');
    page.yesDropAttendeeConfirmationButton = $('[ng-show="isDropClicked && showHoverControls"]:not(.ng-hide) [ng-click="dropAttendee()"]');
    page.noDropAttendeeConfirmationButton = $('[ng-show="isDropClicked && showHoverControls"]:not(.ng-hide) [ng-click="dropClicked($evet, false)"]');

    page.activeParticipantEntry = $('[ng-show="showHoverControls"]');
    page.changeStatusButton = $$('[ng-show="showHoverControls"]:not(.ng-hide) div').first().all(by.css('div'));
    page.roleDropdownButton = $$('[ng-show="isDropDownEnabled"]:not(.ng-hide) [ng-click="promoteAttendee(choice)"]');
    page.escButton = $('.roster-control-buttons-ellipses-close-icon:not(.ng-hide)');

    /************************** Methods **************************/

    page.getAttendeeCount = function () {
        return page.browser.executeAsyncScript(function (callback) {
            try {
                var service = angular.element(document).
                    injector().get('caxisRosterService');
                callback(service.getAttendeeCount());
            }
            catch(err) {
                callback(err);
            }
        });
    };

    /**
     * gets the roster person object associated with _targetElement.
     */
    page.getTargetElementPersonObj = function(){
        //print('roster.getTargetElementPersonObj()');
        return page._targetElement.evaluate('attendeeGroup.list[id]');
    };

    /**
     * Gets the webElement object associated with targetUserName from the roster attendee
     * list. _targetElement will be inaccurate if there have been any roster movements
     * such as drops or promotions.
     *
     * POST: _wantedElement is set to be a promise who's value resolves to the webElement object
     * associated with targetUserName from the roster attendee list.
     *
     * @method setTargetElement
     * @param {string} targetUserName
     * @return {Promise}
     * @
     */
    page.setTargetElement = function(targetUserName){
        //logger.debug('roster.setTargetElement()');
        var index = null;
        // find the attendee element that has targetUserName
        return page.getAllAttendeeNames()

            // search for the webElement associated with our target userName
            .then(function(nameList){
                for(var i = 0; i < nameList.length; i++) {
                    if(targetUserName === nameList[i]) {
                        // we found our target element so return its index
                        return Promise.resolve(i);
                    }
                }
                // we did not find our target element
                return Promise.resolve(false); })

            .then(function(targetIndex){
                assert(targetIndex >= 0, "Roster Error: element with targetUserName could not be found");
                index = targetIndex;
                return  page.rosterItems.get(targetIndex); })

            .then(function(target){
                // we found our target element so save its value in _targetElement
                //logger.debug('target in setTragetElement'+target);
                page._targetElement = target;
                return Promise.resolve(index);
            });
    };

    page.getAllAttendeeNames = function(){
        //logger.debug('roster.getAllAttendeeNames()');
        return page.rosterItems.count()
            // get the user webElements of all the attendees in the roster
            .then(function(length) {
                var attendeeElems = [];
                for(var i = 0; i < length; i++) {
                    attendeeElems.push(page.rosterItems.get(i).evaluate('attendeeGroup.list[id]'));
                }
                return Promise.all(attendeeElems);
            })
            .then(function(attendees){
                logger.debug('Found attendees', attendees);
                var userNames = [];
                for(var i = 0; i < attendees.length; i++) {
                    userNames.push(attendees[i].displayName);
                }
                return Promise.resolve(userNames);
            });
    };

    page.promoteTargetElement = function(index, role){
        var newRole = null;
        switch (role.toLowerCase()){
            case "guest": newRole = 0; break ;
            case "participant": newRole = 1; break;
            case "chairperson": newRole = 2; break;
            default: break;
        }
        return page._targetElement.click()
            .then(function () {
                return browser.sleep(1500);
            })
            .then(function () {
                return page.changeStatusButton.first().click();
            })
            .then(function () {
                return page.roleDropdownButton.get(newRole).click();
            });
    };

    page.dropTargetElement = function () {
        return page._targetElement.click()
            .then(function () {
                return browser.sleep(1500);
            })
            .then(function () {
                return page.dropUserFromMeetingButton.click();
            })
            .then(function () {
                return page.yesDropAttendeeConfirmationButton.click();
            });
    };

    /**
     * As a chairperson who has right to mute all other attendees except himself/herself
     * this private method will be used in user.muteAllOtherAttendees() in userObj.js
     * @method clickMuteAllButton
     * @return {Promise}
     * @private
     */
    page.clickMuteAllButton = function () {
        return page.muteOrUnmuteAllButton.click()
            .then(function () {
                return page.muteAllExceptMeButton.click();
            });
    };

    /**
     * As a chairperson who has right to unmute all other attendees except himself/herself
     * this private method will be used in user.muteAllOtherAttendees() in userObj.js
     * @method clickUnmuteAllButton
     * @return {Promise}
     * @private
     */
    page.clickUnmuteAllButton = function () {
        return page.muteOrUnmuteAllButton.click();
    };

    /**
     * As a chairperson who has right to mute a specific participant or guest,
     * this private method will be used in user.muteAttendee() in userObj.js
     * @method clickMuteAttendeeButton
     * @return {Promise}
     * @private
     */
    page.clickMuteAttendeeButton = function () {
        return page._targetElement.click()
            .then(function () {
                return browser.sleep(1500);
            })
            .then(function () {
                return page.muteAttendeeButton.click();
            });
    };

    /**
     * As a guest login with audio/video who has right to make a request for sharing content,
     * this private method will be used in user.makeARequest() in userObj.js
     * @method clickRequestButton
     * @return {Promise}
     * @private
     */
    page.clickRequestButton = function () {
        return page.guestReguestButton.click();
    };

    /**
     * As a chairperson who has right to reply the request from guest,
     * this private method will be used in user.replyRequest() in userObj.js
     * @method clickResponseButton
     * @param  {boolean} mode
     * @return {Promise}
     * @private
     */
    page.clickResponseButton = function (mode) {
        switch (mode) {
            case true:
                return page.allowRequestButton.click();
            case false:
                return page.ignoreRequestButton.click();
            default:
                return Promise.reject('please pass true or false as an argument');
        }
    };
};

module.exports = Roster;
