"use strict";

const _ = require( 'lodash' );

module.exports = ( req, res, next ) => {

  res.render( 'pages/' + req.params.page, req.data, ( err, html ) => {

    if ( _.get( err, 'message', '' ).indexOf( 'Failed to lookup view' ) !== -1 ) {

      next();

    } else if ( err ) {

      log( 'error', err );

      next( err );

    } else {

      res.send( html );

    }

  } );

}
