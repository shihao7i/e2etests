/**
 * Created by vharrison on 8/19/2015.
 */

var nconf           = require('nconf');
var Promise         = require('bluebird');
var MEALoginPage    = require('../pageObjects/loginPageObj');
var MEAUser         = require('../helpers/userObj');
var loginHelpers    = require('../helpers/loginHelpers');
var mainPageHelpers = require('../helpers/mainPageHelpers');
var utils           = require('../helpers/utils');
var print           = utils.print;
var printObj        = utils.printObj;

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

xdescribe('Chair person says Hello World!', function() {
    var meeting = { id : browser.params.vmr };
    var originalTimeout = null;
    var user = null;
    var userParams = null;

    beforeEach(function() {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 3 * 60 * 1000;


        userParams = guestUserParams[0];
        user = new MEAUser(userParams, meeting, browser);

    });

    afterEach(function(done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        done();
    });

    it('sends a chat message', function(done) {
        user.goToMainPage();
    });
});

xdescribe('test file io', function(){

    var file = './testFile.txt';
    var message = ' test file message';


    it('write file', function(){
        fs.writeFileSync(file, message);
    });

    it('read file', function(){
        var exists = fs.existsSync(file);
        print('the file exists: ' + exists);

        var contents = fs.readFileSync(file, 'utf8');
        print('the file contents : ', contents);

    });
});