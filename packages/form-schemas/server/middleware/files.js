"use strict";

const _ = require( 'lodash' );
const AWS = require( 'aws-sdk' );
const fs = require( 'fs' );
const FormSchema = require( '../../iso/FormSchema' );
const multer = require( 'multer' );
const { promisify } = require( 'util' );

// const FILE_FIELD_PREFIX = require( '../../iso/fileFieldPrefix' );

// set at init
let tmpFolder;
let s3;
let upload;

module.exports = {
  init,
  putInTemporary,
  uploadFilesToS3,
  cleanFileValues
}

function putInTemporary( ns, req, res, next ) {

  const namespaces = _.assign( {
    fileKey: 'fileKey',
    schema: 'schema',
    fileFieldValues: 'fileFieldValues'
  }, ns );

  const temporaryFolder = tmpFolder || process.env.TMP_FOLDER;

  if ( !temporaryFolder ) return next( 'form-schemas middleware are not initialized' );

  const fileFields = ( new FormSchema( req[ namespaces.schema ] ) ).getFileFields();

  req[ namespaces.fileFieldValues ] = {};

  if ( !fileFields.length ) return next();

  multer( {
    storage: multer.diskStorage( {
      destination: temporaryFolder,
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
          filename,
          path: [ temporaryFolder, filename ].join( '/' )
        }

        req[ namespaces.fileFieldValues ][ field.field ] = fieldValue;

        cb( null, filename );

      }
    } )
  } ).fields( fileFields.map( f => ( { name: f.field, maxCount: f.max || 1 } ) ) )( req, res, next );

}

function cleanFileValues( ns, req, res, next ) {

  const namespaces = _.assign( {
    fileKey: 'fileKey',
    schema: 'schema',
    fileFieldValues: 'fileFieldValues'
  }, ns );

  const fileFieldValues = req[ namespaces.fileFieldValues ];

  if ( !_.keys( fileFieldValues ).length ) {

    return next();

  }

  _.keys( fileFieldValues ).forEach( fieldName => {

    req.body[ fieldName ] = fileFieldValues[ fieldName ];

  } );

  next();

}

/**
 * Upload files found in file values namespace to S3
 */
function uploadFilesToS3( options, req, res, next ) {

  const params = _.assign( {
    fileFieldValues: 'fileFieldValues',
    ignore: []
  }, options || {} );

  const fileFieldsValues = _.omit( req[ params.fileFieldValues ], params.ignore );

  if ( !_.keys( fileFieldsValues ).length ) return next();

  s3MultipleUploads( fileFieldsValues ).then(
    () => next(),
    err => next( err )
  );

}

async function s3MultipleUploads( fileFieldValues ) {

  for ( const fieldName of _.keys( fileFieldValues ) ) {

    await s3Upload( fileFieldValues[ fieldName ].filename );

  }

}

async function s3Upload( filename ) {

  const result = await upload( {
    ACL: 'public-read', // because that is what I need now
    Bucket: s3.bucket,
    Key: filename,
    Body: fs.createReadStream( tmpFolder + '/' + filename )
  } );

  return result.Location;

}


function init( config ) {

  tmpFolder = _.get( config, 'tmpFolder' );

  s3 = _.get( config, 's3' );

  const client = new AWS.S3( _.assign( {
    apiVersion: '2006-03-01'
  }, _.pick( config.s3, [
    'accessKeyId',
    'secretAccessKey',
    'region'
  ] ) ) );

  upload = promisify( client.upload.bind( client ) );

}
