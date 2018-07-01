"use strict";

const svc = require( '../../' ),

  _ = require( 'lodash' ),

  fixtures = require( '@openagenda/fixtures' );

module.exports = svc;

module.exports.initAndLoad = async ( config, files = [ 
  'custom',
  'legacy_event',
  'agenda',
  'legacy_agenda_event',
  'legacy_agenda_event_tag',
  'legacy_agenda_tag',
  'legacy_category'
], options = {} ) => {

  const params = _.extend( {
    reset: true
  }, options );

  svc.init( config );

  fixtures.init( { mysql: config.mysql } );

  return new Promise( ( rs, rj ) => {

    fixtures( [ {
      table: 'custom',
      src: __dirname + '/../../custom.sql'
    }, {
      table: 'legacy_event',
      src: __dirname + '/../fixtures/legacy_event.sql'
    }, {
      table: 'agenda',
      src: __dirname + '/../fixtures/agenda.sql'
    }, {
      table: 'legacy_agenda_event',
      src: __dirname + '/../fixtures/legacy_agenda_event.sql'
    }, {
      table: 'legacy_agenda_event_tag',
      src: __dirname + '/../fixtures/legacy_agenda_event_tag.sql'
    }, {
      table: 'legacy_agenda_tag',
      src: __dirname + '/../fixtures/legacy_agenda_tag.sql'
    }, {
      table: 'legacy_category',
      src: __dirname + '/../fixtures/legacy_category.sql'
    } ].filter( f => files.includes( f.src.split( '/' ).pop().split( '.' )[ 0 ] ) ), params, err => {

      if ( err ) return rj( err );

      rs();

    } );

  } );

}