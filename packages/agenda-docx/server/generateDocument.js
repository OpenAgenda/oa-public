'use strict';

const fs = require( 'fs' );
const { promisify } = require( 'util' );
const Docxtemplater = require( 'docxtemplater' );
const JSZip = require( 'jszip' );
const expressions= require('angular-expressions');
const _ = require( 'lodash' );

const formatEvent = require( './lib/formatEvent' );
const reduceByDeep = require( './lib/reduceByDeep' );
const sortBy = require( './lib/sortBy' );
const defaultReducer = require( './defaultReducer' );

const readFile = promisify( fs.readFile, fs );
const writeFile = promisify( fs.writeFile, fs );

const {
  fetchAndStoreEvents,
  loadEventsFromFile,
  loadAgendaDetails,
} = require( './lib/fetch' );

module.exports = async ( {
  agendaUid,
  localTmpPath,
  templatePath,
  templateContent,
  reducer = defaultReducer,
  language,
  query = {}
} = {} ) => {

  const outputPath = `${localTmpPath}/${agendaUid}.${new Date().getTime()}.docx`;

  const eventsFilePath = await fetchAndStoreEvents( localTmpPath, agendaUid, query );

  const events = await loadEventsFromFile( eventsFilePath );

  const { title, description, url } = await loadAgendaDetails( agendaUid );

  const content = templateContent || ( await readFile( templatePath, 'binary' ) );

  const doc = new Docxtemplater();

  doc.loadZip( new JSZip( content ) );

  const formattedEvents = events.map( e => formatEvent( e, language ) );

  const reduced = reduceByDeep( formattedEvents, reducer );

  doc.setData( {
    agenda: {
      title,
      description,
      url
    },
    ...reduced
  } );

  expressions.filters.join = ( input, delimiter ) => input.join( delimiter );
  expressions.filters.map = ( input, propName ) => _.map( input, propName );
  expressions.filters.sortBy = ( input, keys ) => sortBy( input, keys );

  const parser = tag => ( {
    get: tag === '.'
      ? s => s
      : s => expressions.compile( tag.replace( /(’|“|”)/g, '\'' ) )( s )
  } );

  doc.setOptions( { parser } );

  doc.render();

  await writeFile(
    outputPath,
    doc.getZip()
      .generate( {
        type: 'nodebuffer',
        compression: 'DEFLATE'
      } )
  );

  return {
    outputPath,
    events: formattedEvents,
    agenda: {
      title,
      description,
      url
    }
  };

};
