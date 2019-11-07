"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const core = require( '../../core' );

module.exports = async ( req, res, next ) => {

  const update = core.agendas( req.agenda.uid ).events.update;

  // if there was an image uploaded with the post, it is loaded in req.file.path with multer
  if ( _.get( req, 'file.path' ) ) {

    _.set( req.parsedData, 'image.path', _.get( req, 'file.path', undefined ) );

  }

  try {

    const filtered = _.omit( req.parsedData, [ 'ownerUid', 'creatorUid' ] );

    const result = await update( req.event.uid, filtered, {
      partial: req.method === 'PATCH',
      batched: _parseBool( req.headers.batched || req.body.batched ),
      context: {
        userUid: req.user.uid
      }
    } );

    res.json( {
      success: true,
      event: _.get( result, 'updated' )
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

function _parseBool( v ) {

  return typeof v === 'string' ? v === 'true' : !!v;

}
