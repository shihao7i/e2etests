var Promise      = require('bluebird'),
    utils        = require('../helpers/utils'),
    nconf        = require('nconf'),
    MEALoginPage = require('./loginPageObj'),
    loginHelpers = require('../helpers/loginHelpers'),
    MEAURL       = loginHelpers.getMEAUrl();


var MEAMediaInitPage = function(userInfo, meetingInfo, browserInst) {
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

    page.url         = MEAURL + '/' + meetingInfo.id;
    page.browser     = browserInst;
    page.userInfo    = userInfo;
    page.meetingInfo = meetingInfo;

    // MediaInit Elements
    page.continueButton = $('[ng-click="continueToMeeting()"]');
    page.cancelButton   = $('[ng-click="cancel()"]');
    page.videoPreview   = $('.webrtc-video-preview');
    page.cameraButton   = $('[ng-click="toggleVideoButton = !toggleVideoButton; loginControl(\'Video\', toggleVideoButton);"]');
    page.micButton      = $('[ng-click="toggleMicButton = !toggleMicButton; loginControl(\'Mic\', toggleMicButton);"]');
    page.speakersButton = $('[ng-click="toggleVolumeButton = !toggleVolumeButton; loginControl(\'Volume\', toggleVolumeButton);"]');

    // MediaInit Method
    page.getVideoPreviewCoordinates = function() {
        var coords = {};
        return page.browser.executeScript(function(){ return $('.webrtc-video-preview').offset(); })
            .then(function(offset) {
                coords.x = offset.top;
                coords.y = offset.left;
                return page.browser.executeScript(function() {
                    return $('.webrtc-video-preview').width();
                });
            })
            .then(function(width) {
                coords.width = width;
                return page.browser.executeScript(function() {
                    return $('.webrtc-video-preview').height();
                });
            })
            .then(function(height) {
                coords.height = height;
                return coords;
            });
    };

    page.setUp = function(){
        var loginPage = new MEALoginPage(page.userInfo, page.meetingInfo, page.browser);
        return loginPage.get()
            .then(function(){
                return loginPage.login(page.meetingInfo, page.userInfo);
            })
            .then(function(){
                return loginHelpers.waitForUrlToChangeTo(/caxisMediaInitialization/, page.browser);
            })
            .then(function(){
                return page.browser.getCurrentUrl();
            });
    };
};


module.exports = MEAMediaInitPage;