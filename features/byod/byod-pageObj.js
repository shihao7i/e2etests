var Promise = require('bluebird'),
    _ = require('lodash');

var BYOD_WAIT_TIMEOUT = 10000;

function stripQuotes(text) {
    if (text[0] === '"' && text[text.length - 1] === '"') {
        return text.substr(1, text.length - 2);
    } else {
        return text;
    }
}

var EmbeddedUser = function(userInfo, meetingInfo, browser) {
    var $ = browser.$;
    var $$ = browser.$$;
    var element = browser.element;
    var page = this;

    this.meetingInfo = meetingInfo;
    this.userInfo = userInfo;
    this.browser = browser;

    this.responsesRead = 0;
    this.responsesReturned = 0;
    this.callbackContainer = $('#protractorCallback');
    this.callbackResponses = $$('.callbackResponse');
    this.skipButton = $('[ng-click="skipClientSetup()"]');

    this.INITED_MESSAGE = {'source':'','event':'init','value': {init: true}};


    this.waitForCallbackResponse = function(nEvents) {
        nEvents = nEvents || 1;
        logger.debug('We will wait for ' + nEvents + ' events to happen');
        return page.browser.wait(function() {
            return page.callbackResponses.count()
                .then(function(n) {
                    logger.debug('Messages responded to so far:  ' + page.responsesRead);
                    logger.debug('Messages being waited on ' + nEvents);
                    logger.debug('Messages received now = ' + (n - page.responsesRead));
                    if (n !== page.responsesRead && nEvents === (n - page.responsesRead)) {
                        page.responsesRead = n;
                        return true;
                    }
                });
        }, BYOD_WAIT_TIMEOUT)
            .then(function(){
                return page.callbackResponses.reduce(function(result, elem, index) {
                    if (index + 1 > page.responsesReturned) {
                        return elem.getInnerHtml().then(function(text) {
                            logger.debug('callbackresponse = ' + text);
                            // TODO: make it a single JSON.parse
                            var parsedResponse = JSON.parse(JSON.parse(text));
                            result.push(parsedResponse);
                            return result;
                        });
                    } else {
                        return result;
                    }
                }, []);
            })
            .then(function(result) {
                page.responsesReturned = page.responsesRead;
                return result;
            });
    };

    this.loadPage = function() {
        return Promise.resolve(page.browser.driver.manage().deleteAllCookies())
            .then(function() {
                var url = meetingInfo.url;
                return page.browser.get(url);
            });
    };
};

module.exports = EmbeddedUser;