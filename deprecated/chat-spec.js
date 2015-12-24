var nconf = require('nconf');
var MEAUser = require('../helpers/userObj');
var Promise = require('bluebird');
var encryption = require('plcm-encryption');
var loginHelpers = require('../helpers/loginHelpers');
var mainHelpers = require('../helpers/mainPageHelpers');

var MEAMainPage = require('../pageObjects/mainPageObj');

var th = require('../helpers/testHelpers');
var VoidPromise = th.VoidPromise;
var utils = require('../helpers/utils');

var meaurl = loginHelpers.getMEAUrl();
var vmr = "772771";

var userInfo = nconf.get("test_config").users.authenticated[0];
nconf.file('test', 'conf.json');
nconf.load();

var meeting = { id : "779002"};

// used to alternate between different meeting id's so
// that the meetings have time to end.
var n = 0;

/******************     AVC Disabled     *************************************************/

var userParams = [
    {
        isGuest: true,
        avcEnabled: false,
        userName: 'p1',
        email: 'p1@localhost'
    },
    {
        isGuest: true,
        avcEnabled: false,
        userName: 'p2',
        email: 'p2@localhost'
    },
    {
        isGuest: true,
        avcEnabled: false,
        userName: 'p3',
        email: 'p3@localhost'
    },
    {
        isGuest: true,
        avcEnabled: false,
        userName: 'p4',
        email: 'p4@localhost'
    }
];

// Test to see if we can chat with another user
//https://github.com/angular/protractor/blob/master/spec/interaction/interaction_spec.js
describe('can log in to a static vmr and 2 users chat, avc disabled,', function() {
    var userParams = [
        {
            isGuest: true,
            avcEnabled: false,
            userName: 'p1',
            email: 'p1@localhost'
        },
        {
            isGuest: true,
            avcEnabled: false,
            userName: 'p2',
            email: 'p2@localhost'
        },
        {
            isGuest: true,
            avcEnabled: false,
            userName: 'p3',
            email: 'p3@localhost'
        },
        {
            isGuest: true,
            avcEnabled: false,
            userName: 'p4',
            email: 'p4@localhost'
        }
    ];

    var user = null;

    beforeEach(function() {
        user = [];
        if(n % 2 === 1)
            meeting.id = "779002";
        else
            meeting.id = "779001";
        n++;
    });

    afterEach(function(done) {
        done();
    });

    it('1 login on both and exchange chat messages', function() {

        th.userSetUp(user, userParams,  meeting, 2)
            .then(function () {
                expect(user[0].browser.driver.getCurrentUrl())
                    .toEqual(user[1].browser.driver.getCurrentUrl());
                return VoidPromise(); })
            .then(function (){
                return Promise.all([ user[1].selectMenu('Chat'), user[0].selectMenu('Chat')]);
            })
            .then(function () {
                expect(user[1].getChatHistory().count()).toBe(0);
                expect(user[0].getChatHistory().count()).toBe(0);
                return VoidPromise(); })
            .then(function () {
                return user[1].sendChatMessage('Hello');})
            .then(function (e) {
                expect(user[1].getChatHistory().count()).toBe(1);
                expect(user[0].getChatHistory().count()).toBe(1);
                return VoidPromise(); })
            .then(function (e) {
                return user[0].sendChatMessage('Hi 1');})
            .then(function (e) {
                expect(user[1].getChatHistory().count()).toBe(2);
                expect(user[0].getChatHistory().count()).toBe(2);
                return VoidPromise(); })
            .then(function (e) {
                return user[0].sendChatMessage('Hi 2');})
            .then(function (e) {
                return user[0].getMessage(1); })
            .then(function (msg){
                expect( msg.search(/(Hi 2)$/) ).toBeGreaterThan(-1);
                expect(user[1].getChatHistory().count()).toBe(2);
                expect(user[0].getChatHistory().count()).toBe(2);
                return VoidPromise(); })
            .then(function () { return th.tearDown(user); })
            .catch(function(error){
                expect(error).toBe(' NO ERROR');
            });

    });

    it('2 chat menu badge appears on side menu if unseen chat messages',
        function(){
            // side menu is open and on roster tab.
            th.userSetUp(user, userParams,  meeting, 2)
                .then(function () {
                    return user[1].selectMenu('Roster'); })

                // chat badge should be hidden.
                .then(function () {
                    expect(mainHelpers.elemIsHidden(
                        user[1].mainPage.sideMenu.chat.badge)).toBe(true);
                    return VoidPromise(); })
                .then(function () {
                    return user[0].selectMenu('Chat'); })
                .then(function () {
                    return user[0].sendChatMessage('P2 says Hello');})

                //  ---- user[2] should now have a badge showing
                .then(function () {
                    expect(mainHelpers.elemIsHidden(
                        user[1].mainPage.sideMenu.chat.badge)).toBe(false);})
                .then(function () { return th.tearDown(user); })
                .catch(function(error){
                    expect(error).toBe(' not happen');
                });
        });

    it('3 header chat notification indicator appears if no tabs are open',
        function(){
            var indicator = null;
            th.userSetUp(user, userParams,  meeting, 2)

                // side menu should be closed
                .then(function() { return user[0].selectMenu(false); })

                // chat notification indicator should be hidden.
                .then(function () {
                    indicator = user[0].mainPage.sideMenu.chat.notificationIndicator;
                    return VoidPromise(); })

                .then(function () {
                    expect(mainHelpers.elemIsHidden(indicator)).toBe(true);
                    return VoidPromise(); })
                .then(function () { return user[1].selectMenu('Chat');})
                .then(function () { return user[1].sendChatMessage('P2 says Hello');})

                // p1 should now have an indicator showing
                .then(function () {
                    expect(mainHelpers.elemIsHidden(indicator)).toBe(false); })
                .then(function () { return th.tearDown(user); })
                .catch(function(error){
                    expect(error).toBe(' not happen');
                });
        });

    // TODO: I dont know how to retrieve the badge count value.
    // xit('4 chat menu badge count value is correct',function(){
    //     // stub
    // });

    // //TODO: I dont know how to retrieve the header-chat-notification-indicator-count value.
    // xit('5 header chat notification indicator has correct count value',function(){
    //     // stub
    // });

    it('6 clicking header chat notification indicator takes us to chat area',
        function(){
            var indicator = null;
            th.userSetUp(user, userParams,  meeting, 2)
                .then(function(){
                    indicator = user[0].mainPage.sideMenu.chat.notificationIndicator;
                    return VoidPromise(); })

                // side menu should be closed
                .then(function(){   return user[0].selectMenu(false); })
                .then(function () { return user[1].selectMenu('Chat');})
                .then(function () { return user[1].sendChatMessage('P2 says Hello');})

                // user[0] should now have an indicator showing
                .then(function(){
                    return indicator.click(); })

                // user[0] should now have the chat tab open
                .then(function (){
                    expect(mainHelpers.elemIsActive(user[0].mainPage.sideMenu.chatButton))
                        .toBe(true); })
                .then(function () { return th.tearDown(user); })
                .catch(function(error){
                    expect(error).toBe('NO ERROR');
                });
        });

    it('7 chat history is there when re-joining a meeting previously left',
        function(){
            var user1ChatCount = null;
            th.userSetUp(user, userParams,  meeting, 2)
                .then(function () { return Promise.join(
                    user[1].selectMenu('Chat'),
                    user[0].selectMenu('Chat'),
                    user[1].sendChatMessage('user2  text'),
                    user[0].sendChatMessage('user1 text1'),
                    user[1].sendChatMessage('user2 text2'),
                    user[0].sendChatMessage('user1 text2'));
                })
                .then(function(){
                    user1ChatCount = user[0].getChatHistory().count();
                    return VoidPromise(); })
                .then(function () {

                    return Promise.join(
                        user[0].userLogout(),
                        user[0].goToMainPage(),
                        user[0].selectMenu('Chat'),
                        VoidPromise ); })
                .then(function(){
                    expect(user[0].getChatHistory().count()).toBe(user1ChatCount); })
                .then(function () { return th.tearDown(user); })
                .catch(function(error){
                    expect(error).toBe('NO ERROR');
                });
        });

    // xit('8 chat history is there when joining a meeting in progress', function(){
    //     // stub
    // });

});

xdescribe('can log in to a static vmr and chat with 4 users', function() {
    var userParams = [
        {
            isGuest: true,
            avcEnabled: false,
            userName: 'p1',
            email: 'p1@localhost'
        },
        {
            isGuest: true,
            avcEnabled: false,
            userName: 'p2',
            email: 'p2@localhost'
        },
        {
            isGuest: true,
            avcEnabled: false,
            userName: 'p3',
            email: 'p3@localhost'
        },
        {
            isGuest: true,
            avcEnabled: false,
            userName: 'p4',
            email: 'p4@localhost'
        }
    ];

    var originalTimeout = null;
    var user = null;

    beforeEach(function() {
        user = [];
        if(n % 2 === 1)
            meeting.id = "779002";
        else
            meeting.id = "779003";
        n++;

        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 5 * 60 * 1000;
    });

    afterEach(function(done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        done();
    });

    it('login on all 4 and exchange chat messages', function(done) {
        th.userSetUp(user, userParams,  meeting, 4)
            .then(function() {
                th.expectAllUrlToBe(user, user[0].browser.driver.getCurrentUrl());
                return VoidPromise(); })
    
            .then(function () {
                return  Promise.join(user[0].selectMenu('Chat'),
                    user[1].selectMenu('Chat'),
                    user[2].selectMenu('Chat'),
                    user[3].selectMenu('Chat')); })
            .then(function () {
                th.expectAllHistoryToBe(user, 0);
                return VoidPromise(); })

            .then(function () {
                        return user[0].sendChatMessage('p1 text 1'); })

            .then(function () {
                th.expectAllHistoryToBe(user, 1);
                return VoidPromise(); })

            .then(function () {
                return Promise.join(user[1].sendChatMessage('p2 text 1'),
                    user[2].sendChatMessage('p3 text 1'),
                    user[3].sendChatMessage('p4 text 1')); })

            .then(function () {
                th.expectAllHistoryToBe(user, 4);
                return VoidPromise(); })

            .then(function () {
                return Promise.join(user[0].sendChatMessage('p1 text 2'),
                    user[1].sendChatMessage('p2 text 2'),
                    user[2].sendChatMessage('p3 text 2'),
                    user[3].sendChatMessage('p4 text 2')); })

            .then(function () {
                th.expectAllHistoryToBe(user, 8);
                return VoidPromise(); })

            .then(function () { return th.tearDown(user, true); })
            .then(done)
            .catch(function(error){
                expect(error).toBe(' not happen');
            });
    });
});


/******************     AVC Enabled     ************************************************/
// TODO: meeting diconnects are more frequent with avc enabled so i x'ed them out for now - Davan
// Test to see if we can chat with another user
//https://github.com/angular/protractor/blob/master/spec/interaction/interaction_spec.js
xdescribe('can log in to a static vmr and 2 users chat, avc enabled,', function() {
    var userParams = [
        {
            isGuest: true,
            avcEnabled: true,
            userName: 'p1',
            email: 'p1@localhost'
        },
        {
            isGuest: true,
            avcEnabled: true,
            userName: 'p2',
            email: 'p2@localhost'
        },
        {
            isGuest: true,
            avcEnabled: true,
            userName: 'p3',
            email: 'p3@localhost'
        },
        {
            isGuest: true,
            avcEnabled: true,
            userName: 'p4',
            email: 'p4@localhost'
        }
    ];

    var user = null;

    beforeEach(function() {
        user = [];
        if(n % 2 === 1)
            meeting.id = "779002";
        else
            meeting.id = "779001";
        n++;
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 5 * 60 * 1000;
    });

    afterEach(function(done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        done();
    });

    it('1 login on both and exchange chat messages', function() {

        th.userSetUp(user, userParams,  meeting, 2)
            .then(function () {
                expect(user[0].browser.driver.getCurrentUrl())
                    .toEqual(user[1].browser.driver.getCurrentUrl());
                return VoidPromise(); })
            .then(function (){
                return Promise.all([ user[1].selectMenu('Chat'), user[0].selectMenu('Chat')]);
            })
            .then(function () {
                expect(user[1].getChatHistory().count()).toBe(0);
                expect(user[0].getChatHistory().count()).toBe(0);
                return VoidPromise(); })
            .then(function () {
                return user[1].sendChatMessage('Hello 1');})
            .then(function (e) {
                expect(user[1].getChatHistory().count()).toBe(1);
                expect(user[0].getChatHistory().count()).toBe(1);
                return VoidPromise(); })
            .then(function (e) {
                return user[0].sendChatMessage('Hi there');})
            .then(function (e) {
                expect(user[1].getChatHistory().count()).toBe(2);
                expect(user[0].getChatHistory().count()).toBe(2);
                return VoidPromise(); })
            .then(function () { return th.tearDown(user); })
            .catch(function(error){
                user[0].browser.pause();
                expect(error).toBe(' not happen');
            });

    });

    it('2 chat menu badge appears on side menu if unseen chat messages',
        function(){
            // side menu is open and on roster tab.
            th.userSetUp(user, userParams,  meeting, 2)
                .then(function () {
                    return user[1].selectMenu('Roster'); })

                // chat badge should be hidden.
                .then(function () {
                    expect(mainHelpers.elemIsHidden(
                        user[1].mainPage.sideMenu.chat.badge)).toBe(true);
                    return VoidPromise(); })
                .then(function () {
                    return user[0].selectMenu('Chat'); })
                .then(function () {
                    return user[0].sendChatMessage('P2 says Hello');})

                //  ---- user[2] should now have a badge showing
                .then(function () {
                    expect(mainHelpers.elemIsHidden(
                        user[1].mainPage.sideMenu.chat.badge)).toBe(false);})
                .then(function () { return th.tearDown(user); })
                .catch(function(error){
                    user[0].browser.pause();
                    expect(error).toBe(' not happen');
                });
        });

    it('3 header chat notification indicator appears if no tabs are open',
        function(){
            var indicator = null;
            th.userSetUp(user, userParams,  meeting, 2)

                // side menu should be closed
                .then(function() { return user[0].selectMenu(false); })

                // chat notification indicator should be hidden.
                .then(function () {
                    indicator = user[0].mainPage.sideMenu.chat.notificationIndicator;
                    return VoidPromise(); })

                .then(function () {
                    expect(mainHelpers.elemIsHidden(indicator)).toBe(true);
                    return VoidPromise(); })
                .then(function () { return user[1].selectMenu('Chat');})
                .then(function () { return user[1].sendChatMessage('P2 says Hello');})
                // p1 should now have an indicator showing
                .then(function () {
                    expect(mainHelpers.elemIsHidden(indicator)).toBe(false);})
                .then(function () { return th.tearDown(user); })
                .catch(function(error){
                    user[0].browser.pause();
                    expect(error).toBe(' not happen');
                });
        });

    it('6 clicking header chat notification indicator takes us to chat area',
        function(){
            var indicator = null;
            th.userSetUp(user, userParams,  meeting, 2)
                .then(function(){
                    indicator = user[0].mainPage.sideMenu.chat.notificationIndicator;
                    return VoidPromise(); })

                // side menu should be closed
                .then(function(){   return user[0].selectMenu(false); })
                .then(function () { return user[1].selectMenu('Chat');})
                .then(function () { return user[1].sendChatMessage('P2 says Hello!');})

                // user[0] should now have an indicator showing
                .then(function(){
                    return indicator.click(); })

                // user[0] should now have the chat tab open
                .then(function (){
                    expect(mainHelpers.elemIsActive(
                        user[0].mainPage.sideMenu.chatButton)); })
                .then(function () { return th.tearDown(user); })
                .catch(function(error){
                    user[0].browser.pause();
                    expect(error).toBe('NO ERROR');
                });
        });

    it('7 chat history is there when re-joining a meeting previously left',
        function(){
            var user1ChatCount = null;
            th.userSetUp(user, userParams,  meeting, 2)
                .then(function () { return Promise.join(
                    user[1].selectMenu('Chat'),
                    user[0].selectMenu('Chat'),
                    user[1].sendChatMessage('user2  text1'),
                    user[0].sendChatMessage('user1 text1'),
                    user[1].sendChatMessage('user2 text2'),
                    user[0].sendChatMessage('user1 text2'));
                })
                .then(function(){
                    user1ChatCount = user[0].getChatHistory().count();
                    return VoidPromise(); })
                .then(function () {
                    return Promise.join(
                        user[0].userLogout(),
                        user[0].goToMainPage(),
                        user[0].selectMenu('Chat'));})
                .then(function(){
                    expect(user[0].getChatHistory().count()).toBe(user1ChatCount); })
                .then(function () { return th.tearDown(user); })
                .catch(function(error){
                    user[0].browser.pause();
                    expect(error).toBe('NO ERROR');
                });
        });
});




xdescribe('can log in to a static vmr and chat with 4 users, avc enabled', function() {
    var userParams = [
        {
            isGuest: true,
            avcEnabled: true,
            userName: 'p1',
            email: 'p1@localhost'
        },
        {
            isGuest: true,
            avcEnabled: true,
            userName: 'p2',
            email: 'p2@localhost'
        },
        {
            isGuest: true,
            avcEnabled: true,
            userName: 'p3',
            email: 'p3@localhost'
        },
        {
            isGuest: true,
            avcEnabled: true,
            userName: 'p4',
            email: 'p4@localhost'
        }
    ];


    var originalTimeout = null;
    var user = null;

    beforeEach(function() {
        user = [];
        if(n % 2 === 1)
            meeting.id = "779002";
        else
            meeting.id = "779001";
        n++;
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 5 * 60 * 1000;
    });

    afterEach(function(done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        done();
    });

    it('login on all 4 and exchange chat messages', function() {
        th.userSetUp(user, userParams,  meeting, 4)
            .then(function() {
                th.expectAllUrlToBe(user, user[0].browser.driver.getCurrentUrl());
                return VoidPromise(); })
            .then(function () {
                return  Promise.join(user[0].selectMenu('Chat'),
                    user[1].selectMenu('Chat'),
                    user[2].selectMenu('Chat'),
                    user[3].selectMenu('Chat'),
                    function(){ return VoidPromise(); }); })
            .then(function () {
                th.expectAllHistoryToBe(user, 0);
                return VoidPromise(); })
            .then(function () { return user[0].sendChatMessage('p1 text 1'); })
            .then(function () {
                th.expectAllHistoryToBe(user, 1);
                return VoidPromise(); })
            .then(function () {
                return Promise.join(user[1].sendChatMessage('p2 text 1'),
                    user[2].sendChatMessage('p3 text 1'),
                    user[3].sendChatMessage('p4 text 1'),
                    function(){ return VoidPromise(); }); })
            .then(function () {
                th.expectAllHistoryToBe(user, 4);
                return VoidPromise(); })
            .then(function () {
                return Promise.join(user[0].sendChatMessage('p1 text 2'),
                    user[1].sendChatMessage('p2 text 2'),
                    user[2].sendChatMessage('p3 text 2'),
                    user[3].sendChatMessage('p4 text 2'),
                    function(){ return VoidPromise(); }); })
            .then(function () {
                th.expectAllHistoryToBe(user, 8);
                return VoidPromise(); })
            .then(function () { return th.tearDown(user, true); })
            .catch(function(error){
                user[0].browser.pause();
                expect(error).toBe(' NO ERROR');
            });
    });

    it('test stub',function(){
        // stub
    });

});