var cn = require('../../../js/lib/common/common.mod.js'),

params = {
  selectors: {
    timezoneField : '.js_timezone'
  }
};

window.hook( function( options ) {

  cn.extend( params, options );

  cn.addEvent( window, 'load', function() {

    _currentTimezonePreload();

  });

} );


function _currentTimezonePreload() {

  var timezoneElems = cn.els( params.selectors.timezoneField ),

  browserTimezone = - ( new Date() ).getTimezoneOffset() / 60,

  prefix = browserTimezone < 0 ? '-' : '+';

  browserTimezone = ( Math.abs( browserTimezone ) < 9 ? '0' : '0' ) + Math.abs( browserTimezone );

  cn.forEach( timezoneElems, function( tzElem ) {

    if ( !tzElem.value ) {

      tzElem.value = prefix + browserTimezone + ':00'

    }

  });

};