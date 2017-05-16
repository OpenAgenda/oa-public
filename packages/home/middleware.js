const logger = require( 'basic-logger' );
const _ = require( 'lodash' );

const matchAppMw = require( 'react-utils/dist/matchAppMw' );
const createStore = require( 'react-utils/dist/createStore' );
const ApiClient = require( 'react-utils/dist/ApiClient' );

const getRoutes = require( './react/dist/routes' );
const reducer = require( './react/dist/redux/reducer' );

let config, log;

module.exports = {
  init,
  getConfig: () => config,
  matchApp: matchAppMw( createStore( reducer ), getRoutes, ApiClient ),
  agendas: {
    list: agendasList
  }
};

function init( c, cb ) {

  config = c;

  if ( c.logger ) {

    logger.setLogger( c.logger );

  }

  log = logger( 'home' );

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
    offset,
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
        { includeImagePath: true, private: null, total: true },
        ( err, reviews, total ) => {

          if ( err ) return next( err );

          reviews = _.zipWith( reviews, stakeholders, ( review, stakeholder ) => {
            return Object.assign( {}, review, { stakeholder } );
          } ).filter( review => !!review.id );

          res.send( {
            total,
            reviews
          } );

        } )

    } );

}
