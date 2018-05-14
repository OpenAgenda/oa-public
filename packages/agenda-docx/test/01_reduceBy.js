"use strict";

const fs = require( 'fs' );

const reduceBy = require( '../server/lib/reduceBy' );

const reduceByDeep = require( '../server/lib/reduceByDeep' );

const items = [ {
  title: 'one',
  location: {
    name: 'Gaité Lyrique',
    city: 'Paris',
    region: 'Ile de France',
    country: 'France'
  }
}, {
  title: 'two',
  location: {
    name: 'Le Select',
    city: 'Paris',
    region: 'Ile de France',
    country: 'France'
  }
}, {
  title: 'three',
  location: {
    name: 'Chez Papy',
    city: 'Paris',
    region: 'Ile de France',
    country: 'France'
  }
}, {
  title: 'four',
  location: {
    name: 'L\'Ossuaire de Douaumont',
    city: 'Verdun',
    region: 'Grand-Est',
    country: 'France'
  }
} ];

describe( 'unit - reduceBy', () => {

  test( 'shallow', () => {

    const reduced = reduceBy( items, 'location.name', { 
      targetKey: 'locationName',
      hoist: [ {
        source: 'location.city',
        target: 'city'
      } ]
    } );

    expect( reduced ).toEqual( JSON.parse( fs.readFileSync( __dirname + '/data/reduced.json', 'utf-8' ) ) );

  } );

  test( 'deep', () => {

    const reduced = reduceByDeep( items, [ {
      key: 'location.region',
      targetKey: 'region',
      childrenKey: 'cities',
      hoist: [ {
        source: 'location.country',
        target: 'country'
      } ]
    }, {
      key: 'location.city',
      targetKey: 'city',
      childrenKey: 'locations',
      hoist: [ {
        source: 'location.region',
        target: 'region'
      } ]
    }, {
      key: 'location.name',
      targetKey: 'locationName',
      childrenKey: 'events',
      hoist: [ {
        source: 'location.city',
        target: 'city'
      } ]
    } ] );

    expect( reduced ).toEqual( JSON.parse( fs.readFileSync( __dirname + '/data/reduced.deep.json', 'utf-8' ) ) );

  } );

} );