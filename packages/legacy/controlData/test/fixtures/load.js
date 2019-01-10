"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const mysql = require( 'mysql' );
const redis = require( 'redis' );
const { promisify } = require( 'util' );

module.exports = async ( config, fixtures ) => {

  const con = mysql.createConnection( {
    user: config.mysql.user,
    password: config.mysql.password,
    multipleStatements: true
  } );

  const redisClient = redis.createClient();

  const redisSet = promisify( redisClient.set ).bind( redisClient );

  const { sql, redisKeyContents } = fixtures;

  await promisify( con.query.bind( con ) )( sql.replace( /\{database\}/g, config.mysql.database ) );

  for( const redisKey of _.keys( redisKeyContents ) ) {

    await redisSet( config.redisPrefix + redisKey, redisKeyContents[ redisKey ] );

  }

  con.end();

  return redisClient;

}
