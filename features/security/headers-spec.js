/*jshint loopfunc: true */
var Promise = require('bluebird'),
    nconf = require('nconf'),
    loginHelpers = require('../../helpers/loginHelpers'),
    _ = require('lodash');

var meaurl = loginHelpers.getMEAUrl();

// http://stackoverflow.com/questions/25137881/how-to-use-protractor-to-get-the-response-status-code-and-response-text
// A Protracterized httpGet() promise
function httpGet(siteUrl) {
    var https = require('https');
    var defer = protractor.promise.defer();

    https.get(siteUrl, function(response) {

        var body = '';

        response.setEncoding('utf8');

        response.on("data", function(chunk) {
            body += chunk;
        });

        response.on('end', function() {
            defer.fulfill({
                statusCode: response.statusCode,
                headers: response.headers,
                body: body
            });
        });

    }).on('error', function(e) {
        defer.reject("Got http.get error: " + e.message);
    });

    return defer.promise;
}

//https://jira.polycom.com:8443/browse/CAXIS-11520
describe('check response headers', function() {
    var securityflags = {
        'strict-transport-security': 'max-age=31536000; includeSubdomains;',
        'x-content-type-options': 'nosniff'
    };
    _.forEach(securityflags, function(value, key) {
        it('should have ' + key + ':' + value, function (done) {
            httpGet(meaurl).then(function (result) {
                expect(result.statusCode).toBe(200);
                expect(result.headers[key]).toBe(value);
                done();
            });
        });
    });

    it('should not have engine.io unsecured cookie ', function(done) {
        httpGet(meaurl + '/socket.io/?EIO=3&transport=polling&t=1429212417203-0&b64=1').then(function(result) {
            expect(result.headers['set-cookie']).toBe(undefined);
            done();
        });
    });
});
