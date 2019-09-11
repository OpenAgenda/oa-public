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

function init( c ) {
  config = c;
}

async function agendasList( req, res, next ) {

  /**
   * most of this code should be in interface code of integrating app.
   */

  const {
    agendas: { list: agendasList },
    members: { list: membersList },
    agendaMailTo
  } = config.interfaces;

  const page = req.query.page || 1;
  const offset = (page - 1) * config.mw.limit;
  const limit = config.mw.limit;

  try {
    const members = await membersList({ userUid: req.user.uid }, { offset: 0, limit: 500 });

    const { total, agendas } = await agendasList( {
      uid: members.map( s => s.agendaUid ),
      search: req.query.search
    }, offset, limit, {
      includeImagePath: true,
      private: null,
      total: true,
      useDefaultImage: true,
      includeFields: [ 'settings', 'credentials' ]
    } );

    res.send( {
      total,
      agendas: agendas.map( agenda => _.assign( _.omit( agenda, [ 'credentials' ] ), {
        member: members.find( s => s.agendaUid === agenda.uid ),
        useContributeApp: _.get( agenda, 'credentials.useContributeApp', false ),
        mailto: agendaMailTo( agenda ) // hacky. Ideally, the full list should be in integrating app
      } ) )
    } );
  } catch (e) {
    next(e);
  }

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
