"use strict";

const AWS = require( 'aws-sdk' );

module.exports = ( {
  accessKeyId,
  secretAccessKey
} ) => new AWS.S3( {
  accessKeyId,
  secretAccessKey,
  apiVersion: '2006-03-01'
} )
