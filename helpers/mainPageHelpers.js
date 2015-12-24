var Promise = require('bluebird');
var utils = require('../helpers/utils');
var assert = require('assert');

module.exports = (function(){
    var helperObj = {
        getButtonValue: function (element) {
            return element.getAttribute('value');
        },
        buttonIsVisible: function (element) {
            return element.isDisplayed();
        },
        buttonClick: function (element) {
            return element.click();
        },
        selectElement: function (elem, mode, browserInst) {
            assert(browserInst, 'mpHelpers.selectElement requires a browserInst argument');
            return this.elemIsHidden(elem, browserInst)
                .then(function (hidden) {
                    assert(!hidden, 'element selection error: selecting hidden element');
                    return elem.isSelected();
                })
                .then(function (checked) {
                    if (checked === mode) {
                        return Promise.resolve(true);
                    } else {
                        return elem.click()
                            .then(function () {
                                return helperObj.waitForElementToBeSelected(elem, mode,
                                                                            browserInst);
                            });
                    }
                });
        },
        elemIsHidden: function (element, browser) {
            //print('mainPageHelpers.elemIsHidden()');
            return element.getAttribute('class').
                then(function (attrValue) {
                    //print('Hidden -> attrValue: ' + attrValue);
                    return Promise.resolve(attrValue.indexOf('ng-hide') >= 0);
                });
        },
        elemIsActive: function (element, browser) {
            //print('mainPageHelpers.elemIsActive()');
            return element.getAttribute('class')
                .then(function (attrValue) {
                    //print('Active -> attrValue: ' + attrValue);
                    return Promise.resolve(attrValue.indexOf('active') >= 0);
                });
        },

        waitForElementActivity: function (element, mode, browserInst) {
            //print('mainPageHelpers.waitForElementSelection()');
            return browserInst.wait(function () {
                return helperObj.elemIsActive(element)
                    .then(function (checked) {
                        return checked === mode;
                    });
            });
        }
    };
    return helperObj;
})();



