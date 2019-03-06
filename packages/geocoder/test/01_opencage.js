"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );
const Opencage = require( '../Opencage' );
const config = require( '../testconfig' );

describe( 'opencage', () => {

  const geocode = Opencage( config.opencage );

  describe( 'forward', () => {

    it( 'An address in roubaix. No district provided', async () => {

      ( await geocode( '139 rue des arts, Roubaix', {
        countryCode: 'FR',
        language: 'fr',
        first: true
      } ) ).city.should.equal( 'Roubaix' );

    } );

    it( 'Brussels is in Belgium', async () => {

      ( await geocode( 'Place du Jeu de Balle, Bruxelles', {
        countryCode: 'BE',
        language: 'fr',
        first: true
      } ) ).countryCode.should.eql( 'be' );

    } );

    it( 'St-Malo gives Saint-Malo', async () => {

      ( await geocode( 'Terre-Plein du Naye, 35400 St-Malo, France', {
        countryCode: 'FR',
        language: 'fr',
        first: true
      } ) ).city.should.eql( 'Saint-Malo' );

    } );

    it( 'Sarzeau is not in Morbihan according to OpenCage', async () => {

      ( await geocode( 'Sarzeau', {
        countryCode: 'FR',
        language: 'fr',
        first: true,
        raw: true
      } ) ).department.should.eql( 'Vannes' );

    } );

  } );

  describe( 'reverse', () => {

    it( 'In Paris', async () => {

      ( await geocode.reverse( 48.867638, 2.352172, {
        first: true,
        language: 'fr'
      } ) ).city.should.equal( 'Paris' );

    } );

    it( 'In Guyane', async () => {

      _.pick( await geocode.reverse( 5.6688522, -53.7819599, {
        first: true,
        language: 'fr'
      } ), [
        'city', 'department', 'region', 'timezone', 'country', 'countryCode'
      ] ).should.eql( {
        city: 'Mana',
        department: 'Guyane',
        region: 'Guyane',
        country: 'France',
        countryCode: 'fr',
        timezone: 'America/Cayenne'
      } );

    } );

  } );

} );
