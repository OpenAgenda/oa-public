"use strict";

const express = require( 'express' );

const AgendaFiles = require( '../server/lib/agendaFiles' );
const config = require( './config' );
const queue = require( './queue' );
const task = require( './task' );

const defaultState = require( './defaultState' );

module.exports = {
  init: c => {

    config.init( c );

    queue.init( c.queue );

  },
  app: require( './app' ),
  task,
  getState,
  dist: express.static( __dirname + '/../client/dist' )
}

function getState( agendaUid ) {

  return AgendaFiles( {
    s3: config.s3,
    bucket: config.s3.bucket,
    uid: agendaUid
  } ).getJSON( 'state', defaultState );

}