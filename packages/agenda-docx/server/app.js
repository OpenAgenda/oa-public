"use strict";

const app = require( 'express' )();
const ih = require( 'immutability-helper' );

const agendaFiles = require( './lib/agendaFiles' );
const queue = require( './queue' );
const config = require( './config' );

const defaultState = require( './defaultState' );

app.param( 'agendaUid', ( req, res, next, uid ) => {

  req.agendaFiles = agendaFiles( {
    s3: config.s3,
    bucket: config.s3.bucket,
    uid
  } );

  next();

} );

app.get( '/:agendaUid/state', async ( req, res ) => {

  res.json( await req.agendaFiles.getJSON( 'state', defaultState ) );

} );

app.post( '/:agendaUid/queue', async ( req, res ) => {

  const state = await req.agendaFiles.getJSON( 'state', defaultState );

  const updatedState = ih( state, {
    queued: { $set: true },
    lastQueuedAt: { $set: JSON.stringify( new Date() ) }
  } );

  await req.agendaFiles.setJSON( 'state', updatedState );

  await queue( { uid: req.params.agendaUid } );

  res.json( updatedState );

} );

module.exports = app;