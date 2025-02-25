"use strict";

var cn = require( '../../js/lib/common' ),

defaults = {
  selectors: {
    time: '.js_relative_time'
  },
  attributes: {
    time: 'data-relative-time'
  }
}

module.exports = function( labelizer, options ) {

  var params = cn.extend( {}, defaults, options );

  _sweep();

  return _sweep;

  function _sweep() {

    cn.forEach( cn.els( params.selectors.time ), function( timeElem ) {

      var attr = timeElem.getAttribute( params.attributes.time );

      if ( attr ) {

        timeElem.innerHTML = labelizer( attr );

        timeElem.removeAttribute( params.attributes.time );

      }

    });

  }

}
