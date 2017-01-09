const logger = require( 'basic-logger' );

const matchAppMw = require( 'react-utils/dist/matchAppMw' );
const createStore = require( 'react-utils/dist/createStore' );
const ApiClient = require( 'react-utils/dist/ApiClient' );

const getRoutes = require( './react/dist/routes' );
const reducer = require( './react/dist/redux/reducer' );

let service, config;

module.exports = (s, c) => {
  service = s;
  config = c;

  return {
    matchApp: matchAppMw( createStore( reducer ), getRoutes, ApiClient ),
    list,
    stats
  };
};

function list( req, res ) {

  const offset = (req.query.page - 1) * config.limit;
  const limit = config.limit;

  const query = {
    search: req.query.search,
    credentials: req.query.credentials
  };

  service( req.agenda.id )
    .list( query, offset, limit, { total: true, detailed: true }, ( err, stakeholders, total ) => {

      if ( err ) return res.status( 400 ).send( err );

      res.send( { stakeholders, total } );

    } );

  /* service( req.agenda.id ).list( { search: req.query.search }, offset, limit, { total: true } )
    .then( result => {
      res.send( result );
    } )
    .catch( err => {
      res.status( 400 ).send( err );
    } ); */

}

function stats( req, res ) {

  service( req.agenda.id )
    .stats( ( err, stats ) => {

      if ( err ) return res.status( 400 ).send( err );

      res.send( { stats } );

    } );

}
