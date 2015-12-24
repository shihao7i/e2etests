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

var authUserInfo = nconf.get("test_config").users.authenticated[0];
authUserInfo.isGuest = false;
authUserInfo.avcEnabled = false;


describe('Chair person says Hello World!', function(){
    var  meeting = { id : "779002"};
    var attendeeCount = 2;

    var originalTimeout = null;
    var chairParams = null;
    var chairUser = null;
    beforeEach(function() {
        chairParams = authUserInfo;
        chairUser = new MEAUser(chairParams, meeting, browser);

        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 2 * 60 * 1000;
    });

    afterEach(function(done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        done();
    });

    it('sends a chat message', function(done) {
        logger.debug('chairUser' + chairUser);
        //chairUser.goToMainPage()
        ////   .then(function(){
        //       return Promise.join(
        //           th.waitForAllAttendeesToLogIn(chairUser, attendeeCount),
        //           chairUser.selectMenu('Chat'),
        //           chairUser.sendChatMessage('Hello World!'),
        //           th.waitForChatHistory(chairUser, 2)
        //       );
        //   })
        //    .then(function(){

                //expect(chairUser.browser.instanceNum).toBe(0);

                logger.debug('chairUser.browser.instanceNum: ');
                logger.debug(chairUser.browser.params);

                //print('chairUser.browser: ' );
                //printObj(chairUser.browser);
        //        return VoidPromise();
        //    })
//
        //    .then(function(){ done(); })
        //    .catch(function(error){
        //        expect(error).toBe(' NO ERROR');
        //    });
        done();
    });
});
