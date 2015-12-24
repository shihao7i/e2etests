/**
 * Created by vharrison on 8/13/2015.
 */

var nconf           = require('nconf');
var Promise         = require('bluebird');
var MEALoginPage    = require('../pageObjects/loginPageObj');
var MEAUser         = require('../helpers/userObj');
var loginHelpers    = require('../helpers/loginHelpers');
var mainPageHelpers = require('../helpers/mainPageHelpers');
var utils           = require('../helpers/utils');

var assert = require('assert');
var th = require('../helpers/testHelpers');
var VoidPromise = th.VoidPromise;

nconf.file('test', 'conf.json');
nconf.file('permission', '../permissions.json');
nconf.load();

var meaurl = nconf.get('environments')[0].general.urls.internal_secure;

var authUserParams = nconf.get("test_config").users.authenticated;
th.setGuestAndAvcForAll(false, true, authUserParams);

var guestUserParams = nconf.get("test_config").users.guest;
th.setGuestAndAvcForAll(true, true, guestUserParams);

fdescribe('Chair person says Hello World!', function(){
    var  meeting = { id : "779002"};
    var originalTimeout = null;

    var chairParams = null;
    var guestParams = null;
    var attendeeCount = null;
    var user = null;
    var userParams = null;
    beforeEach(function() {
        attendeeCount = 10; //browser.params.numAttendees;
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 3 * 60 * 1000;

        var instNum = browser.params.instanceNum;
        switch(instNum === 0){
            case true:
                th.cleanMeetingInfo();
                chairParams = authUserParams[0];
                chairParams.chair = true;
                userParams = chairParams;
                break;
            case false:
                guestParams = guestUserParams[instNum -1];
                guestParams.chair = false;
                userParams = guestParams;
                break;
        }

        //user = new MEAUser(userParams, meeting, browser);

    });

    afterEach(function(done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        done();
    });

    it('sends a chat message', function(done) {

        //meetingSetUp(userParams, browser)
        //print('browser: ----------------------------------------------------------');
       ////print('browser.wait: ' + browser.wait );

       //var temp = browser.wait(function(){
       //    print('inside wait  ...................................................');
       //    for(var i =0; i < 100; i++){
       //        if (i ===99) return true;
       //    }
       //});

       //print('temp: ');
       //printObj(temp);

       ////VoidPromise()

       //temp.then(function(){
       //    print('then1');
       //    done();
       //});
       ////printObj(browser);


        th.meetingSetUp(userParams, browser)
            .then(function(meeting){
                user = new MEAUser(userParams, meeting, browser);
                return user.goToMainPage(); })
            .then(function(){
                return th.waitForAllAttendeesToLogIn(user, attendeeCount); })
            .then(function(){
                return user.selectMenu('Chat'); })
            .then(function(){
                return user.sendChatMessage('Hello World!'); })
            .then(function(){
                return th.waitForChatHistory(user, attendeeCount) ;})

            //.then(function(){
            //    return VoidPromise();
            //})
            .then(function(){
                th.cleanMeetingInfo();
                logger.trace('all done! ');
                done(); });
            //.catch(function(error){
            //    expect(error).toBe(' NO ERROR');
            //});

    });
});

