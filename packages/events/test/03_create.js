"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );
const fs = require( 'fs' );
const ih = require( 'immutability-helper' );
const mysql = require( 'mysql' );
const should = require( 'should' );

const svc = require( './service' );
const config = require( '../testconfig' );

const imageFiles = require( '@openagenda/image-files' );

describe( 'events -03- functional (server): create', function() {

  this.timeout( 30000 );

  beforeEach( done => {

    fs.createReadStream( __dirname + '/service/night_king.png' )

      .pipe( fs.createWriteStream( __dirname + '/service/tmp.png' ) )

      .on( 'close', () => {

        done ()

      } );

  } );

  before( done => {

    // image files is an independent service
    // that formats and loads given images on
    // s3. The event service calls it when
    // it is given images as local paths or urls
    imageFiles.init( config.tests.imageFiles );

    svc.initAndLoad( ih( config, {
      interfaces: {
        imageFilesLoad: {
          $set: imageFiles.load
        }
      }
    } ), [
      config.schemas.event + '_empty',
      config.legacy.schemas.event
    ], { reset: true }, done );

  } );

  after( svc.shutdown );

  describe( 'draft', () => {

    it( 'create empty draft', async () => {

      const { success } = await svc.create( {}, { draft: true } );

      success.should.equal( true );

    } );

    it( 'create the simplest draft event', done => {

      svc.create( {}, { draft: true }, ( err, result ) => {

        should( err ).equal( null );

        result.should.eql( {
          event: {
            slug: result.event.slug,
            uid: result.event.uid,
            title: {},
            description: {},
            longDescription: {},
            conditions: {},
            keywords: {},
            image: {
              filename: null,
              credits: null,
              base: '//openagendatst.s3.amazonaws.com/',
              size: {
                width: null,
                height: null
              }, variants: [],
            },
            draft: 1,
            private: 0,
            references: [],
            timezone: 'Europe/Paris',
            timings: [],
            updatedAt: result.event.updatedAt,
            createdAt: result.event.createdAt,
            locationUid: null,
            agendaUid: null,
            accessibility: {
              mi: false,
              hi: false,
              pi: false,
              vi: false,
              sl: false
            },
            age: {
              min: null,
              max: null
            },
            registration: [],
            links: [],
            references: [],
            fileKey: null
          },
          valid: true,
          success: true,
          errors: [] ,
          transferedToLegacy: false
        } );

        done();

      } );

    } );

    it( 'create the simplest draft event with image provided as url', async () => {

      const { event } = await svc.create( {
        image: {
          url: 'https://s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
        }
      }, { draft: true } );

      event.image.size.should.eql( { width: 600, height: 600 } );

      /* {
        filename: '636eaeeeb44243e4a76a3c12b8928045.base.image.jpg',
        size: { width: 600, height: 600 },
        variants:
         [ { filename: '636eaeeeb44243e4a76a3c12b8928045.full.image.jpg',
             type: 'full',
             size: [Object] },
           { filename: '636eaeeeb44243e4a76a3c12b8928045.thumb.image.jpg',
             type: 'thumbnail',
             size: [Object] } ],
        credits: null,
        base: '//openagendatst.s3.amazonaws.com/'
      } */

    } );

    it( 'create the simplest draft event with image as local path', async () => {

      const { event } = await svc.create( {
        image: {
          path: __dirname + '/service/tmp.png',
          credits: 'Cé moi kai pri la foto'
        }
      }, { draft: true } );

      event.image.size.should.eql( { width: 600, height: 913 } );

      event.image.variants.map( v => v.type ).should.eql( [ 'full', 'thumbnail' ] );

      /*{
        "filename": "c3adffbad2d848d3b747ba7878d9f160.base.image.jpg",
        "size": {
          "width": 600,
          "height": 913
        },
        "variants": [
          {
            "filename": "c3adffbad2d848d3b747ba7878d9f160.full.image.jpg",
            "type": "full",
            "size": {
              "width": 449,
              "height": 683
            }
          },
          {
            "filename": "c3adffbad2d848d3b747ba7878d9f160.thumb.image.jpg",
            "type": "thumbnail",
            "size": {
              "width": 200,
              "height": 200
            }
          }
        ],
        "credits": "Cé moi kai pri la foto"
      }*/

    } );


    it( 'when create is not protected, updatedAt and createdAt timestamps can be explicited', async () => {

      const createdAt = new Date( '1981-02-28T03:00:00.000Z' );

      const updatedAt = new Date( '2017-07-02T13:29:00.000Z' );

      let result = await svc.create( {
        createdAt,
        updatedAt
      }, { draft: true, protected: false } );

      result.event.createdAt.getTime().should.equal( createdAt.getTime() );

      result.event.updatedAt.getTime().should.equal( updatedAt.getTime() );

    } );

  } );

  describe( 'simple event', () => {

    const times = {
      monday: new Date( '2017-07-03T11:00' ),
      tuesday: new Date( '2017-07-04T12:00' ),
      wednesday: new Date( '2017-07-05T12:00' )
    };

    const eventData = {
      title: {
        fr: 'Un événement'
      },
      timings: [ {
        begin: times.wednesday,
        end: times.wednesday
      }, {
        begin: times.monday,
        end: times.monday
      }, {
        begin: times.tuesday,
        end: times.tuesday
      } ]
    };

    let result;

    before( async () => {

      result = await svc.create( eventData );

    } );


    it( 'timings are stored in chronological order', () => {

      try {

        ( new Date( result.event.timings[ 0 ].begin ) ).getTime()

          .should.equal( times.monday.getTime() );

        ( new Date( result.event.timings[ 2 ].begin ) ).getTime()

          .should.equal( times.wednesday.getTime() );

      } catch ( e ) {

        console.log( e );

        should().ok();

      }

    } );

    it( 'result contains valid, success, errors, transferedToLegacy and event keys', () => {

      _.keys( result ).should.eql( [ 'event', 'valid', 'success', 'errors', 'transferedToLegacy' ] );

    } );

    it( 'an entry is added to db', done => {

      const con = mysql.createConnection( config.mysql );

      con.query( `select * from ${config.schemas.event} where uid=${result.event.uid}`, ( err, rows ) => {

        rows.length.should.equal( 1 );

        new Date( rows[ 0 ].updated_at ).toString().should.equal( result.event.updatedAt.toString() );
        new Date( rows[ 0 ].created_at ).toString().should.equal( result.event.createdAt.toString() );

        con.end();

        done();

      } );

    } );

    it( 'create can be done with callback response', done => {

      svc.create( eventData, ( err, result ) => {

        result.success.should.equal( true );

        done();

      } );

    } );

    it( 'if not provided links is an empty array', () => {

      result.event.links.should.eql( [] );

    } );

  } );

  describe( 'fully defined event', () => {

    const eventData = {
      title: {
        fr : 'Un titre'
      },
      ownerUid: 123,
      creatorUid: 456,
      locationUid: 789,
      draft: false,
      description: {
        fr: 'Une description'
      },
      longDescription: {
        fr: 'Une description longue'
      },
      keywords: {
        fr: [ 'Des', 'mots', 'clés' ]
      },
      conditions: {
        fr: 'Etre vivant'
      },
      registration: [
        '018436269',
        'email@site.com',
        'https://website.com'
      ],
      references: [ 1, 2, 3 ],
      image: {
        filename: 'image.jpg',
        credits: 'Cé moi kai pri la foto',
        base: '//openagendatst.s3.amazonaws.com/',
        size: {
          height: null,
          width: null
        },
        variants: []
      },
      accessibility: {
        mi: true,
        hi: true
      },
      fileKey: null,
      timezone: 'Europe/Paris',
      timings: [ {
        begin: new Date(),
        end: new Date()
      } ],
      age: {
        min: 2,
        max:76
      },
      links: [ {
        type: 'oembed',
        link: 'https://someoembeddablelink.com',
        data: {
          description: "« CEINTURE NOIRE » 🥋\nNouvel Album maintenant disponible :\nhttps://maitregims.lnk.to/CeintureNoire\n\nEn tournée dans toute la France et au Stade de France le 28/09/2019\nBilletterie sur www.FuegoTour.com\n--\nFacebook : https://www.facebook.com/maitregimsoff\nInstagram : https://instagram.com/maitregims\nTwitter : https://twitter.com/maitregims\nSnapchat : Warano75\n--\nAbonne-toi à la chaîne : http://bit.ly/2q6P6Ni"
        }
      } ]
    };

    let result;

    before( async () => {

      result = await svc.create( eventData );

    } );

    it( 'slug is derived from title', () => {

      result.event.slug.should.equal( 'un-titre' );

    } );

    it( 'title, description, longDescription, conditions, keywords of event are given in response', () => {

      _.pick( result.event, [ 'title', 'description', 'longDescription', 'conditions', 'keywords' ] ).should.eql( {
        title: {
          fr: 'Un titre'
        },
        description: {
          fr: 'Une description'
        },
        longDescription: {
          fr: 'Une description longue'
        },
        conditions: {
          fr: 'Etre vivant'
        },
        keywords: {
          fr: [ 'Des', 'mots', 'clés' ]
        }
      } );

    } );


    it( 'accessibility is a set of booleans', () => {

      result.event.accessibility.should.eql( {
        mi: true,
        hi: true,
        pi: false,
        vi: false,
        sl: false
      } );

    } );

    it( 'by default, event is public', () => {

      result.event.private.should.equal( 0 );

    } );

    it( 'by default, event is non-draft', () => {

      result.event.draft.should.equal( 0 );

    } );

    it( 'if specified in options, internal event data is provided in response', async () => {

      const nonInternalFields = _.keys( result.event );

      const resultWithInternal = await svc.create( eventData, { internal: true } );

      const withInternal = _.keys( resultWithInternal.event );

      _.difference( withInternal, nonInternalFields ).should.eql( [
        'id', 'ownerUid', 'creatorUid', 'deletedAt'
      ] );

    } );


    it( 'links is returned in response as a list of objects', () => {

      result.event.links.should.eql( [ {
        link: 'https://someoembeddablelink.com',
        data: {
          description: "« CEINTURE NOIRE » ?\nNouvel Album maintenant disponible :\nhttps://maitregims.lnk.to/CeintureNoire\n\nEn tournée dans toute la France et au Stade de France le 28/09/2019\nBilletterie sur www.FuegoTour.com\n--\nFacebook : https://www.facebook.com/maitregimsoff\nInstagram : https://instagram.com/maitregims\nTwitter : https://twitter.com/maitregims\nSnapchat : Warano75\n--\nAbonne-toi à la chaîne : http://bit.ly/2q6P6Ni"
        },
        type: 'oembed'
      } ] );

    } );

  } );

  describe( 'invalid creates', () => {

    it( 'invalid image returns unsuccessful result with error code and step', async () => {

      const result = await svc.create( {
        title: {
          fr: 'Un événement'
        },
        timings: [ {
          begin: new Date(),
          end: new Date()
        } ],
        image: {
          url: 'https://some.rand.om/invalid.imagepath.jpg'
        }
      } );

      result.valid.should.equal( false );

      _.get( result, 'errors.0.code' ).should.equal( 'ENOTFOUND' );

      _.get( result, 'errors.0.step' ).should.equal( 'image' );

    } );


    it( 'invalid, returns unsuccessful result with error code and step', async () => {

      const result = await svc.create( {
        title: {
          fr: 'Un événement'
        },
        timings: [ {
          begin: new Date(),
          end: new Date()
        } ],
        image: {
          url: 'https://some.rand.om/invalid.imagepath.jpg'
        }
      } );

      result.valid.should.equal( false );

      _.get( result, 'errors.0.code' ).should.equal( 'ENOTFOUND' );

      _.get( result, 'errors.0.step' ).should.equal( 'image' );

    } );

    it( '403 image', async () => {

      const result = await svc.create( {
        title: {
          fr: 'Un événement'
        },
        timings: [ {
          begin: new Date(),
          end: new Date()
        } ],
        image: {
          url: 'https://s3.eu-central-1.amazonaws.com/openagendatest/myevents.jpg'
        }
      } );

      result.valid.should.equal( false );

      _.get( result, 'errors.0.code' ).should.equal( 'invalid.status' );

    } );


    it( 'not an image', async () => {

      const result = await svc.create( {
        title: {
          fr: 'Un événement'
        },
        timings: [ {
          begin: new Date(),
          end: new Date()
        } ],
        image: {
          url: 'https://s3.eu-central-1.amazonaws.com/openagendatest/notanimage.txt'
        }
      } );

      result.valid.should.equal( false );

      _.get( result, 'errors.0.code' ).should.equal( 'invalid.format' );

    } );

  } );

  describe( 'interfaces', () => {

    afterEach( svc.shutdown );

    it( 'if a userUid is specified in context, it is given in interfaces', done => {

      svc.init( ih( config, {
        interfaces: {
          onCreate: {
            $set: ( event, context ) => {

              context.userUid.should.equal( 12 );

              done();

            }
          }
        }
      } ) );

      svc.create( {
        title: {
          fr: 'My first event'
        },
        timings: [ {
          begin: new Date(),
          end: new Date()
        } ]
      }, { context: { userUid: 12 } } );

    } );

  } );

} );
