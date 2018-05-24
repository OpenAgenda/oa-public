"use strict";

const fs = require( 'fs' );
const prompt = require( 'prompt-input' );

const generateDocument = require( './server/generateDocument' );

( async () => {

  try {

    const templatePath = await _term( 'What is the path to the input docx template ?', {
      default: __dirname + '/input.docx'
    } );

    const localTmpPath = await _term( 'Where should the generated file be placed?', {
      default: '/var/tmp/docx'
    } );

    const agendaUid = await _term( 'What is the uid of the agenda to export?', {
      default: 63106080 // jep 2018 guyane
    } );

    console.log( 'generating output...' );

    const {
      outputPath,
      agenda,
      events
    } = await generateDocument( {
      agendaUid,
      localTmpPath,
      templatePath,
      language: 'fr'
    } );

    fs.writeFileSync( localTmpPath + '/' + agendaUid + '.formatted.json', JSON.stringify( events, null, 2 ), 'utf-8' );

    console.log( 'output generated at %s', outputPath );

    process.exit();

  } catch ( e ) {

    console.log( 'generation failed', e );

  }

} )();

function _term( message, options = {} ) {

  return new prompt(Object.assign( options, { message } ) ).run();

}