"use strict";

const _ = require( 'lodash' );
const FormSchema = require( '../../iso/FormSchema' );
const multer = require( 'multer' );
const AWS = require( 'aws-sdk' );

// set at init
let tmpFolder;

module.exports = {
  init,
  putInTemporary
} 

function putInTemporary( ns, req, res, next ) {

  const namespaces = _.assign( {
    fileKey: 'fileKey',
    schema: 'schema',
    fileFieldValues: 'fileFieldValues'
  }, ns );

  if ( !tmpFolder ) return next( 'form-schemas middleware are not initialized' );

  const fileFields = ( new FormSchema( req[ namespaces.schema ] ) ).getFileFields();

  req[ namespaces.fileFieldValues ] = {};

  if ( !fileFields.length ) return next();

  multer( {
    storage: multer.diskStorage( {
      destination: tmpFolder,
      filename: ( req, file, cb ) => {

        const field = _.first( fileFields.filter( f => f.field === file.fieldname ) );

        // should use multer file filter here
        if ( !field ) return cb( null, 'latest_discarded_upload' );

        const filename = [
          req[ namespaces.fileKey ],
          file.fieldname,
          file.originalname.split( '.' ).pop() 
        ].join( '.' );

        const fieldValue = {
          originalName: file.originalname,
          extension: file.originalname.split( '.' ).pop(),
          filename
        }

        req[ namespaces.fileFieldValues ][ field.field ] = fieldValue;

        cb( null, filename );

      }
    } )
  } ).fields( fileFields.map( f => ( { name: f.field, maxCount: 1 } ) ) )( req, res, next );

}


function init( config ) {

  tmpFolder = _.get( config, 'tmpFolder' );

}
