"use strict";

const fs = require( 'fs' );
const config = require( '../config.dev' );
const generate = require( '../server/generateDocument' );

describe( 'unit - generate document', () => {

  let docPath;

  afterAll( done => {

    fs.unlink( docPath, done );

  } );

  test( 'generates a word document when given an agenda uid', async () => {

    const result = await generate( {
      agendaUid: 47800929,
      localTmpPath: config.localTmpPath,
      templatePath: __dirname + '/../input.docx',
      language: 'fr'
    } );

    docPath = result.outputPath;

    // /var/tmp/47800929.1525771511254.docx
    expect( /47800929\.[0-9]+\.docx$/.test( docPath ) ).toBe( true );

  } );

} );