var Promise = require('bluebird');
var _ = require('lodash');

module.exports = {

    set: function(element, mode) {
        return element.isSelected()
            .then(function(checked) {
                if (checked === mode) {
                    return Promise.resolve(true);
                } else {
                    return element.click()
                        .then(function() {
                            return Promise.resolve(true);
                        });
                }
            });
    },
    extend: function(objA, objB){
        for( var b_attr in objB){
            objA[b_attr] = objB[b_attr];
        }
        return (objA);
    },
    clickIfDisplayed: function(element) {
        return Promise.resolve(element.isDisplayed())
                .then(function(displayed) {
                    if (displayed) {
                        return element.click();
                    } else {
                        return Promise.resolve(true);
                    }
                });
    },

    validElement: function(element, funcName, elementName  ){
        if (!element){
            if(!elementName) {
                elementName = 'notSet';
            }
            //console.trace('Element error, in ' + funcName +
            //    ': element ' + elementName + " is falsy");
        }
    },

    //https://lodash.com/docs#merge
    matchCustomizer: function(objectValue, sourceValue, key, object, source) {
        if (_.isFunction(sourceValue)) {
            return sourceValue(objectValue) ? objectValue: sourceValue;
        } else {
            return undefined;
        }
    }

};