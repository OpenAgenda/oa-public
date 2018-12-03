"use strict";

module.exports = ( req, res, next ) => {

  if ( req.method === 'GET' ) return next();

  setTimeout( () => {

    if ( !req.clean.anything ) {

      res.status( 400 ).send();

    } else {

      res.status( 400 ).send( {
        errors: [ {
          field: 'anything',
          fieldLabel: 'Anything',
          label: 'This error comes from the server'
        } ]
      } )

    }

  }, parseInt( req.clean.timeout ) * 1000 );
}
