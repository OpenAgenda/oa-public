"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const core = require( '../../core' );

module.exports = async ( req, res, next ) => {

  // if there was an image uploaded with the post, it is loaded in req.file.path with multer
  if ( _.get( req, 'file.path' ) ) {

    _.set( req.parsedData, 'image.path', _.get( req, 'file.path', undefined ) );

  }

  try {

    const result = await core.agendas( req.agenda.uid ).events.update(
      req.event.uid,
      _.omit( req.parsedData, [ 'ownerUid', 'creatorUid' ] ),
      { partial: req.method === 'PATCH' }
    );

    res.json( {
      success: true,
      event: _.get( result, 'updated.event' )
    } );

  } catch( e ) {

    if ( e.name === 'validationError' ) {

      return res.status( 400 ).json( {
        errors: VError.info( e ).errors
      } );

    } else {

      next( new VError( e, 'update error' ) );

    }

  }

}
