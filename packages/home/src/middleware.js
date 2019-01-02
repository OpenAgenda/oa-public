"use strict";

const _ = require( 'lodash' );
const range = require( '@openagenda/date-range' );

require( 'moment/locale/fr' );

let config;


module.exports = {
  init,
  getConfig: () => config,
  agendas: {
    list: agendasList
  },
  events: {
    list: eventsList
  }
};

function init( c, cb ) {

  config = c;

  if ( cb ) cb();

}

function agendasList( req, res, next ) {

  /**
   * most of this code should be in interface code of integrating app.
   */

  const {
    agendas: { list: agendasList },
    stakeholders: { list: stakeholdersList },
    agendaMailTo
  } = config.interfaces;

  const offset = (( req.query.page || 1 ) - 1) * config.mw.limit;
  const limit = config.mw.limit;

  stakeholdersList( req.user.id, 0, 500, /* hmmmm.. */ ( err, stakeholders ) => {

    if ( err ) return next( err );

    agendasList( {
      ids: stakeholders.map( s => s.agendaId ),
      search: req.query.search
    }, offset, limit, {
      includeImagePath: true,
      private: null,
      total: true,
      useDefaultImage: true,
      includeFields: [ 'settings', 'credentials' ]
    }, ( err, reviews, total ) => {

      if ( err ) return next( err );

      res.send( {
        total,
        reviews: reviews.map( review => _.assign( _.omit( review, [ 'credentials' ] ), {
          stakeholder: stakeholders.find( s => s.agendaId === review.id ),
          useContributeApp: _.get( review, 'credentials.useContributeApp', false ),
          mailto: agendaMailTo( review ) // hacky. Ideally, the full list should be in integrating app
        } ) )
      } );

    } );

  } );

}

function eventsList( req, res, next ) {
  const {
    events: { list: eventsList }
  } = config.interfaces;

  const offset = (( req.query.page || 1 ) - 1) * config.mw.limit;
  const limit = config.mw.limit;

  req.log( 'fetching events owned by user %s', req.user.uid );

  eventsList(
    { draft: null, ownerUid: req.user.uid, order: 'updatedAt.desc', search: req.query.search },
    offset,
    limit,
    { private: null, total: true, detailed: true, useDefaultImage: true },
    ( err, events, total ) => {

      if ( err ) return next( err );

      req.log( 'fetched %s of %s events owned by user %s', events.length, total, req.user.uid );

      res.send( {
        total,
        events: events.map( event => {

          const timings = (event.timings || []).map( t => ({ start: new Date( t.begin ), end: new Date( t.end ) }) );
          const timerange = range( timings, req.lang || 'fr', event.timezone || 'Europe/Paris' );

          return Object.assign( {}, event, { timerange } );

        } )
      } );

    } );

}
