var Chat       = require('./chatPageObj'),
    Roster     = require('./rosterPageObj'),
    Promise    = require('bluebird'),
    utils      = require('../helpers/utils');

var Settings = function(browserInst){
    // stub
};
var Help = function(browserInst){
    // stub
};

var SideMenu = function(userInfo, meetingInfo, browserInst){
    var menu = this,
        $,
        $$,
        element;

    if (browserInst === undefined) {
        browserInst = browser;
    }
    $ = browserInst.$;
    $$ = browserInst.$$;
    element = browserInst.element;

    // For Taking Screen Shot
    menu.menuItemsArea = $('[ng-model="menuItems"]');

    // For Checking If Area Is Displayed
    menu.addParticipantArea = $('.menu-sub-content');

    // This element works for clicking in chrome but not firefox.
    // Use this element for testing if menue is active in Chrome and Firefox.
    menu.menuButtonByClass    = element(by.css(".header-menu-right-button.header-float-right"));

    menu.chatButton           = element(by.css(".chat.menu-button"));
    menu.rosterButton         = element(by.css(".roster"));
    menu.addParticipantButton = element(by.css(".add.menu-button"));
    menu.settingsButton       = element(by.css(".settings.menu-button"));
    menu.helpButton           = element(by.css(".help.menu-button"));

    // For Adding Participant in Roster
    menu.linkToJoinTheMeeting = element(by.repeater('item in meetingInfo').row(1).column('item.title'));
    menu.vmrNumber = element(by.repeater('item in meetingInfo').row(3).column('item.title'));
    //menu.expectedVMRNumber = element(by.repeater('item in meetingInfo').row(3)).all(by.css('span')).get(0);
    menu.internetSip = element(by.repeater('item in meetingInfo').row(3).column('item.title'));
    menu.otherDetailsPanel = $('.title-column.title-icon');
    menu.otherDetailsButton = $('[ng-click="isOtherDetailsOpen=!isOtherDetailsOpen"]');

    menu.roster = new Roster(userInfo, meetingInfo, browserInst);
    menu.chat = new Chat(userInfo, meetingInfo, browserInst);
    menu.settings = new Settings(browserInst);
    menu.help = new Help(browserInst);

    menu.addParticipantHelper = {
        getAddParticipantSelector: function() {
            return $$('[ng-repeat="item in meetingInfo"]');
        },
        getLinkToJoinMeeting: function() {
            return this.getAddParticipantSelector().get(1).getText();
        }
    };
};

module.exports = SideMenu;