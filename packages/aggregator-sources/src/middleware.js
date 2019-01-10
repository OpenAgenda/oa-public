const logs = require( '@openagenda/logs' );

let service, config;

module.exports = {
  init,
  list,
  remove
};

function init( s, c ) {

  service = s;
  config = c;

  if ( c.logger ) {

    logs.setModuleConfig( c.logger );

  }

}

function list( req, res ) {

  const offset = (( req.query.page || 1 ) - 1) * config.mw.limit;
  const limit = config.mw.limit;

  service( req.agenda.id ).list( { search: req.query.search }, offset, limit, { total: true } )
    .then( result => {
      res.send( result );
    } )
    .catch( err => {
      res.status( 400 ).send( err );
    } );

}

function remove( req, res ) {

  service( req.agenda.id ).remove( req.query )
    .then( result => {
      res.send( result );
    } )
    .catch( err => {
      res.status( 400 ).send( err );
    } );

}
