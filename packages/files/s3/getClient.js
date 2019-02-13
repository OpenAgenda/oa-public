"use strict";

const knox = require( 'knox-s3' ); // deprecated
const AWS = require( 'aws-sdk' );

module.exports = ( {
  accessKeyId,
  secretAccessKey
} ) => new AWS.S3( {
  accessKeyId,
  secretAccessKey,
  apiVersion: '2006-03-01'
} )

module.exports.knox = ( {
  accessKeyId,
  secretAccessKey
}, bucket ) => knox.createClient( {
  key: accessKeyId,
  secret: secretAccessKey,
  bucket
} );