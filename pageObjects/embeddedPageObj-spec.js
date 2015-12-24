var nconf = require('nconf'),
    MEAEmbedPage = require('./embeddedPageObj'),
    loginHelpers = require('../helpers/loginHelpers'),
    btoa = require('btoa'); // jshint ignore:line

nconf.file('test', 'conf.json');
nconf.load();

var meaurl = loginHelpers.getMEAUrl(),
    userInfo = nconf.get("test_config").users.authenticated[0];

var saveScreenShots = nconf.get("test_config").pixdiff.generate,
    testScreenShots = nconf.get("test_config").pixdiff.test;

var meetingInfo = {};

xdescribe('can create meetings to test embedded page', function() {
    it('meeting created successfully', function(done) {
        loginHelpers.createAdHocMeeting(userInfo)
            .then(function(result) {
                meetingInfo = {
                    id: result.presentedId,
                    wspId: result.id
                };
                done();
            });
    });
});
// spec.js
xdescribe('can use the embedded login object', function() {
    var page;
    beforeEach(function(done) {
        var ssoInfo = {
            SSOUsername: userInfo.userName,
            SSOToken: userInfo.wspToken
        };
        //noinspection JSDeprecatedSymbols
        var ssodata = btoa(unescape(encodeURIComponent(JSON.stringify(ssoInfo)))); // jshint ignore:line
        var url = meaurl + '?embedded=true&ssodata=' + ssodata + '&meeting=' + meetingInfo.id;
        logger.debug('ssoinfo', ssoInfo);
        logger.debug('url = ' + url);
        page = new MEAEmbedPage(url);
        page.get()
            .nodeify(done);
    });

    it('can get to the embedded page url', function() {
        var filename = 'embeddedPage';
        if (saveScreenShots) {
            expect(browser.pixdiff.saveScreen(filename)).not.toBeNull();
        }
        if (testScreenShots) {
            expect(browser.pixdiff.checkScreen(filename)).toMatch();
        }
    });

    //it('we can login with correct query parameters', function() {
    //});
    //
    //it('we can not login with incorrect query parameters', function() {
    //});

});