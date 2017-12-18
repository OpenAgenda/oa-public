"use strict";

const ih = require( 'immutability-helper' );
const VError = require( 'verror' );

const core = require( '../../core' );

module.exports = async ( req, res, next ) => {

  try {

    const result = await core.agendas( req.agenda.uid ).events.create( ih( req.parsedData, {
      ownerUid: { $set: req.user.uid },
      creatorUid: { $set: req.user.uid },
      agendaUid: { $set: req.agenda.uid }
    } ) );

    res.json( {
      success: true,
      event: result.created.event
    } );

  } catch( e ) {

    if ( e.name === 'validationError' ) {

      return res.status( 400 ).json( {
        errors: VError.info( e ).errors
      } );

    } else {

      next( new VError( e, 'create error' ) );

    }

  }

}