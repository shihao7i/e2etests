/**
 * Created by vharrison on 7/14/2015.
 */

var Promise = require('bluebird');
var mainHelper = require('../helpers/mainPageHelpers');
var utils = require('../helpers/utils');

var ChatObj = function(userInfo, meetingInfo, browserInst){
    var chat  = this;
    var $ = browserInst.$;
    var $$ = browserInst.$$;
    var element = browserInst.element;

    chat.name = "sideMenuChatButton";
    chat.button = element(by.css(".chat.menu-button"));
    // the second item in ng-repeat list is at index 1.
    var chatIndex = 1;
    chat.badge = element.all(by.css(".menu-badge")).get(chatIndex);
    chat.badgeCount = element.all(by.css(".menu-badge-count.ng-binding")).get(chatIndex);

    chat.notificationIndicator = element(by.css(
        ".header-chat-notification-indicator.header-float-right.ng-binding"));

    // Chat options
    chat._newTextArea = element(by.model('newMessage'));
    chat._history = element.all(by.repeater("n in messages"));

    chat.sendMessage = function(mesg) {
        function waitForMessageToPost(){
            return browserInst.wait(function(){
                return chat.getMostRecent()
                    .then(function(text){
                        // if there is no chat history then text will be null
                        // until the message posts.
                        if(text) {
                            var re = new RegExp('(' + mesg + ')$');
                            return text.search(re) > -1;
                        } else{
                            return false;
                        }
                    });
            });
        }
        return chat._newTextArea.sendKeys(mesg, protractor.Key.ENTER)
            .then(waitForMessageToPost);
    };

    chat.getHistory = function(){
        return chat._history;
    };

    chat.getMostRecent = function(){
        return chat.getMessage(1);
    };

    chat.getMessage = function(num){
        return chat._history.count()
            .then(function(count){
                return chat._history.get(count - num).getText();
            });
    };
};

module.exports = ChatObj;