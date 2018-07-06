"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );
const should = require( 'should' );

const db = require( '../lib/db' );

const  utils = require( '@openagenda/utils' );

const  mysql = require( 'mysql' );

const  async = require( 'async' );

const fs = require( 'fs' );

const locationFixtures = [ {
  agendaId: 1,
  uid: 111,
  name: '111',
  address: 'Passage Ponceau, 75002 Paris',
  latitude: 48.8675,
  longitude: 2.3516,
  region: 'Ile de France',
  countryCode: 'FR'
}, {
  agendaId: 3,
  uid: 222,
  name: '222',
  address: 'Passage Ponceau, 75002 Paris',
  latitude: 48.8675,
  longitude: 2.3516,
  region: 'Ile de France',
  countryCode: 'FR'
}, {
  agendaId: 3,
  uid: 333,
  name: '333',
  address: 'Passage Ponceau, 75002 Paris',
  latitude: 48.8675,
  longitude: 2.3516,
  region: 'Ile de France',
  countryCode: 'FR'
} ];

const dbConfig = utils.extend( {}, require( '../testconfig' ).mysql );

const table = dbConfig.table;

const agendaTestSettings = require( __dirname + '/fixtures/agendaTestSettings.js' );

const dbName = dbConfig.database;

delete dbConfig.database;
delete dbConfig.table;

describe( 'agenda-location db unit', () => {

  it( '_fromDbFields', () => {

    db.test._fromDbFields( { placename: 'The moon', address: 'space' } )

    .should.eql( { name: 'The moon', address: 'space' } );

  } );

  it( '_toDbFields', () => {

    db.test._toDbFields( { name: 'A fork', address: 'my table' } )

    .should.eql( { placename: 'A fork', address: 'my table' } );

  } );

  it( '_filterWheres', () => {

    const wheres = { fsdq: 'fdqs', rezar: 'erae', agendaId: 2, name: 12 };

    db.test._filterWheres( { wheres } )

    .should.eql( { 
      wheres: { fsdq: 'fdqs', rezar: 'erae', agendaId: 2, name: 12 },
      filteredWheres: { name: 12, agendaId: 2 } 
    } );

  } );


  it( '_defineListQuery', () => {

    const con = mysql.createConnection( utils.extend( { table }, dbConfig ) );

    db.test._defineListQuery( {
      config: { table },
      con,
      filteredWheres: { agendaId: 12, name: 'twang' },
      limit: 20,
      offset: 100
    } ).query.should.equal( 'select id, uid, eve_id, agenda_id, slug, placename, address, city, region, department, postal_code, insee, country, city_district, latitude, longitude, updated_at, store from location where agenda_id = 12 and placename = \'twang\' limit 100, 20' );

    con.end();

  } );


  it( '_defineTermsQuery', () => {

    const con = mysql.createConnection( utils.extend( { table }, dbConfig ) );

    db.test._defineTermsQuery( {
      fields: [ 'region' ],
      config: { table },
      con,
      filteredWheres: { agendaId: 12 }

    } ).query.should.equal( 'select distinct region from location where agenda_id=12 and region is not null and region <> "null" and region <> ""' );

    con.end();

  } );

  it( '_defineGetQuery', () => {

    const con = mysql.createConnection( utils.extend( { table }, dbConfig ) );

    db.test._defineGetQuery( {
      config: { table },
      con,
      idFields: [ 'agendaId', 'slug' ],
      values: [ 12, 'twang' ]
    } ).query.should.equal( 'select id, uid, eve_id, agenda_id, slug, placename, address, city, region, department, postal_code, insee, country, city_district, latitude, longitude, updated_at, store from location where agenda_id = 12 and slug = \'twang\' limit 0, 1' );

    con.end();

  } );

});


describe( 'agenda-location db', function() {

  this.timeout( 20000 );

  beforeEach( done => {

    const con = mysql.createConnection( dbConfig );

    con.query( 'drop database if exists ' + dbName, ( err ) => {

      con.end();

      done();

    } );

  } );

  afterEach( done => {

    const con = mysql.createConnection( dbConfig );

    con.query( 'drop database ' + dbName, ( err ) => {

      con.end();

      done();

    } );

  } );

  it( 'throws error on wrong db params', done => {

    db.init( {
      host: '123.456.34.2'
    }, err => {

      err.code.should.equal( 'ENOTFOUND' );

      done();

    } );

  } );


  it( 'creates database if not existing at init', ( done ) => {

    const con = mysql.createConnection( dbConfig );

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), ( err ) => {

      con.query( 'show databases', ( err, result ) => {

        result.filter( r => r.Database == dbName ).length.should.equal( 1 );

        con.end();

        done();

      });

    } ); 

  });


  it( 'create table if not existing at init', done => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), ( err ) => {

      const con = mysql.createConnection( utils.extend( {
        database: dbName
      }, dbConfig ) );

      con.query( `select id from ${table} limit 0, 1`, ( err ) => {

        con.end();

        should( err ).equal( null );

        done();

      });        

    } );

  });


  it( 'set without a specified identifier creates the location', done => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), err => {

      db.set( {
        agendaId: 12,
        name: 'OAHQ',
        address: 'Passage Ponceau, 75002 Paris',
        countryCode: 'FR',
        latitude: 48.8675,
        longitude: 2.3516
      }, ( err, result ) => {

        should( err ).equal( null );

        result.errors.length.should.equal( 0 );

        const con = mysql.createConnection( utils.extend( { database: dbName }, dbConfig ) );

        con.query( 'select * from location where id = ?', result.location.id, ( err, rows ) => {

          rows.length.should.equal( 1 );

          rows[ 0 ].placename.should.equal( 'OAHQ' );
          rows[ 0 ].address.should.equal( 'Passage Ponceau, 75002 Paris' );
          rows[ 0 ].latitude.should.equal( 48.8675 );
          rows[ 0 ].longitude.should.equal( 2.3516 );

          con.end();

          done();

        });

      } );

    } );

  } );


  it( 'set with a specified identifier updates the location', done => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), err => {

      db.set( {
        agendaId: 12,
        name: 'OAHQ',
        address: 'Passage Ponceau, 75002 Paris',
        countryCode: 'FR',
        latitude: 48.8675,
        longitude: 2.3516
      }, ( err, result ) => {

        should( err ).equal( null );

        result.errors.length.should.equal( 0 );

        db.set( {
          id: result.location.id,
          name: 'AAAA'
        }, ( err, result ) => {

          should( err ).equal( null );

          const con = mysql.createConnection( utils.extend( { database: dbName }, dbConfig ) );

          con.query( 'select * from location where id = ?', result.location.id, ( err, rows ) => {

            rows.length.should.equal( 1 );

            rows[ 0 ].placename.should.equal( 'AAAA' );

            con.end();

            done();

          } );

        } );

      } );

    } );

  } );


  it( 'set with an identifier and partial information updates the location partially', done => {

    db.init( _.extend( {
      database: dbName
    }, dbConfig ), err => {

      db.set( {
        agendaId: 12,
        name: 'OAHQ',
        address: 'Passage Ponceau, 75002 Paris',
        latitude: 48.8675,
        longitude: 2.3516,
        website: 'https://openagenda.com',
        description: {
          fr: 'Yeepeekayyay'
        },
        countryCode: 'FR'
      }, ( err, result ) => {

        db.set( {
          id: result.location.id,
          name: 'AAAA'
        }, ( err, result ) => {

          should( result.location.website ).equal( 'https://openagenda.com' );

          should( result.location.description ).eql( { fr: 'Yeepeekayyay' } );

          done();

        } );

      } );

    } );

  } );


  it( 'get settings associated to agenda returns empty obj if nothing is found', done => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), err => {

      db.getSettings( 123, ( err, settings ) => {

        should( err ).equal( null );

        should( settings ).eql( {} );

        done();

      } );

    } );

  } );


  it( 'copy settings of an agenda to another - update', done => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), err => {

      var con = db.getConnection();

      con.query( `insert into ${dbConfig.agendaSettingsTableName} (agenda_id, store) values (?,?)`, [ 1, JSON.stringify( { val: 'yey' } ) ], ( err, result ) => {

        con.query( `insert into ${dbConfig.agendaSettingsTableName} (agenda_id, store) values (?,?)`, [ 2, JSON.stringify( { val: 'bloup' } ) ], ( err, result ) => {

          con.end();

          db.copySettings( 1, 2, ( err, result ) => {

            result.success.should.equal( true );

            db.getSettings( 2, ( err, settings ) => {

              settings.should.eql( { val: 'yey' } );

              done();

            } );

          } );

        } );

      } );

    } );

  } );


  it( 'copy settings of an agenda to another - insert', done => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), err => {

      var con = db.getConnection();

      con.query( `insert into ${dbConfig.agendaSettingsTableName} (agenda_id, store) values (?,?)`, [ 1, JSON.stringify( { val: 'yey' } ) ], ( err, result ) => {

        con.end();

        db.copySettings( 1, 2, ( err, result ) => {

          result.success.should.equal( true );

          db.getSettings( 2, ( err, settings ) => {

            settings.should.eql( { val: 'yey' } );

            done();

          } );

        } );

      } );

    } );

  } );


  it( 'get settings associated to agenda returns parsed settings if found', done => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), err => {

      var con = db.getConnection();

      con.query( `insert into ${dbConfig.agendaSettingsTableName} (agenda_id, store) values (?,?)`, [ 1, JSON.stringify( { val: 'yey' } ) ], ( err, result ) => {

        con.end();

        db.getSettings( 1, ( err, settings ) => {

          should( err ).equal( null );

          settings.should.eql( { val: 'yey' } );

          done();

        } );

      } );

    } );

  } );


  it( 'get a location', done => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), err => {

      async.eachSeries( locationFixtures, db.set, err => {

        db.get( { slug: '222' }, ( err, location ) => {

          location.name.should.equal( '222' );

          done();

        } );

      } );

    } );

  } );


  it( 'get on non-existing location returns null', done => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), err => {

      async.eachSeries( locationFixtures, db.set, err => {

        db.get( { slug: 'fdsfsdfsd' }, ( err, location ) => {

          should( err ).equal( null );

          should( location ).equal( null );

          done();

        } );

      } );

    } );

  } );


  it( 'exists on existing location gives true', done => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), err => {

      async.eachSeries( locationFixtures, db.set, err => {

        db.exists( { slug: '222' }, ( err, exists ) => {

          should( err ).equal( null );

          should( exists ).equal( true );

          done();

        } );

      } );

    } );

  } );

  it( 'exists on non-existing location gives false', done => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), err => {

      async.eachSeries( locationFixtures, db.set, err => {

        db.exists( { slug: '222' }, ( err, exists ) => {

          should( err ).equal( null );

          should( exists ).equal( true );

          done();

        } );

      } );

    } );

  } );


  it( 'unlink a location', done => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), err => {

      async.eachSeries( locationFixtures, db.set, err => {

        db.list( {}, 0, 20, ( err, locations ) => {

          let toUnlinkUid = locations[ 2 ].uid;

          db.unlink( { uid: toUnlinkUid }, err => {

            should( err ).equal( null );

            let con = mysql.createConnection( utils.extend( { database: dbName }, dbConfig ) );

            con.query( `select * from ${table} where uid = ?`, toUnlinkUid, ( err, rows ) => {

              should( err ).equal( null );
              
              rows.length.should.equal( 1 );

              should( rows[ 0 ].agenda_id ).equal( null );

              con.end();

              done();

            } );

          } );

        } );

      } );

    } );

  } );


  it( 'remove a location', done => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), err => {

      async.eachSeries( locationFixtures, db.set, err => {

        db.list( {}, 0, 200, ( err, locations ) => {

          let toRemoveUid = locations[ 2 ].uid,

          length = locations.length;

          db.remove( { uid: toRemoveUid }, err => {

            should( err ).equal( null );

            db.list( {}, 0, 200, ( err, locations ) => {

              locations.length.should.equal( length - 1 );

              db.get( { uid: toRemoveUid }, ( err, location ) => {

                should( location ).equal( null );

                done();

              });

            } );

          } );

        } );

      } );

    } );

  } );


  it( 'get a location with wrong agenda ref', ( done ) => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), ( err ) => {

      async.eachSeries( locationFixtures, db.set, ( err ) => {

        db.get( { slug: '222', agendaId: 213 }, ( err, location ) => {

          should( location ).equal( null );

          done();

        } );

      })

    } );

  } );


  it( 'list some locations from a specific agenda', done => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), err => {

      async.eachSeries( locationFixtures, db.set, err => {

        db.list( { agendaId: 3 }, 0, 20, ( err, locations ) => {

          locations[ 0 ].name.should.equal( '222' );

          locations[ 1 ].name.should.equal( '333' );

          done();

        } );

      })

    } );

  } );


  it( 'list some locations based on a list of uids', done => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), err => {

      async.eachSeries( locationFixtures, db.set, err => {

        db.list( 0, 20, ( err, locations ) => {

          let uids = locations.map( l => l.uid );

          db.list( { uid: uids.slice( 1, 3 ) }, 0, 20, ( err, locations ) => {

            locations.length.should.equal( 2 );

            done();

          } );

        } );

      } );

    } );

  } );


  it( 'decorate should put tag labels in locations when they are missing', done => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), ( err ) => {

      let settings = { 
        tagSet: {
          groups: [ {
            name: 'Label',
            info: null,
            tags: [ {
              id: 40, // have this referenced in test fixtures
              label: 'Musée de France'
            }, {
              id: 38,
              label: 'Jardin Remarquable'
            } ]
          } ]
        }
      },

      location = {
        agendaId: 3,
        name: 'OAHQ',
        address: 'Passage Ponceau, 75002 Paris',
        latitude: 48.8675,
        longitude: 2.3516,
        website: 'https://openagenda.com',
        description: 'Yeepeekayyay',
        countryCode: 'FR',
        tags: [ {
          id: 38
        }, {
          id: 40
        } ]
      }

      db.set( location, settings, ( err, result ) => {

        let con = db.getConnection();

        con.query( `insert into ${dbConfig.agendaSettingsTableName} (agenda_id, store) values (?,?)`, [ 3, JSON.stringify( settings ) ], ( err, result ) => {

          con.end();

          db.decorate( [ location ], ( err, decorated ) => {

            decorated.length.should.equal( 1 );

            decorated[ 0 ].tags.should.eql( [ 
              { id: 38, label: 'Jardin Remarquable' },
              { id: 40, label: 'Musée de France' } 
            ] );

            done();

          } );
          
        } );

      } );

    } );

  } );


  it( 'get terms from locations of a specific agenda', done => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), err => {

      async.eachSeries( locationFixtures, db.set, err => {

        db.list.terms( [ 'region' ], { agendaId: 3 }, ( err, regions ) => {

          should( err ).equal( null );

          regions.length.should.equal( 1 );

          regions[ 0 ].should.eql( { region: 'Ile de France' } );

          done();

        } );

      } );

    } );

  } );


  it( 'set and get a location with tags', done => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), err => {

      db.set( {
        agendaId: 12,
        name: 'Candyland',
        address: 'Passage Ponceau, 75002 Paris',
        latitude: 48.8675,
        longitude: 2.3516,
        tags: [ { id: 33 } ],
        countryCode: 'FR'
      }, agendaTestSettings, ( err, result ) => {

        should( err ).equal( null );

        db.get( { id: result.location.id }, ( err, location ) => {

          location.tags.should.eql( [ { id: 33 } ] );

          done();

        } );

      } );

    } );

  } );


  it( 'sync a location tags with location agenda settings', done => {

    db.init( utils.extend( {
      database: dbName
    }, dbConfig ), err => {

      db.set( {
        agendaId: 12,
        name: 'Candyland',
        address: 'Passage Ponceau, 75002 Paris',
        latitude: 48.8675,
        longitude: 2.3516,
        tags: [ { id: 33 } ],
        countryCode: 'FR'
      }, agendaTestSettings, ( err, result ) => {

        db.test._resyncLocationTags( result.location, agendaTestSettings, err => {

          db.get( { id: result.location.id }, ( err, l ) => {

            should( err ).equal( null );

            l.tags[ 0 ].should.eql( { id: 33, label: 'Première participation' } );

            done();

          } );

        } );

      } );

    } );

  } );

} );