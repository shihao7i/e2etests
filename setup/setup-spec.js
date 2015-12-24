var nconf = require('nconf'),
    Promise = require('bluebird'),
    loginHelpers = require('../helpers/loginHelpers'),
    meaSettings = '../settings.json';


var meaurl;

nconf.file('mea', meaSettings);
nconf.file('test', 'conf.json');
nconf.load();

meaurl = nconf.get('environments')[0].general.urls.internal_secure;

// spec.js
describe('protractor is setup and we can start testing', function() {
    it('browser should be defined', function() {
        expect(browser).not.toBe(undefined);
    });

    it('mea server is running', function() {
        expect(meaurl).not.toBe(undefined);
        browser.get(meaurl);
        // We actually dont' have a meaningful title; our URL is our title at this point
        //expect(browser.getTitle()).toMatch(/RealPresence/i);
    });

});

describe('we can create WSP local users for our test cases', function() {

    it('we have wsp credentials to join the meeting', function() {
        expect(typeof nconf.get("test_config").users.authenticated).toEqual("object");
    });

    it('can create user accounts for all the users in our conf', function(done) {

       var promises = nconf.get("test_config").users.authenticated.map(function(user) {
           //console.log('userInit: ', user );

           var user2 = loginHelpers.createWSPLocalUser(user);
           //console.log('userAfter: ', user2 );
          return user2;
       });
        //console.log('promises.length: ', promises.length);
        //console.log('promises: ', promises);


       Promise.settle(promises)
           .then(function(results) {
               var created = true;
               results.forEach(function(r) {
                   var fulfilled = r.isFulfilled();

                   var rejected = r.isRejected();
                   created = created &&
                       (fulfilled || (rejected && r.reason().message && r.reason().message.indexOf("already exists") > -1));
                   if (!created) {
                       done.fail('Could not create user account ', r.reason());
                   }
               });
               if (created) {
                   done();
               } else {
                   done.fail("Couldn't create the user accounts.");
               }
           });
    });

});

