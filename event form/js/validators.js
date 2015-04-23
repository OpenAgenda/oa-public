"use strict";

module.exports = {
  isInteger: isInteger,
  isNumber: isNumber
}

function isInteger( v ) {

  return v == parseInt(v, 10);
  
}

function isNumber( v ) {

  return !_isArray( v ) && ( v - parseFloat( v ) + 1 ) >= 0;

}

function _isArray( v ) {

  return Object.prototype.toString.call( v ) === '[object Array]';

}