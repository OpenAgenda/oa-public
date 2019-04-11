"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const core = require( '../../core' );

module.exports = async ( req, res, next ) => {

  try {

    const result = await core.agendas( req.agenda.uid ).events.remove( req.event.uid, {
      context: {
        agendaUid: req.agenda.uid,
        userUid: req.user.uid
      }
    } );

    res.json( {
      success: result.success
    } );

  } catch ( e ) {

    if ( e.name === 'validationError' ) {

      return res.status( 400 ).json( {
        errors: VError.info( e ).errors
      } );

    } else {

      next( new VError( e, 'remove error' ) );

    }

  }

}
