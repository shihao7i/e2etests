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

var guestParams = {
    isGuest: true,
    avcEnabled: false,
    userName: 'p2',
    email: 'p2@localhost'
};

