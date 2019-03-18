"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );
const AdresseDataGouvFR = require( '../AdresseDataGouvFR' );
//const config = require( '../testconfig' );

describe( 'adresse.data.gouv.fr', function() {

  const geocode = AdresseDataGouvFR();

  describe( 'forward', () => {

    it( 'A simple geocode only provides sparse data', async () => {

      _.keys( await geocode( '139 rue des arts, Roubaix', {
        first: true
      } ) ).should.eql( [
        'address', 'city', 'postalCode', 'insee', 'latitude', 'longitude'
      ] );

    } );

  } );

  describe( 'detailed', () => {

    it( 'Provides region and department for Roubaix', async () => {

      const result = await geocode.detailed( '139 rue des arts, Roubaix' );

      _.keys( result ).should.eql( [
        'address',
        'city',
        'postalCode',
        'insee',
        'latitude',
        'longitude',
        'department',
        'region'
      ] );

      result.department.should.equal( 'Nord' );

      result.region.should.equal( 'Hauts-de-France' );

    } );

    it( 'St-Malo gives Saint-Malo', async () => {

      const result = await geocode.detailed( 'Terre-Plein du Naye, 35400 St-Malo, France' );

      result.city.should.equal( 'Saint-Malo' );

      result.department.should.equal( 'Ille-et-Vilaine' );

      result.region.should.equal( 'Bretagne' );

    } );

  } );

} );
