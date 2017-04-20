const logger = require( 'basic-logger' );

const _ = require( 'lodash' );

const matchAppMw = require( 'react-utils/dist/matchAppMw' );
const createStore = require( 'react-utils/dist/createStore' );
const ApiClient = require( 'react-utils/dist/ApiClient' );

const getAdminRoutes = require( './react/dist/apps/admin/routes' );
const getAgendaRoutes = require( './react/dist/apps/agenda/routes' );
const reducer = require( './react/dist/redux/reducer' );

const activitiesSvc = require( 'activities' );

let config;
let log;

module.exports = {
  matchAdminApp: matchAppMw( createStore( reducer ), getAdminRoutes, ApiClient ),
  matchAgendaApp: matchAppMw( createStore( reducer ), getAgendaRoutes, ApiClient ),
  init,
  list
};

function init( c, cb ) {

  config = c;

  if ( c.logger ) {

    logger.setLogger( c.logger );

  }

  log = logger( 'activity-apps' );

  if ( cb ) cb();

}

function list( req, res ) {

  const query = _.pick( req.query, [ 'actor', 'verb', 'object', 'target' ] );
  const limit = config.limit;

  const { datetimeRange, fromId } = req.query;

  if ( datetimeRange ) {
    const [ afterAt, beforeAt ] = datetimeRange.split( '|' );
    query.createdAt = {
      $lte: new Date( beforeAt ),
      $gte: new Date( afterAt )
    };
  }

  const svc = (req.agenda && req.agenda.uid) ? activitiesSvc.feed( {
    entityType: 'agenda',
    entityUid: req.agenda.uid
  } ) : activitiesSvc;

  svc.activities.list( query, fromId || 0, limit )
    .then( activities => {
      res.send( { activities } );
    } )
    .catch( err => {
      res.status( 400 ).send( err );
    } );

}
