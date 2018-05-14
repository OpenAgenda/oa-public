"use strict";

const _ = require( 'lodash' );
const AWS = require( 'aws-sdk' );
const fs = require( 'fs' );
const { promisify } = require( 'util' );

module.exports = ( { s3, uid } ) => {

  const client = new AWS.S3( _.extend( { 
    apiVersion: '2006-03-01'
  }, _.pick( s3, [ 
    'accessKeyId',
    'secretAccessKey',
    'region'
  ] ) ) );

  return {
    setJSON: setAgendaJSON.bind( null, client, s3.bucket, uid ),
    getJSON: getAgendaJSON.bind( null, client, s3.bucket, uid ),
    removeJSON: removeAgendaJSON.bind( null, client, s3.bucket, uid ),
    set: setAgendaFile.bind( null, client, s3.bucket, uid ),
    remove: removeAgendaFile.bind( null, client, s3.bucket, uid )
  };

}


function removeAgendaJSON( client, bucket, uid, name ) {

  return removeAgendaFile( client, bucket, uid, name + '.json' );

}

async function removeAgendaFile( client, bucket, uid, name ) {

  const deleteObject = promisify( client.deleteObject.bind( client ) );

  try {

    const result = await deleteObject( {
      Bucket: bucket,
      Key: [ uid, name ].join( '/' )
    } );

    return result;

  } catch ( e ) {

    throw e;

  }

}

async function setAgendaFile( client, bucket, uid, localFilePath, name = null ) {

  const filename = name || localFilePath.split( '/' ).pop();

  const upload = promisify( client.upload.bind( client ) );

  try {

    const result = await upload( {
      ACL: 'public-read', // because that is what I need now
      Bucket: bucket,
      Key: [ uid, name ].join( '/' ),
      Body: fs.createReadStream( localFilePath )
    } );

    return {
      path: result.Location
    };

  } catch ( e ) {

    throw e;

  }

}


async function getAgendaJSON( client, bucket, uid, name, defaultValue ) {

  const getObject = promisify( client.getObject.bind( client ) );

  try {

    const result = await getObject( {
      Bucket: bucket,
      Key: [ uid, name + '.json' ].join( '/' )
    } );

    return JSON.parse( result.Body.toString() );

  } catch ( e ) {

    if ( e.code === 'NoSuchKey' ) {

      return _.extend( {}, defaultValue );

    }

    throw e;

  }

}

async function setAgendaJSON( client, bucket, uid, name, obj ) {

  const putObject = promisify( client.putObject.bind( client ) );

  return await putObject( {
    Bucket: bucket,
    Key: [ uid, name + '.json' ].join( '/' ),
    Body: JSON.stringify( obj ),
    ContentType: "application/json"
  } );

}