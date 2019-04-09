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

    describe( 'DOM-TOM', async () => {

      /*it( 'Mayotte addresses respond to YT country code', async () => {

        ( await geocode( 'Espace Canopia- Les Hauts Vallons, Mamoudzou, Mayotte', {
          countryCode: 'YT',
          language: 'fr'
        } ) ).length.should.greaterThan( 0 );

      } );

      it( 'Polynésie Française addresses respond to PF country code', async () => {

        ( await geocode( 'Papeari, PAPEETE, Polynésie française', {
          countryCode: 'PF',
          language: 'fr'
        } ) ).length.should.greaterThan( 0 );

      } );*/

      it( 'Saint Pierre et Miquelon addresses respond to PM country code', async () => {

        ( await geocode( 'Rue du 11 novembre B.P. 4208, Saint-Pierre, Saint-Pierre-et-Miquelon', {
          countryCode: 'PM',
          language: 'fr'
        } ) ).length.should.greaterThan( 0 );

      } );

      it( 'Guyane addresses respond to GF country code', async () => {

        ( await geocode( '78, rue Madame Payé, 97300 Cayenne', {
          countryCode: 'GF',
          language: 'fr'
        } ) ).length.should.greaterThan( 0 );

      } );

      it( 'Nouvelle Calédonie addresses respond to RE country code', async () => {

        ( await geocode( 'Maison Célières, 21, route du Port-Despointes, Faubourg-Blanchot, NOUMEA, Nouvelle-Calédonie', {
          countryCode: 'NC',
          language: 'fr'
        } ) ).length.should.greaterThan( 0 );

      } );

      it( 'Réunion addresses respond to RE country code', async () => {

        ( await geocode( '13, Ruelle Edouard, 97400 Saint-denis', {
          countryCode: 'RE',
          language: 'fr'
        } ) ).length.should.greaterThan( 0 );

      } );

      it( 'Martinique addresses respond to MQ country code', async () => {

        ( await geocode( '9, rue de la Liberté, 97200 Fort-de-France', {
          countryCode: 'MQ',
          language: 'fr'
        } ) ).length.should.greaterThan( 0 );

      } );

      it( 'Guadeloupe addresses respond to GP country code', async () => {

        ( await geocode( '9 rue Nozières, Pointe-à-Pitre 97110, Guadeloupe', {
          countryCode: 'GP',
          language: 'fr',
          first: true
        } ) ).city.should.eql( 'Pointe-à-Pitre' );

      } );

    } );

    describe( 'Courbevoie', async () => {

      let result;

      before( async () => {

        result = await geocode( 'Courbevoie', {
          countryCode: 'FR',
          language: 'fr',
          first: true
        } );

      } );

      it( 'it is in Hauts de Seine', async () => {

        result.department.should.equal( 'Hauts-de-Seine' );

      } );


    } );

    describe( 'Sarzeau', async () => {

      let result;

      before( async () => {

        result = await geocode( 'Sarzeau', {
          countryCode: 'FR',
          language: 'fr',
          first: true,
          raw: true
        } );

      } );

      it( 'department is Morbihan', () => {

        result.department.should.equal( 'Morbihan' );

      } );

      it( 'city is Sarzeau', () => {

        result.city.should.equal( 'Sarzeau' );

      } );


    } );

  } );

  describe( 'reverse', () => {

    describe( 'Lille', () => {

      let result;

      before( async () => {

        result = await geocode.reverse( 50.6310623, 3.012141, {
          first: true,
          language: 'fr'
        } );

      } );

      it( 'city is Lille', () => {

        result.city.should.equal( 'Lille' );

      } );

      it( 'department is Nord', () => {

        result.department.should.equal( 'Nord' );

      } );

      it( 'district is Lomme', () => {

        result.district.should.equal( 'Lomme' );

      } );

    } );

    describe( 'Roubaix', () => {

      let result;

      before( async () => {

        result = await geocode.reverse( 50.6879439, 3.1674618, {
          first: true,
          language: 'fr'
        } );

      } );

      it( 'city is Roubaix', () => {

        result.city.should.equal( 'Roubaix' );

      } );

      it( 'department is Nord', () => {

        result.department.should.equal( 'Nord' );

      } );

      it( 'district is Ouest', () => {

        result.district.should.equal( 'Ouest' );

      } );

    } );

    describe( 'Berlin', () => {

      let result;

      before( async () => {

        result = await geocode.reverse( 52.5067614, 13.284651, {
          first: true,
          language: 'fr'
        } );

      } );

      it( 'have district', () => {

        result.district.should.equal( 'Charlottenburg-Wilmersdorf' );

      } );

    } );

    describe( 'Courbevoie', () => {

      let result;

      before( async () => {

        result = await geocode.reverse( 48.8953328, 2.2561602, {
          first: true,
          language: 'fr'
        } );

      } );

      it( 'department is Hauts-de-Seine', () => {

        result.department.should.equal( 'Hauts-de-Seine' );

      } );

    } );

    it( 'In Guyane', async () => {

      _.pick( await geocode.reverse( 5.6688522, -53.7819599, {
        first: true,
        language: 'fr'
      } ), [
        'city', 'department', 'region', 'timezone', 'country', 'countryCode'
      ] ).should.eql( {
        city: 'Mana',
        department: null,
        region: 'Guyane',
        country: 'France',
        countryCode: 'fr',
        timezone: 'America/Cayenne'
      } );

    } );

  } );

} );
