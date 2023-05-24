"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const mysql = require( 'mysql' );
const redis = require( 'redis' );
const { promisify } = require('util');

module.exports = async ( config, fixtures ) => {
  const con = mysql.createConnection( {
    user: config.mysql.user,
    password: config.mysql.password,
    multipleStatements: true,
    ssl: true,
    host: config.mysql.host
  } );

  const redisClient = redis.createClient(/*{ socket: { host: 'localhost', port: 6379 } }*/);

  await redisClient.connect();

  const { sql, redisKeyContents } = fixtures;

  await promisify( con.query.bind( con ) )( sql.replace( /\{database\}/g, config.mysql.database ) );

  for( const redisKey of _.keys( redisKeyContents ) ) {

    await redisClient.set( config.redisPrefix + redisKey, redisKeyContents[ redisKey ] );

  }

  con.end();

  return redisClient;

}
