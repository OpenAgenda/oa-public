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

function list( options = {}, req, res, next ) {

  const {
    send
  } = Object.assign( {
    send: true
  }, options || {} );

  const limit = req.query.limit ? parseInt( req.query.limit ) : config.mw.limit;
  const offset = req.query.offset ? parseInt( req.query.offset ) : (( req.query.page || 1 ) - 1) * limit;

  service( req.agenda.id ).list( { search: req.query.search }, offset, limit, { total: true } )
    .then( result => {
      if ( send ) {
        res.send( result );
      } else {
        req.result = result;
        next();
      }
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
