//http://angular.github.io/protractor/#/page-objects
var Promise = require('bluebird'),
    MEAMediaInitPage = require('./caxisMediaInitializationPageObj'),
    MEALoginPage = require('./loginPageObj'),
    loginHelpers = require('../helpers/loginHelpers'),
    mainHelper = require('../helpers/mainPageHelpers'),
    SideMenu = require('../main/sideMenuObj'),
    assert = require('assert'),
    MEAEndMeetingPage = require('./endMeetingPageObj'),
    utils = require('../helpers/utils');

var meaurl = loginHelpers.getMEAUrl();

var MEAMainPage = function(userInfo, meetingInfo, browserInst) {
    var page = this,
        $,
        $$,
        element;

    if (browserInst === undefined) {
        browserInst = browser;
    }

    $ = browserInst.$;
    $$ = browserInst.$$;
    element = browserInst.element;
    page.url = meaurl + '/' + meetingInfo.id;
    page.userInfo = userInfo;
    page.meetingInfo = meetingInfo;
    page.browser = browserInst;

    // Horizontal-slide Buttons
    page.micButton      = $('[ng-click="toggleMicButton = !toggleMicButton; meetingControl(\'Mic\', toggleMicButton);"]');
    page.videoButton    = $('[ng-click="toggleVideoButton = !toggleVideoButton; meetingControl(\'Video\', toggleVideoButton);"]');
    page.speakerButton  = $('[ng-click="toggleVolumeButton = !toggleVolumeButton; meetingControl(\'Volume\', toggleVolumeButton);"]');
    page.selfViewButton = $('[ng-click="toggleSelfViewButton = !toggleSelfViewButton; meetingControl(\'SelfView\', toggleSelfViewButton);"]');
    page.recordButton   = $('[ng-click="meetingControl(\'Record\')"]');

    page.horizontalButtonsArea  = $$('.horizontal-slide').first();
    page.endMeetingPanel        = $('.caxis-end-meeting-options');
    page.leaveThisMeetingButton = element(by.css(".option-button.bottom-red.right-participant-option"));
    page.closeButton            = element(by.css(".drop-participant-button.option-button.bottom-grey"));
    
    page.end               = $$('.icon-wrapper.span4.text-center').first();
    page.endMeetingButtons = $$('[ng-click="meetingControl(\'Hangup\');"]');
    page.endMeetingButton  = page.endMeetingButtons.get(page.meetingInfo.avcEnabled ? 0 : 1);

    // Side Menu Constructor
    page.sideMenu = new SideMenu(page.userInfo, page.meetingInfo, page.browser);

    // End Meeting Page Constructor
    page.endMeeting = new MEAEndMeetingPage(page.userInfo, page.meetingInfo, page.browser);

    // Side Menu Buttons
    page.menuButton = $('[ng-click="toggleMenu(null);"]');
    /*  browser might not be on main page when this object is constructed, so we
     set sideMenuButton in page.setUp().*/
    //page.sideMenuButton = element(by.css(".header-menu-right-button.header-float-right"));

    // Content Menu Buttons
    page.contentButton = $('[ng-click="toggleContent();"]');

    // Side Menu options
    page.layoutOptions = element.all(by.repeater("item in layoutItems"));

    // Chat options
    page.newChatTextArea = $('[ng-model="newMessage"]');
    page.chatHistory = element.all(by.repeater("n in messages"));


    page.selectLayoutButton = function (mode) {
        var elem = page.layoutButton;
        return page.selectElement(elem, mode);
    };

    page.selectSideMenuButton = function (mode) {
        var elem = page.menuButton;
        return page.selectElement(elem, mode);
    };

    page.selectEndMeetingButton = function() {
        return page.endMeetingButton.click();
    };

    page.selectRosterButton = function (mode) {
        var elem = page.sideMenu.rosterButton;
        return page.selectElement(elem, mode);
    };

    page.selectChatButton = function (mode) {
        var elem = page.sideMenu.chatButton;
        return page.selectElement(elem, mode);
    };

    page.selectSettingsButton = function (mode) {
        var elem = page.sideMenu.settingsButton;
        return page.selectElement(elem, mode);
    };

    page.selectAddParticipantButton = function (mode) {
        var elem = page.sideMenu.addParticipantButton;
        return page.selectElement(elem, mode);
    };

    page.selectElement = function (elemToClick, mode, elemToTest) {
        /* For some buttons we click and test different elements
         or they can be the same element     */
        if(!elemToTest){
            // we probe and click the same element.
            elemToTest = elemToClick;
        }
        return mainHelper.elemIsHidden(elemToTest, page.browser)
            .then(function (hidden) {
                assert(!hidden, 'element selection error: selecting hidden element ');
                return mainHelper.elemIsActive(elemToTest, page.browser);})
            .then(function (checked) {
                if (checked !== mode) {
                    return elemToClick.click()
                        .then(function () {
                            // sometimes there is a delay before we see tab change to active.
                            return mainHelper.waitForElementActivity(elemToTest, mode, page.browser);
                        });
                } else {
                    return Promise.resolve(true);
                }
            });
    };

    page.waitForLayoutOptionToAppear = function () {
        return page.browser.wait(function () {
            return page.layoutButton.isDisplayed();
        }, 5000);
    };

    page.getRole = function () {
        return page.browser.executeAsyncScript(function (callback) {
            try {
                var service = angular.element(document).
                    injector().get('caxisRosterService');
                callback(service.myRole.toLowerCase());
            }
            catch (err) {
                callback(err.stack);
            }
        });
    };

    page.sendChatMessage = function (mesg) {
        return Promise.resolve(page.newChatTextArea.sendKeys(mesg, protractor.Key.ENTER));
    };

    page.getChatHistory = function () {
        return page.chatHistory;
    };

    page.setUpAvcDisabled  = function (){
        // when !avcEnabled we skip the mediaInitPage.
        var loginPage = new MEALoginPage(page.userInfo, page.meetingInfo, page.browser);
        return loginPage.get()
            .then(function() {
                return loginPage.login(page.meetingInfo, page.userInfo);
            })
            .then(function() {
                return loginHelpers.waitForUrlToChangeTo(/main/, page.browser);
            })
            .then(function () {
                return page.browser.getCurrentUrl();}
            )
            .then(function (url) {
                logger.debug('checking if URL has main ....');
                assert(url.indexOf('main') >= 0, "main page load error: 'main' not in url");
                return Promise.resolve(true);
            });
    };

    page.setUpAvcEnabled = function () {
        // avcEnabled, so we visit the mediaInitPage.
        var mediaInitPage = new MEAMediaInitPage(page.userInfo, page.meetingInfo, page.browser);
        return mediaInitPage.setUp()
            .then(function(){
                return mediaInitPage.continueButton.click();
            })
            .then(function(){
                return loginHelpers.waitForUrlToChangeTo(/main/, page.browser);
            })
            .then(function () {
                return page.browser.getCurrentUrl();
            })
            .then(function () {
                return page.selectSideMenuButton(true);
            })
            .then(function () {
                return page.selectRosterButton(true);
            })
            .then(function () {
                return Promise.resolve(true);
            });
    };

    page.setUp = function () {
        logger.debug('In page setup!');
        if (page.meetingInfo.avcEnabled) {
            return page.setUpAvcEnabled();
        } else {
            return page.setUpAvcDisabled();
        }
    };

    page.clickEndMeetingButton = function () {
        return page.endMeetingButton.click()
            .then(function() {
                return browser.wait(function() {
                    return page.endMeeting.endMeetingOptions.isDisplayed();
                });
            });
    };
};

module.exports = MEAMainPage;