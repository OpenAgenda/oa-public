"use strict";

const _ = require( 'lodash' );
const flattener = require( 'flattener' );
const getTargetField = require( './getTargetField' );
const makeTransform = require( 'stream-utils' ).transform;
const validateOptions = require( './options.validate.js' );

const multilingual = require( './multilingual' );
const accessibility = require( './accessibility' );
const timings = require( './timings' );

module.exports = _.extend( ( options = {} ) => {

  const flatten = getFlattener( options );

  return makeTransform( flatten );

}, {
  getFlattener
} );

function getFlattener( options ) {

  const labelLanguages = [ 'fr', 'en' ];
  const cleanOptions = validateOptions( options );
  const getTarget = getTargetField.bind( null, cleanOptions.labels, cleanOptions.lang );

  // make a flat map.
  const fieldMap = [ {
    source: 'uid',
    target: getTarget( 'uid' )
  }, {
    source: 'title',
    target: getTarget( 'title' ),
    type: 'multilingual'
  }, {
    source: 'description',
    target: getTarget( 'description' ),
    type: 'multilingual'
  }, {
    source: 'longDescription',
    target: getTarget( 'longDescription' ),
    type: 'multilingual'
  }, {
    source: 'keywords',
    target: getTarget( 'keywords' ),
    type: 'multilingual',
    postParse: data => data ? data.join( ' | ' ) : ''
  }, {
    source: 'dateRange',
    target: getTarget( 'range' ),
    type: 'multilingual',
    possibleLanguages: labelLanguages
  }, {
    field: 'timings',
    type: 'timings',
    target: getTarget( 'timings' ),
    isoTarget: getTarget( 'isoTimings' )
  }, {
    source: 'conditions',
    target: getTarget( 'conditions' ),
    type: 'multilingual'
  }, {
    type: 'accessibility',
    target: getTarget( 'accessibility' )
  }, {
    source: 'location.uid',
    target: getTarget( 'location.uid' )
  }, {
    source: 'location.name',
    target: getTarget( 'location.name' )
  }, {
    source: 'location.address',
    target: getTarget( 'location.address' )
  }, {
    source: 'location.city',
    target: getTarget( 'location.city' )
  }, {
    source: 'location.department',
    target: getTarget( 'location.department' )
  }, {
    source: 'location.region',
    target: getTarget( 'location.region' )
  }, {
    source: 'location.latitude',
    target: getTarget( 'location.latitude' )
  }, {
    source: 'location.longitude',
    target: getTarget( 'location.longitude' )
  }, {
    source: 'country',
    type: 'multilingual',
    target: getTarget( 'location.countryCode' ),
    possibleLanguages: labelLanguages
  } ].map( c => {

    return _.get( {
      timings: timings.bind( null, cleanOptions ),
      accessibility: accessibility.bind( null, cleanOptions ),
      multilingual: multilingual.bind( null, cleanOptions ),
    }, c.type, c => ( {
      source: c.source, 
      target: c.target || c.source
    } ) )( c )

  } );

  return flattener( fieldMap );

}