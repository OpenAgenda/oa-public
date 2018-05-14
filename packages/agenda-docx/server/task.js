"use strict";

const ih = require( 'immutability-helper' );

const config = require( './config' );
const cleanString = require( './lib/cleanString' );
const agendaFiles = require( './lib/agendaFiles' );
const defaultState = require( './defaultState' );
const generateDocument = require( './generateDocument' );
const queue = require( './queue' );

module.exports = () => {

  loop();

}


async function loop() {

  const data = await queue.waitAndPop();

  const files = agendaFiles( {
    s3: config.s3,
    bucket: config.s3.bucket,
    uid: data.uid
  } );

  let state = await files.getJSON( 'state', defaultState );

  try {

    const {
      outputPath,
      agenda
    } = await generateDocument( {
      agendaUid: data.uid,
      localTmpPath: config.localTmpPath,
      templatePath: __dirname + '/../input.docx',
      language: 'fr'
    } );

    const filename = cleanString( agenda.title + '.docx' );

    const { path } = await files.set( outputPath, filename );

    state = ih( state, {
      file: {
        $set: {
          name: filename,
          path,
          createdAt: new Date()
        }
      }
    } );

  } catch ( e ) {

    console.log( 'error', e );

  } 

  await files.setJSON( 'state', ih( state, {
    queued: { $set: false } 
  } ) );

  loop();

}