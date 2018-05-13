const range = require( '@openagenda/date-range' );

const matchAppMw = require( '@openagenda/react-utils/dist/matchAppMw' );
const createStore = require( '@openagenda/react-utils/dist/createStore' );
const ApiClient = require( '@openagenda/react-utils/dist/ApiClient' );

const getRoutes = require( './react/dist/routes' );
const reducer = require( './react/dist/redux/reducer' );

require( 'moment/locale/fr' );

let config;

module.exports = {
  init,
  getConfig: () => config,
  matchApp: matchAppMw( createStore( reducer ), getRoutes, ApiClient ),
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

  const {
    agendas: { list: agendasList },
    stakeholders: { list: stakeholdersList }
  } = config.interfaces;

  const offset = (req.query.page - 1) * config.mw.limit;
  const limit = config.mw.limit;

  stakeholdersList(
    req.user.id,
    0,
    500, // hmmmm..
    ( err, stakeholders ) => {

      if ( err ) return next( err );

      agendasList(
        {
          ids: stakeholders.map( s => s.agendaId ),
          search: req.query.search
        },
        offset,
        limit,
        { includeImagePath: true, private: null, total: true, useDefaultImage: true },
        ( err, reviews, total ) => {

          if ( err ) return next( err );

          reviews = reviews.map( review => {

            const stakeholder = stakeholders.find( s => s.agendaId === review.id );
            return Object.assign( {}, review, { stakeholder } );

          } );

          res.send( {
            total,
            reviews
          } );

        } );

    } );

}

function eventsList( req, res, next ) {
  const {
    events: { list: eventsList }
  } = config.interfaces;

  const offset = (req.query.page - 1) * config.mw.limit;
  const limit = config.mw.limit;

  req.log( 'fetching events owned by user %s', req.user.uid );

  eventsList(
    { private: null, draft: null, ownerUid: req.user.uid, order: 'updatedAt.desc', search: req.query.search },
    offset,
    limit,
    { total: true, detailed: true, useDefaultImage: true },
    ( err, events, total ) => {

      req.log( 'fetched %s of %s events owned by user %s', events.length, total, req.user.uid ); 

      if ( err ) return next( err );

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
