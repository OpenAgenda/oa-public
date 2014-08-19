var map = require('./map'),

calendar = require('./calendar');

window.run = function( options ) {

  map( options ? options.map : {} );

  calendar( options ? options.calendar : {} );

}