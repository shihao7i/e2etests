//http://angular.github.io/protractor/#/page-objects
var Promise = require('bluebird');
var EmbeddedPage = function(pageUrl) {
    var page = this;
    var element = browser.element;
    var $ = browser.$;
    var $$ = browser.$$;
    page.avcEnabledCheckbox = element(by.model('$parent.areAVCEnabled'));
    page.continueButton = $('[ng-click="continueToMeeting()"]');
    page.cancelButton = $('[ng-click="cancel()"]');

    page.url = pageUrl;

    page.get = function() {
        return Promise.resolve(browser.get(pageUrl))
            .then(function() {
                logger.debug('We have the page waiting for elements to load');
                return page.waitForAVCOptionToAppear();
            });
    };

    page.continue = function(params) {
        // Wait for AVC option to be enabled
        return page.waitForAVCOptionToAppear()
            .then(function() {
                return page.setAVCMode(params.avcEnabled);
            })
            .then(function() {
                return page.continueButton.click();
            });
    };

    page.isAVCEnabled = function() {
        return page.avcEnabledCheckbox.isSelected();
    };

    page.setAVCMode = function(mode) {
        return page.avcEnabledCheckbox.isSelected()
            .then(function(checked) {
                if (checked === mode) {
                    return true;
                } else {
                    return page.avcEnabledCheckbox.click();
                }
            });
    };

    page.waitForAVCOptionToAppear = function() {
        return browser.wait(function() {
            logger.debug('in wait ');
            return page.continueButton.isDisplayed()
                .then(function(value) {
                    logger.debug('waiting for toggle to appear');
                    return value === true;
                });
        }, 50000);
    };
};


module.exports = EmbeddedPage;