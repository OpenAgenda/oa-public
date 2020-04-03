"use strict";

var w = require('when'),

wn = require('when/node');

module.exports = {
  w: w,
  wn: wn,
  interrupt: interrupt,
  ife: ifEqual(_isEqual),
  ifl: ifEqual(_isLoaded)
}



function ifEqual(compareFunc) {

  return function (requirements, func) {

    return function(values) {

      var matches = true;

      for(var r in requirements) {

        if (!compareFunc(r, requirements[ r ], values)) {

          matches = false;

          break;

        }

      }

      if (matches) return func(values);

      return values;

    }

  }

}


function _isEqual(key, requiredValue, values) {

  var compared = _retrieveValue(key, values);

  return compared === requiredValue;

}

function _isLoaded(key, requiredValue, values) {

  var compared = _retrieveValue(key, values);

  return !!compared === !!requiredValue;

}

function _retrieveValue(key, values) {

  var compared = values,

  keyParts = key.split('.'),

  empty = false;

  keyParts.forEach(function(keyPart) {

    if (empty) return;

    if (compared[ keyPart ] === undefined) {

      empty = true;

    } else {

      compared = compared[ keyPart ];

    }

  });

  if (empty) return;

  return compared;

}

function interrupt(message) {

  return function() {

    throw message;

  }

}
