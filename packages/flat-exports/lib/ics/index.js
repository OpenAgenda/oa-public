"use strict";

module.exports = {
  head: require( './head' ),
  parseEvent: require( './parseEvent' ),
  tail: () => 'END:VCALENDAR\r\n'
}
