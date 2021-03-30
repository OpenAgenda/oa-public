"use strict";

var labels = require('@openagenda/labels/agendas/range');
const moment = require('moment-timezone');

module.exports = function(timezone = 'Europe/Paris') {

  var weekdays = [], count = 0;

  return {
    add: add,
    render: render
  }

  function add( timing ) {

    var day = moment.tz(timing.start, timezone).day();

    count++;

    if ( weekdays.indexOf( day ) == -1 ) {

      weekdays.push( day );

    }

  }

  function render( lang ) {

    if ( weekdays.length > 1 ) return;

    if ( count < 3 ) return;

    const weekdayIndex = weekdays[0];

    return labels[ 'weekday-' + weekdayIndex ][ lang ];

  }

}
