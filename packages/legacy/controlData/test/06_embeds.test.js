"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );

const knexLib = require( 'knex' );

const config = require( '../testconfig' );

const loadFixtures = require( './fixtures/load' );
const fixtures = require( './fixtures/06.data.js' );

const buildEmbedControlData = require( '../lib/utils/buildEmbedControlData' );
const loadEmbedControlData = require( '../lib/utils/loadEmbedControlData' );

describe( '06 - control data - embeds', () => {

  let redisClient, knex, service;

  beforeAll( async () => {

    redisClient = await loadFixtures( config, fixtures );

    knex = knexLib( { client: 'mysql', connection: config.mysql } );

  } );

  afterAll( async () => {

    await redisClient.del( config.redisPrefix + 'embeds:80933440' );

    await redisClient.quit();

    await knex.destroy();

  } );

  describe( 'build embed data', () => {

    test( 'SIA', async () => {

      const result = await buildEmbedControlData( {
        knex,
        redis: redisClient,
        prefix: config.redisPrefix
      }, 21898722 );

      expect( result ).toEqual( {
        md: 'tiled',
        sh:
         { fb: true,
           tw: true,
           gp: true,
           li: true,
           tu: true,
           pi: true,
           em: true },
        href: true,
        ues: false,
        dcss:
         { list: true,
           map: true,
           search: true,
           categories: true,
           tags: true,
           calendar: true,
           form: true },
        sc: true,
        mp: 'all',
        mc: '',
        ma: false,
        mt: false,
        classes: {}
      } );

    } );


    test( 'Albi', async () => {

      const result = await buildEmbedControlData( {
        knex,
        redis: redisClient,
        prefix: config.redisPrefix,
        imagePath: 'https://cibul.s3.amazonaws.com/'
      }, 80933440 );

      expect( result ).toEqual( {
        md: 'cascading',
        sh:
         { fb: true,
           tw: true,
           gp: false,
           li: false,
           tu: false,
           pi: true,
           em: true },
        href: true,
        ues: false,
        dcss:
         { list: true,
           map: true,
           search: true,
           categories: true,
           tags: true,
           calendar: true,
           form: true },
        sc: true,
        mp: 'all',
        mc: '51.01375465718821|17.578125|41.96765920367816|-15.205078125',
        mi: {
          a: 'https://cibul.s3.amazonaws.com/icon_46442588_43375820_a.png?110046710',
          i: 'https://cibul.s3.amazonaws.com/icon_46442588_43375820_i.png?1743347075'
        },
        ms: {
          a: [ 32, 38 ],
          i: [ 32, 38 ]
        },
        ma: true,
        mt: false,
        classes:
         { concert: 'concert',
           conference: 'conference',
           exposition: 'exposition',
           lecture: 'lecture',
           projection: 'projection',
           rencontre: 'rencontre',
           spectacle: 'spectacle'
         }
      } );

    } );

  } );


  describe( 'store embed control data', () => {

    test( 'embed control data is built and stored if unavailable', async () => {

      await redisClient.del( config.redisPrefix + 'embeds:80933440' );

      const str = await loadEmbedControlData( {
        knex,
        redis: redisClient,
        prefix: config.redisPrefix,
        imagePath: 'https://cibul.s3.amazonaws.com/'
      }, 80933440 );

      expect( str ).toBe( '{"md":"cascading","sh":{"fb":true,"tw":true,"gp":false,"li":false,"tu":false,"pi":true,"em":true},"href":true,"ues":false,"dcss":{"list":true,"map":true,"search":true,"categories":true,"tags":true,"calendar":true,"form":true},"sc":true,"mp":"all","mc":"51.01375465718821|17.578125|41.96765920367816|-15.205078125","ma":true,"mt":false,"classes":{"concert":"concert","conference":"conference","exposition":"exposition","lecture":"lecture","projection":"projection","rencontre":"rencontre","spectacle":"spectacle"},"mi":{"a":"https://cibul.s3.amazonaws.com/icon_46442588_43375820_a.png?110046710","i":"https://cibul.s3.amazonaws.com/icon_46442588_43375820_i.png?1743347075"},"ms":{"a":[32,38],"i":[32,38]}}' );

      const stored = await redisClient.get( config.redisPrefix + 'embeds:80933440' );

      expect( stored ).toBe( str );

    } );

  } );

} );
