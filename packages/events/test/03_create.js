"use strict";

process.env.NODE_ENV = 'test';

const fs = require( 'fs' );
const ih = require( 'immutability-helper' );
const mysql = require( 'mysql' );
const should = require( 'should' );

const svc = require( './service' );
const config = require( '../testconfig' );

const imageFiles = require( '@openagenda/image-files' );

describe( 'events - functional (server): create', function() {

  this.timeout( 30000 );

  beforeEach( done => {

    fs.createReadStream( __dirname + '/service/night_king.png' )

      .pipe( fs.createWriteStream( __dirname + '/service/tmp.png' ) )

      .on( 'close', () => {

        done ()

      } );

  } )

  beforeEach( done => {

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

  afterEach( svc.shutdown );

  it( 'create empty draft event', async () => {

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


  it( 'created event always lists timings in chronological order', async () => {

    let times = {
      monday: new Date( '2017-07-03T11:00' ),
      tuesday: new Date( '2017-07-04T12:00' ),
      wednesday: new Date( '2017-07-05T12:00' )
    };

    try {

      let result = await svc.create( {
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
      } );

      ( new Date( result.event.timings[ 0 ].begin ) ).getTime()

        .should.equal( times.monday.getTime() );

      ( new Date( result.event.timings[ 2 ].begin ) ).getTime()

        .should.equal( times.wednesday.getTime() );

    } catch ( e ) {

      console.log( e );

      should().ok();

    }

  } );


  it( 'create the simplest published event', done => {

    svc.create( {
      title: {
        fr: 'My first event'
      },
      timings: [ {
        begin: new Date(),
        end: new Date()
      } ]
    }, ( err, result ) => {

      result.should.eql( {
        valid: true,
        success: true,
        errors: [],
        transferedToLegacy: false,
        event: { 
          slug: 'my-first-event',
          uid: result.event.uid,
          title: { fr: 'My first event' },
          description: {},
          longDescription: {},
          conditions: {},
          keywords: {},
          draft: 0,
          private: 0,
          registration: [],
          references: [],
          image: {
            filename: null,
            credits: null,
            base: '//openagendatst.s3.amazonaws.com/',
            size: {
              height: null,
              width: null
            },
            variants: []
          },
          keywords: {},
          timezone: 'Europe/Paris',
          timings: result.event.timings,
          updatedAt: result.event.updatedAt,
          createdAt: result.event.createdAt,
          locationUid: null,
          agendaUid: null,
          accessibility: {
            hi: false, mi: false, pi: false, sl: false, vi: false
          },
          fileKey: null,
          age: {
            min: null,
            max: null
          }
        }
      } );

      const con = mysql.createConnection( config.mysql );

      con.query( `select * from ${config.schemas.event} where uid=${result.event.uid}`, ( err, rows ) => {

        rows.length.should.equal( 1 );

        new Date( rows[ 0 ].updated_at ).toString().should.equal( result.event.updatedAt.toString() );
        new Date( rows[ 0 ].created_at ).toString().should.equal( result.event.createdAt.toString() );

        done();

      } );

    } );

  } );

  it( 'create the most complete event', done => {

    svc.create( {
      title: {
        fr : 'Un titre'
      },
      slug: 'un-titre',
      ownerUid: 123,
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
      }
    }, ( err, result ) => {

      should( err ).equal( null );

      result.success.should.equal( true );

      result.event.should.eql( {
        slug: 'un-titre',
        uid: result.event.uid,
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
        },
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
        draft: 0,
        private: 0,
        references: [ 1, 2, 3 ],
        timezone: 'Europe/Paris',
        timings: [ {
          begin: result.event.timings[ 0 ].begin,
          end: result.event.timings[ 0 ].begin,
        } ],
        updatedAt: result.event.updatedAt,
        createdAt: result.event.createdAt,
        locationUid: 789,
        agendaUid: null,
        accessibility: {
          mi: true,
          hi: true,
          pi: false,
          vi: false,
          sl: false
        },
        fileKey: null,
        age: {
          min: 2,
          max: 76
        },
        registration: [
          '018436269',
          'email@site.com',
          'https://website.com'
        ]
      } );

      done();

    } );

  } );

  it( 'create the most complete event and include internal data in result', done => {

    svc.create( {
      title: {
        fr : 'Un titre'
      },
      slug: 'un-titre',
      ownerUid: 123,
      creatorUid: 456,
      agendaUid: 789,
      locationUid: 101112,
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
      }
    }, { internal: true }, ( err, result ) => {

      should( err ).equal( null );

      result.success.should.equal( true );

      result.event.should.eql( {
        id: 1, // this is an internal field
        slug: 'un-titre',
        uid: result.event.uid,
        ownerUid: 123, // this too
        creatorUid: 456, // and this
        agendaUid: 789,
        title: {
          fr: 'Un titre'
        },
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
        draft: 0,
        private: 0,
        references: [],
        timezone: 'Europe/Paris',
        timings: [ {
          begin: result.event.timings[ 0 ].begin,
          end: result.event.timings[ 0 ].begin,
        } ],
        updatedAt: result.event.updatedAt,
        createdAt: result.event.createdAt,
        deletedAt: null,
        locationUid: 101112,
        accessibility: {
          mi: true,
          hi: true,
          pi: false,
          vi: false,
          sl: false
        },
        fileKey: null,
        age: {
          min: 2,
          max: 76
        },
        registration: [
          '018436269',
          'email@site.com',
          'https://website.com'
        ]
      } );

      done();

    } );

  } );

  it( 'can return a promise if no callback is fed', async () => {

    let result = await svc.create( {}, { draft: true } );

    result.event.draft.should.equal( 1 );

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
