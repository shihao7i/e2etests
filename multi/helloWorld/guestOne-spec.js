var nconf           = require('nconf');
var Promise         = require('bluebird');
var MEALoginPage    = require('../../pageObjects/loginPageObj');
var MEAUser         = require('../../helpers/userObj');
var loginHelpers    = require('../../helpers/loginHelpers');
var mainPageHelpers = require('../../helpers/mainPageHelpers');
var utils           = require('../../helpers/utils');

var assert = require('assert');
var th = require('../../helpers/testHelpers');
var VoidPromise = th.VoidPromise;

nconf.file('test', 'conf.json');
nconf.file('permission', '../permissions.json');
nconf.load();

var meaurl = nconf.get('environments')[0].general.urls.internal_secure;

var guestParams = {
    isGuest: true,
    avcEnabled: false,
    userName: 'p1',
    email: 'p1@localhost'
};

describe('Guest user says Hello World!', function(){
    var  meeting = { id : "779002"};
    var attendeeCount = 2;

    var originalTimeout = null;
    var guestUser = null;
    beforeEach(function() {
        guestUser = new MEAUser(guestParams, meeting, browser);

        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 2 * 60 * 1000;
    });

    afterEach(function(done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        done();
    });

    it('sends a chat message', function(done) {
        logger.debug('guestUser' + guestUser);
        //guestUser.goToMainPage()
        //    .then(function(){
        //        return Promise.join(
        //            th.waitForAllAttendeesToLogIn(guestUser, attendeeCount),
        //            guestUser.selectMenu('Chat'),
        //            guestUser.sendChatMessage('Hello World!'),
        //            th.waitForChatHistory(guestUser, 2)
        //        );
        //    })
        //    .then(function(){
                //expect(guestUser.browser.instanceNum).toBe(1);

                logger.debug('guestUser.browser.instanceNum: ');
                logger.debug(guestUser.browser.params);

                //print('guestUser.browser: ' );
                //printObj(guestUser.browser);
        //    })
//
        //    .then(function(){ done(); })
        //    .catch(function(error){
        //        expect(error).toBe(' NO ERROR');
        //    });

        done();

    });
});