var nconf = require('nconf'),
    MEALoginPage = require('../pageObjects/loginPageObj'),
    MEAMainPage = require('../pageObjects/mainPageObj'),
    encryption = require('plcm-encryption'),
    loginHelpers = require('../helpers/loginHelpers');

nconf.file('test', 'conf.json');
nconf.load();

var meaurl = loginHelpers.getMEAUrl(),
    userInfo = nconf.get("test_config").users.authenticated[0],
    lobbyCode = 'EN9y643suz',
    LAYOUT_SWITCH_COUNT = 100;

browser.driver.manage().window().maximize();

// spec.js
describe('can switch layout without crash', function() {
    it('can login to the meeting as a guest user with avc enabled and change layout options again and again', function() {
        var page = new MEALoginPage(meaurl + '/' + lobbyCode),
            mainPage = null;

        page.get();
        expect(page.isGuestMode()).toBeFalsy();
        page.login({
            isGuest: true,
            avcEnabled: true,
            name: "protractorUser",
            email: "user@localhost.net"
        });

        expect(loginHelpers.waitForUrlToChangeTo(/transition/)).toBeTruthy();
        // we need to wait till the plugin make a sip call
        loginHelpers.waitForPluginToMakeASipCall();
        // check the page url
        expect(loginHelpers.waitForUrlToChangeTo(/main/)).toBeTruthy();

        // Now we are in main page
        mainPage = new MEAMainPage(page);

        // go to the layout buttons
        mainPage.selectMenu(true);
        mainPage.waitForLayoutOptionToAppear()
            .then(function(layoutOptionPresent) {
                expect(layoutOptionPresent).toBe(true);
                return mainPage.selectLayoutButton(true);
            })
            .then(function() {
                // get the layout options, we should have 3 of them
                expect(mainPage.layoutOptions.count()).toEqual(3);
                return mainPage.layoutOptions;
            })
            .then(function(options) {
               for(var i =0; i < LAYOUT_SWITCH_COUNT; i++) {
                   for(var j = 0; j < options.length; j++) {
                       var option = options[j].element(by.className('layout-button'));
                       option.click();
                       browser.sleep(5*1000);
                   }
               }
            });
    });

});