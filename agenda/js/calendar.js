var cn = require('../../js/lib/common/common.mod.js'),

cLib = require('../../js/vendors/CibulCalendar/src/CibulCalendar');

module.exports = function( options ) {

  var params = cn.extend( {
    selectors: {
      canvas: '.js_calendar_widget'
    }
  }, options ? options : {} );

  cn.addEvent( window, 'load', function() {

    new cLib.CibulCalendar( cn.el( params.selectors.canvas ), {
      filter: function( date, classes ) {

      },
      onSelect: function( selection ) {

      },
      navDomContent: { prev: '<', next: '>'},
      lang: 'fr'
    });

  });

}