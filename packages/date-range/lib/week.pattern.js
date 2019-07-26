"use strict";

var labels = require( '@openagenda/labels/agendas/range' );

module.exports = function() {

  var weekdays = [], count = 0;

  return {
    add: add,
    render: render
  }

  function add( timing ) {

    var day = timing.start.getDay();

    count++;

    if ( weekdays.indexOf( day ) == -1 ) {

      weekdays.push( day );

    }

  }

  function render( lang ) {

    if ( weekdays.length > 1 ) return;

    if ( count < 3 ) return;

    return labels.weekdays[ weekdays[ 0 ] ][ lang ];

  }

}
