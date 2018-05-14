"use strict";

const fs = require( 'fs' );
const sa = require( 'superagent' );

const config = require( '../config.dev' );

const AgendaFiles = require( '../server/lib/agendaFiles' );

describe( 'unit - files', () => {

  const {
    setJSON,
    getJSON,
    removeJSON,
    set,
    remove
  } = AgendaFiles( {
    s3: config.s3,
    bucket: config.s3.bucket,
    uid: 'test02'
  } );

  test( 'set a json file, get it back, delete it', async () => {

    const json = await getJSON( 'test', { thisIsADefaultObject: true } );

    expect( json ).toEqual( { thisIsADefaultObject: true } );

    await setJSON( 'test', { thisIsAnUploadedJSON: true } );

    const json2 = await getJSON( 'test', null );

    expect( json2 ).toEqual( { thisIsAnUploadedJSON: true } );

    await removeJSON( 'test' );

    const json3 = await getJSON( 'test', { defaultObjectAgain: true } );

    expect( json3 ).toEqual( { defaultObjectAgain: true } );

  } );

  test( 'upload a file from local path, check it, delete it', async () => {

    const { localTmpPath } = config;

    const content = 'content_' + ( new Date ).getTime();

    fs.writeFileSync( localTmpPath + '/test.txt', content, 'utf-8' );

    const { path } = await set( localTmpPath + '/test.txt', 'mytestfile.txt' );

    expect( path ).toEqual( `https://${config.s3.bucket}.s3.eu-west-3.amazonaws.com/test02/mytestfile.txt` );    

  } );

} );