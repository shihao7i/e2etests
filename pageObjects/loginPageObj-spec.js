var nconf = require('nconf'),
    MEALoginPage = require('./loginPageObj'),
    MEAUser = require('../helpers/userObj'),
    loginHelpers = require('../helpers/loginHelpers'),
    th = require('../helpers/testHelpers'),
    _ = require('lodash');

nconf.file('test', 'conf.json');
nconf.load();

var meaurl = loginHelpers.getMEAUrl();

var userInfo = nconf.get("test_config").users.authenticated[0];

var meetingInfo = nconf.get("test_config").meetings.default[0];

var saveScreenShots = nconf.get("test_config").pixdiff.generate,
    testScreenShots = nconf.get("test_config").pixdiff.test;

// spec.js
describe('can use the loginPage object', function () {
    var page = null;
    var user = null;
    var meetingObj = _.extend({pin:'234'}, meetingInfo);

    beforeEach(function(done) {
        user = new MEAUser({}, meetingObj, browser);
        user.goToLoginPage()
            .then(function() {
                page = user.loginPage;
                done();
            });
    });

// assert that we are in the page we want to be in
    it('can take us to the login page', function() {
        expect(browser).not.toBe(undefined);
        expect(meaurl).not.toBe(undefined);
        expect(loginHelpers.waitForUrlToChangeTo(/login/, browser)).toBeTruthy();
    });

    it('has the UI we expect', function() {
        expect(page.nameInput.getAttribute('value')).toEqual('');
        expect(page.passwordInput.getAttribute('value')).toEqual('');
        expect(page.meetingIDInput.getAttribute('value')).toEqual('');
        expect(page.meetingPinInput.getAttribute('value')).toEqual('');
        //buttons
        expect(page.avcEnabledCheckbox.isSelected()).toBeTruthy();
        expect(page.isGuestMode()).toBe(false);
        expect(page.rememberMeCheckbox.isSelected()).toBe(false);
        if (saveScreenShots) {
            expect(browser.pixdiff.saveScreen('loginpage_start')).not.toBeNull();
        }
        if (testScreenShots) {
            expect(browser.pixdiff.checkScreen('loginpage_start')).toMatch();
        }
    });
    // assert that we are in the page we want to be in
    it('can take us to the login page', function() {
        expect(browser).not.toBe(undefined);
        expect(meaurl).not.toBe(undefined);
        expect(loginHelpers.waitForUrlToChangeTo(/login/, browser)).toBeTruthy();
    });

    it('can toggle guest mode', function() {
        expect(page.isGuestMode()).toBe(false);
        expect(page.setGuestMode(true)).toBe(true);
        expect(page.nameInput.getAttribute('value')).toEqual('');
        expect(page.emailInput.getAttribute('value')).toEqual('');
    });

    it('shows AVC Help tooltip we expect', function() {
        browser.actions().mouseMove(page.avcHelpIcon).perform().then(function(){
            expect(page.tooltipContent.isDisplayed()).toBeTruthy();
            if (saveScreenShots) {
                expect(browser.pixdiff.saveRegion(page.tooltipContent, 'avc-tooltip')).not.toBeNull();
            }
            if (testScreenShots) {
                expect(browser.pixdiff.checkRegion(page.tooltipContent, 'avc-tooltip')).toMatch();
            }
        });
    });

    it('can toggle AVC mode', function() {
        page.setAVCMode(true);
        expect(page.isAVCEnabled()).toBe(true);
        page.setAVCMode(false);
        expect(page.isAVCEnabled()).toBe(false);
    });

    it('can toggle remember me', function() {
        expect(page.rememberMeCheckbox.isSelected()).toBe(false);
        page.rememberMeCheckbox.click();
        expect(page.rememberMeCheckbox.isPresent()).toBe(true);
        page.rememberMeCheckbox.click();
        expect(page.rememberMeCheckbox.isSelected()).toBe(false);
    });

    it('can add meetingID and meetingPin', function() {
        page.meetingIDInput.sendKeys(page.meetingInfo.id);
        expect(page.meetingIDInput.getAttribute('value')).toEqual(page.meetingInfo.id);
        page.meetingPinInput.sendKeys(page.meetingInfo.pin);
        expect(page.meetingPinInput.getAttribute('value')).toEqual(page.meetingInfo.pin);
    });

    it('can fill in guest information', function() {
        expect(page.setGuestMode(true)).toBe(true);
        expect(page.nameInput.getAttribute('value')).toEqual('');
        expect(page.emailInput.getAttribute('value')).toEqual('');
        page.nameInput.sendKeys('name');
        expect(page.nameInput.getAttribute('value')).toEqual('name');
        page.emailInput.sendKeys('guest@localhost');
        expect(page.emailInput.getAttribute('value')).toEqual('guest@localhost');
    });

    it('can fill in authenticated user information', function() {
        expect(page.nameInput.getAttribute('value')).toEqual('');
        expect(page.passwordInput.getAttribute('value')).toEqual('');
        page.nameInput.sendKeys('ProTractor');
        page.passwordInput.sendKeys('abc');
        expect(page.nameInput.getAttribute('value')).toEqual('ProTractor');
        expect(page.passwordInput.getAttribute('value')).toEqual('abc');
    });

    it('can work with all the page elements', function() {
        expect(page.setGuestMode(true)).toBe(true);
        expect(page.nameInput.getAttribute('value')).toEqual('');
        expect(page.emailInput.getAttribute('value')).toEqual('');
        page.nameInput.sendKeys('name');
        expect(page.nameInput.getAttribute('value')).toEqual('name');
        page.emailInput.sendKeys('guest@localhost');
        expect(page.emailInput.getAttribute('value')).toEqual('guest@localhost');

        page.guestCheckbox.click();
        expect(page.nameInput.getAttribute('value')).toEqual('name');
        expect(page.passwordInput.getAttribute('value')).toEqual('');
        page.passwordInput.sendKeys('abc');
        expect(page.passwordInput.getAttribute('value')).toEqual('abc');

        page.rememberMeCheckbox.click();

        page.meetingIDInput.sendKeys(page.meetingInfo.id);
        expect(page.meetingIDInput.getAttribute('value'))
            .toEqual(page.meetingInfo.id);
        page.meetingPinInput.sendKeys(page.meetingInfo.pin);
        expect(page.meetingPinInput.getAttribute('value'))
            .toEqual(page.meetingInfo.pin);

        page.setAVCMode(true);
        expect(page.isAVCEnabled()).toBe(true);
        page.setAVCMode(false);
        expect(page.isAVCEnabled()).toBe(false);
        browser.actions().mouseMove(page.avcHelpIcon).perform().then(function(){
            expect(page.tooltipContent.isDisplayed()).toBeTruthy();
        });
    });
});

//https://confluence.polycom.com:8443/display/CLARCH/Client+API+-+String+parameters
describe('login page pre-populates fields given in query parameter', function () {
    var meetingObj;
    beforeEach(function () {
        meetingObj = meetingInfo;
    });

    it('can accept guest user info in url', function () {
        meetingObj.url = meaurl + '/?address=john.doe@contoso.com&username=john&realm=anonymous';
        var user = new MEAUser({}, meetingObj, browser);
        user.goToLoginPage()
            .then(function () {
                browser.sleep(3000);
            })
            .then(function () {
                expect(user.loginPage.joiningAsDisplayName.evaluate('displayName')).toEqual('john');
            });
    });

    it('can accept meeting info in url', function () {
        meetingObj.url = meaurl + '/?meeting=7777&pin=123';
        var user = new MEAUser({}, meetingObj, browser);
        user.goToLoginPage()
            .then(function() {
                expect(user.loginPage.meetingIDInput.getAttribute('value')).toEqual('7777');
                expect(user.loginPage.meetingPinInput.getAttribute('value')).toEqual('123');
            });
    });

    it('can do auto login if we give sufficient params', function () {
        meetingObj.url = meaurl + '/?address=john.doe@contoso.com&username=John%20Doe&realm=anonymous&pin=1234&meeting=7777#/login';
        var user = new MEAUser({}, meetingObj, browser);
        user.goToLoginPage()
            .then(function() {
                browser.wait(function() {
                    return browser.getCurrentUrl().then(function(url) {
                        //logger.debug(url);
                        return url !== meetingObj.url;
                    });
                }, 5000);
            });
    });
});

//https://confluence.polycom.com:8443/display/CLARCH/Client+API+-+String+parameters
describe('login page pre-populates fields from cookie', function() {
    var originalTimeout;

    beforeEach(function () {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 60 * 1000;
    });

    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });
    it('we store guest user information in a cookie',function(done) {
        var cookieValue = "";
        var user = new MEAUser(null, null, browser);
        user.goToMainPage()
            .then(function() {
                return browser.driver.manage().getCookie('CAXIS-login-cache');
            })
            .then(function(cookie) {
                logger.debug("cookievalue is " + cookie);
                if (cookie || cookie.value) {
                    cookieValue = cookie.value;
                    var obj = JSON.parse(decodeURIComponent(cookieValue));
                    logger.debug("cookievalue is ", obj);
                    expect(obj.userName).toBe(user.userInfo.userName);
                    expect(obj.isGuest).toBe(user.userInfo.isGuest);
                    expect(obj.userAddress).toBe(user.userInfo.email);
                    done();
                } else {
                    done("No cookie stored!");
                }
            });
    });

    it('we store auth user information in a cookie', function(done) {
        var cookieValue = "";
        var user = new MEAUser(userInfo, null, browser);

        user.goToMainPage()
            .then(function() {
                return browser.driver.manage().getCookie('CAXIS-login-cache');
            })
            .then(function(cookie){
                if(cookie || cookie.value){
                    cookieValue = cookie.value;
                    var obj = JSON.parse(decodeURIComponent(cookieValue));
                    logger.debug("cookievalue is ", obj);
                    expect(obj.userName).toBe(userInfo.firstName + " " + userInfo.lastName);
                    expect(obj.isGuest).toBeFalsy();
                    //expect(obj.userAddress).toBe(user.info.email);
                    expect(obj.SSOInfo).not.toBe(undefined);
                    expect(obj.SSOInfo.SSOUsername).toBe(userInfo.userName);
                    expect(obj.SSOInfo.SSOToken.length).toBe(68);
                    expect(obj.SSOInfo.SSORole).toBe('USER');
                    done();
                } else {
                    done("No cookie stored!");
                }
            });
    });


    it('all the cookies we store have secure flag', function(done) {
        var cookieValue = "";
        var user;
        loginHelpers.createAdHocMeeting(userInfo)
            .then(function(result) {
                var meetingInfo = {avcEnabled: true, id: result.presentedId};
                meetingInfo.id = result.presentedId;
                user = new MEAUser(userInfo, meetingInfo, browser);
                return Promise.resolve(user.goToMainPage());
            })
            .then(function () {
                return Promise.resolve(browser.driver.manage().getCookies());
            })
            .then(function(cookies){
                for(var i = 0; i < cookies.length; i++) {
                    logger.debug(cookies[i]);
                    expect(cookies[i].secure).toBe(true);
                }
                done();
            });
    });
});

