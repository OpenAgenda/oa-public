"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );

const knexLib = require( 'knex' );

const config = require( '../testconfig' );

const loadFixtures = require( './fixtures/load' );
const fixtures = require( './fixtures/01.data.js' );

const Service = require( '../' );

describe( '01 - tagsAndCustom - create', () => {

  let knex, service;

  beforeAll( async () => {

    await loadFixtures( config, fixtures );

    knex = knexLib( { client: 'mysql', connection: config.mysql } );

    service = Service( { knex } );

  } );

  afterAll( async () => {

    await knex.destroy();

  } );

  describe( 'Genève', () => {

    beforeAll( async () => {

      await service.set( 17492, 77648603, [
        fixtures.formSchemas.vdginstitutions,
        fixtures.formSchemas.vdg
      ], [ {
        "type-devenement-institutions":[ 25 ],
        "publics-cibles-institutions-typo3":[28,29]
      }, {
        "internal_remarks":{"fr":null},
        "service-contributeur":4,
        "type-devenement":38,
        "other_place":"Libellé un autre lieu",
        "quartiers":[15,16],
        "publics-cibles":[26,27],
        "organisation-de-levenement":31,
        "organisator":"un organisateur",
        "organisator_url":"www.untest.ch",
        "image_alt_text":"un test image",
        "thematiques-internes":[49,50,51],
        "labels":[24]
      } ] );

    } );

    it( 'custom', async () => {

      const store = JSON.parse( _.first( await knex( 'event' )
        .pluck( 'custom_fields' )
        .where( 'uid', 77648603 ) ) );

      expect( store ).toEqual( {
        "internal_remarks":{"fr":null},
        "other_place":"Libellé un autre lieu",
        "organisator":"un organisateur",
        "organisator_url":"www.untest.ch",
        "image_alt_text":"un test image"
      } );

    } );

    it( 'tags are created', async () => {

      const rta = await knex( 'review_tag_article' )
        .pluck( 'review_tag_id' )
        .where( 'review_article_id', 2010405 );

      expect( rta ).toEqual( [
        51461,
        51464,
        51465,
        62114,
        51446,
        56687,
        56688,
        51457,
        51458,
        56684,
        56679,
        56680,
        56681,
        56677
      ] );

    } );

  } );

  describe( 'Reed', () => {

    beforeAll( async () => {

      await service.set( 2935, 2457306, [
        fixtures.formSchemas.reedexpo,
        null
      ], [
        {"periodicity":1,"visitortypes":7,"year":16,"siteurl":"https://bit.ly/2Jt9cLT","organizeremail":null,"salesemail":null,"nomenclature":{"fr":"Consommables, produits réactifs, équipements, instrumentation et services","en":"Consumables, products/reagents, equipments, instrumentation and services"},"visitorprofiles":{"fr":"Tout l’écosystème du laboratoire : grandes, moyennes et petites entreprises, startups, chercheurs, étudiants, sociétés savantes mais aussi acheteurs et techniciens de laboratoire du secteur public ou des industries pharmaceutiques, chimiques, agroalimentaires, cosmétiques et des biotechnologies\n63% Secteur Privé : Industrie, Recherche privée, Contrôle, Qualité, Analyse, Process, Conseil\n37% Secteur public : Recherche fondamentale, académique, appliquée et publique. Institutionnels","en":"The entire laboratory ecosystem, from large, medium-sized and small companies, to start-ups, researchers, students and academic societies, plus buyers and lab technicians from the public sector and the pharmaceutical, chemical, food processing, cosmetic and biotechnology industries, to imagine and shape the laboratory of the future.\n63% private sector: industry, private research, testing, quality, analyses, process and consulting\n37% public sector: fundamental, academic, applied and public research. Institutions"},"ojs":[],"totalnumberofvisitors":8750,"brandcount":null,"attendance":null,"totalnumberexhibitors":340,"partner":null,"partnerurl":null,"organizername":"Reed Expositions France","organizerurl":"https://www.reedexpo.fr/","facebookurl":null,"twitterurl":"https://twitter.com/ForumLabo","flickrurl":null,"instagramurl":null,"pinteresturl":null,"youtubeurl":null,"linkedinurl":"https://www.linkedin.com/in/forumlabobiotech/","testimony":{},"imagetestimony":null,"authortestimony":null,"illustrationurl":null,"illustration":{"extension":null,"originalName":null,"filename":null},"category-group":26},
        null
      ] );

    } );

    it( 'custom values are stored in event table', async () => {

      const store = _.first( await knex( 'event' )
        .pluck( 'custom_fields' )
        .where( 'uid', 2457306 ) );

      expect( JSON.parse( store ) ).toEqual( JSON.parse( '{"periodicity":"annual","visitortypes":"professionalsonly","year":16,"siteurl":"https://bit.ly/2Jt9cLT","organizeremail":null,"salesemail":null,"nomenclature":{"fr":"Consommables, produits réactifs, équipements, instrumentation et services","en":"Consumables, products/reagents, equipments, instrumentation and services"},"visitorprofiles":{"fr":"Tout l’écosystème du laboratoire : grandes, moyennes et petites entreprises, startups, chercheurs, étudiants, sociétés savantes mais aussi acheteurs et techniciens de laboratoire du secteur public ou des industries pharmaceutiques, chimiques, agroalimentaires, cosmétiques et des biotechnologies\\n63% Secteur Privé : Industrie, Recherche privée, Contrôle, Qualité, Analyse, Process, Conseil\\n37% Secteur public : Recherche fondamentale, académique, appliquée et publique. Institutionnels","en":"The entire laboratory ecosystem, from large, medium-sized and small companies, to start-ups, researchers, students and academic societies, plus buyers and lab technicians from the public sector and the pharmaceutical, chemical, food processing, cosmetic and biotechnology industries, to imagine and shape the laboratory of the future.\\n63% private sector: industry, private research, testing, quality, analyses, process and consulting\\n37% public sector: fundamental, academic, applied and public research. Institutions"},"ojs":[],"totalnumberofvisitors":8750,"brandcount":null,"attendance":null,"totalnumberexhibitors":340,"partner":null,"partnerurl":null,"organizername":"Reed Expositions France","organizerurl":"https://www.reedexpo.fr/","facebookurl":null,"twitterurl":"https://twitter.com/ForumLabo","flickrurl":null,"instagramurl":null,"pinteresturl":null,"youtubeurl":null,"linkedinurl":"https://www.linkedin.com/in/forumlabobiotech/","testimony":{},"imagetestimony":null,"authortestimony":null,"illustrationurl":null,"illustration":null}' ) );

    } );

    it( 'transfers to category', async () => {

      const raEntry = await knex( 'review_article' )
        .first( 'category_id' )
        .where( 'id', 2169179 );

      expect( raEntry.category_id ).toBe( 498 );

    } );

  } );

  describe( 'JEP', () => {

    beforeAll( async () => {

      await service.set( 20062, 50492247, [
        fixtures.formSchemas.jep2019bretagne,
        fixtures.formSchemas.jep2019
      ], [
        {"diffusion-sur-le-pass-culture":[1],"siret":'80934615800011',"prix-pass-culture":null,"url-pass-culture":null},
        {"types-devenement":null,"theme-2019":[],"conditions-de-participation":[12]}
      ] );

    } );

    it( 'an event with custom data matching legacy tags is associated to legacy tags', async () => {

      const rta = await knex( 'review_tag_article' )
        .pluck( 'review_tag_id' )
        .where( 'review_article_id', 2169179 );

      expect( rta ).toEqual( [ 59282, 58337 ] );

    } );

    it( 'custom data values that do not match tags are synced in legacy custom values store', async () => {

      const store = _.first( await knex( 'event' )
        .pluck( 'custom_fields' )
        .where( 'uid', 50492247 ) );

      expect( store ).toEqual( '{"siret":"80934615800011","prix-pass-culture":null,"url-pass-culture":null}' );

    } );

  } );

} );
