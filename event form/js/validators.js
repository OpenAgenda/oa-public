"use strict";

module.exports = {
  isInteger: isInteger
}

function isInteger( v ) {

  return v == parseInt(v, 10);
  
}