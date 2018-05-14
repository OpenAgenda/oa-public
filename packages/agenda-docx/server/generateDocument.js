"use strict";

const _ = require( 'lodash' );
const Docxtemplater = require( 'docxtemplater' );
const fs = require( 'fs' );
const JSZip = require( 'jszip' );
const { promisify } = require( 'util' );

const formatEvent = require( './lib/formatEvent' );
const reduceByDeep = require( './lib/reduceByDeep' );

const readFile = promisify( fs.readFile, fs );
const writeFile = promisify( fs.writeFile, fs );

const { fetchAndStoreEvents, loadEventsFromFile, loadAgendaDetails } = require( './lib/fetch' );

module.exports = async ( { agendaUid, localTmpPath, templatePath, language } ) => {

  const outputPath = localTmpPath + `/${agendaUid}.${(new Date).getTime()}.docx`;

  //const eventsFilePath = await fetchAndStoreEvents( localTmpPath, agendaUid );
  const eventsFilePath = '/var/tmp/47800929.events.json';

  const events = await loadEventsFromFile( eventsFilePath );

  const { title, description, url } = await loadAgendaDetails( agendaUid );

  const content = await readFile( templatePath, 'binary' );

  const doc = new Docxtemplater();

  doc.loadZip( new JSZip( content ) );
  
  const formattedEvents = events.map( e => formatEvent( e, language ) );

  const regions = reduceByDeep( formattedEvents, [ {
    key: 'location.region',
    targetKey: 'region',
    childrenKey: 'departments',
    hoist: [ {
      source: 'location.country',
      target: 'country'
    } ]
  }, {
    key: 'location.department',
    targetKey: 'department',
    childrenKey: 'cities',
    hoist: [ {
      source: 'location.region',
      target: 'region'
    } ]
  }, {
    key: 'location.city',
    targetKey: 'city',
    childrenKey: 'locations',
    hoist: [ {
      source: 'location.department',
      target: 'department'
    }, {
      source: 'location.region',
      target: 'region'
    } ]
  }, {
    key: 'location.name',
    targetKey: 'location',
    childrenKey: 'events',
    hoist: [ {
      source: 'location.address',
      target: 'address'
    }, {
      source: 'location.description',
      target: 'description'
    }, {
      source: 'location.access',
      target: 'access'
    }, {
      source: 'location.tags',
      target: 'tags'
    }, {
      source: 'location.phone',
      target: 'phone'
    }, {
      source: 'location.website',
      target: 'website'
    } ]
  } ] );

  doc.setData( {
    agenda: {
      title, description, url
    },
    regions
  } );

  doc.render();

  await writeFile( outputPath, doc.getZip().generate( { type: 'nodebuffer' } ) );

  return {
    outputPath,
    agenda: {
      title, description, url
    }
  }

}