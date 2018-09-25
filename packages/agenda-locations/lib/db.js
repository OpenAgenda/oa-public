"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );
const mysql = require( 'mysql' );
const slug = require( 'slug' );
const w = require( 'when' );

const countries = require( '@openagenda/countries' );
const logger = require( '@openagenda/basic-logger' );

const helpers = require( './mysqlHelpers' );
const states = require( './states' );
const validate = require( './validate' );

const fields = [ 
  'id', 'uid', { obj: 'eveId', db: 'eve_id' }, { obj: 'agendaId', db: 'agenda_id' }, 'slug', { obj: 'name', db: 'placename'}, 
  'address', 'city', 'region', 'department', { obj: 'postalCode', 'db': 'postal_code' }, 'insee', { obj: 'countryCode', db: 'country' },
  { obj: 'district', db: 'city_district' }, 'latitude', 'longitude', { obj: 'updatedAt', db: 'updated_at' }, 'store'
];

const storeFields = [ // fields kept in store column in schema
  'image', 'description', 'tags', 
  'website', 'phone', 'links', 'access', 
  'state', 'timezone', 'imageCredits'
];

// field used to retrieve aggregates of values for filtering
const termFields = [ 'name', 'city', 'region', 'department', 'country' ];

let config, log;

let con;

module.exports = {
  isReady: () => !!config,
  getConnection: () => mysql.createConnection( config ),
  init,
  set,
  get,
  exists,
  remove,
  unlink,
  list: _.extend( list, {
    terms: listTerms
  } ),

  // decorate a list of locations with
  // any data that needs to be fetched
  // from separate stores ( agenda settings )
  decorate,

  // get all distinct values from specific field
  getSettings,

  // copy settings of an agenda to another
  copySettings,

  // resync agenda locations data with agenda settings
  resync,

  test: {
    _fromDbFields,
    _toDbFields,
    _filterWheres,
    _defineListQuery,
    _defineGetQuery,
    _defineTermsQuery,
    _resyncLocationTags
  }
}


function resync( agendaId, cb ) {

  getSettings( agendaId, ( err, settings ) => {

    if ( err ) return cb( err );

    if ( !settings || !settings.tagSet ) return cb();

    const limit = 20;

    let offset = 0, more = true;

    async.doWhilst( wcb => {

      list( { agendaId }, offset, limit, ( err, locations ) => {

        if ( err ) return cb( err );

        more = !!locations.length;

        offset += limit;

        async.eachSeries( locations, ( l, ecb ) => {

          _resyncLocationTags( l, settings, err => {

            if ( err ) {

              log( 'could not sync location %s', l.id );

            }

            ecb();

          } );

        }, wcb );

      } );

    }, () => { return more; }, cb );

  } );

}

/**
 * get agenda location data settings
 */

function getSettings( agendaId, cb ) {

  if ( !config || !config.agendaSettingsTableName ) {

    return cb( 'db not inited or settings schema missing' );

  }

  _query( `select store from ${config.agendaSettingsTableName} where agenda_id = ?`, agendaId, ( err, rows ) => {

    if ( err ) return cb( err );

    let settings = {};

    try {

      if ( rows.length ) settings = JSON.parse( rows[ 0 ].store );

    } catch( e ) {};

    cb( null, settings );

  } );

}


function copySettings( originAgendaId, destinationAgendaId, cb ) {

  getSettings( originAgendaId, ( err, settings ) => {

    if ( err ) return cb( err );

    _query( `select agenda_id from ${config.agendaSettingsTableName} where agenda_id = ?`, destinationAgendaId, ( err, rows ) => {

      const query = rows.length ?
        `update ${config.agendaSettingsTableName} set store = ? where agenda_id = ?`
        : `insert into ${config.agendaSettingsTableName} ( store, agenda_id ) values ( ?, ? )`;

      _query( query, [ JSON.stringify( settings ), destinationAgendaId ], ( err, result ) => {

        if ( err ) return cb( err );

        cb( null, {
          success: result.affectedRows === 1
        } );

      } )

    } )

  } );

}


function list( wheres, offset, limit, cb ) {

  if ( arguments.length == 3 ) {

    cb = limit;

    limit = offset;

    offset = wheres;

    wheres = {};

  }

  w( {
    offset,
    limit,
    locations: false,
    config,
    wheres,
    query: false,
    filteredWheres: {}
  } )

  .then( _filterWheres )

  .then( _defineListQuery )

  .then( _runQuery( 'locations' ) )

  .then( _clean( 'locations' ) )

  .done( v => {

    cb( null, v.locations );

  }, err => {

    cb( err );

  } );

}


function decorate( locations, cb ) {

  const loadedSettings = {};

  const decoratedLocations = [];

  const toDecorate = _.isArray( locations ) ? locations : [ locations ];

  async.eachSeries( toDecorate, ( location, ecb ) => {

    w( {
      settings: location.agendaId ? loadedSettings[ location.agendaId ] : false,
      location
    } )

    .then( _loadSettings )

    .then( _decorateTags )

    .done( v => {

      decoratedLocations.push( v.location );

      ecb();

    }, ecb );

  }, err => {

    if ( err ) return cb( err );

    cb( null, _.isArray( locations ) ? decoratedLocations : decoratedLocations[ 0 ] );

  } );

  function _loadSettings( v ) {

    if ( !v.location.agendaId || v.settings ) return v;

    const d = w.defer();

    getSettings( v.location.agendaId, ( err, settings ) => {

      if ( err ) return d.reject( err );

      loadedSettings[ v.location.agendaId ] = settings;

      v.settings = settings;

      d.resolve( v );

    } );

    return d.promise;

  }

  function _decorateTags( v ) {

    if ( !v.settings

    || !v.settings.tagSet

    || !v.settings.tagSet.groups

    || !v.settings.tagSet.groups.length ) return v;

    if ( !v.location.tags || !_.isArray( v.location.tags ) ) return v;

    v.location.tags = v.location.tags.map( lt => {

      const gt = v.settings.tagSet.groups.map( g => {

        return g.tags.filter( t => {

          return t.id == lt.id;

        } );

      } ).filter( gt => gt.length );

      if ( !gt.length ) return [];

      return gt[ 0 ][ 0 ];

    } );

    return v;

  }

}


/**
 * promise version of the above
 */
decorate.promise = function( v ) {

  const d = w.defer();

  decorate( v.locations, ( err, decorated ) => {

    if ( err ) return d.reject( err );

    v.decorated = decorated;

    d.resolve( v );

  } );

  return d.promise;

}


function set( data, settings, cb ) {

  if ( arguments.length == 2 ) {

    cb = settings;

    settings = {};

  }

  log( 'set location' );

  w( {
    config,
    settings,
    operation: false,
    data,
    currentLocation: false,
    location: false,
    errors: []
  } )

  .then( _determineCreateOrUpdate )

  .then( _validate )

  .then( v => {

    if ( v.errors.length ) return v;

    return ( v.operation == 'create' ? _create : _update )( v );

  } )

  .done( v => {

    cb( null, {
      success: !v.errors.length,
      operation: v.operation,
      location: v.location,
      errors: v.errors
    } );

  }, err => {

    cb( err );

  } );

}


/**
 * check if location exists. Limits get to id field
 * and does not bother to clean
 */
function exists( identifiers, cb ) {

  if ( typeof identifiers !== 'object' ) {

    return cb( 'could not check: wrong identifiers %s', identifers );

  }

  w( _.extend( {
    query: false,
    config,
    fields: [ 'id' ]
  }, _extractIdentifiers( identifiers, [ 'id', 'uid', 'slug', 'agendaId', 'eveId' ] ) ) )

  .then( _defineGetQuery )

  .then( _runGetQuery )

  .done( v => {

    cb( null, !!v.location );

  }, err => {

    cb( err );

  } );

}


/**
 * get a location
 */
function get( identifiers, cb ) {

  if ( typeof identifiers !== 'object' ) {

    return cb( 'could not get: wrong identifiers %s', identifers );

  }

  const con = _connect( config );

  w( _.extend( {
    con,
    query: false,
    config
  }, _extractIdentifiers( identifiers, [ 'id', 'uid', 'slug', 'agendaId', 'eveId' ] ) ) )

  .then( _defineGetQuery )

  .then( _runGetQuery )

  .then( _clean( 'location' ) )

  .done( v => {

    cb( null, v.location );

  }, err => {

    cb( err );

  } );

}


function unlink( identifiers, cb ) {

  const con = _connect( config );

  w( _.extend( {
    con,
    config,
    query: false,
    location: false
  }, _extractIdentifiers( identifiers, [ 'id', 'uid', 'slug', 'agendaId', 'eveId' ] ) ) )

  .then( _defineGetQuery )

  .then( _runGetQuery )

  .then( _defineUnlinkQuery )

  .then( _runRemoveQuery )

  .done( v => {

    cb( null, v.location );

  }, err => {

    cb( err );

  } );

}


function remove( identifiers, cb ) {

  w( _.extend( {
    query: false,
    config,
    location: false
  }, _extractIdentifiers( identifiers, [ 'id', 'uid', 'slug', 'agendaId', 'eveId' ] ) ) )

  .then( _defineGetQuery )

  .then( _runGetQuery )

  .then( _defineRemoveQuery )

  .then( _runRemoveQuery )

  .done( v => {

    cb( null, v.location );

  }, err => {

    cb( err );

  } );

}


/**
 * no offset and no limit for this guy. 
 * he is expected to fetch all values.
 */
function listTerms( fields, wheres, cb ) {

  if ( arguments.length == 2 ) {

    cb = wheres;

    wheres = {};

  }

  const con = _connect( config );

  w( {
    con,
    fields,
    terms: false,
    config,
    wheres,
    query: false,
    filteredWheres: {}
  } )

  .then( _filterWheres )

  .then( _validateTermFields )

  .then( _defineTermsQuery )

  .then( _runQuery( 'terms' ) )

  .then( _cleanTerms )

  .done( v => {

    cb( null, v.terms );

  }, err => {

    cb( err );

  } );

}


function init( cfg, cb ) {

  log = logger( 'db' );

  w( {
    config: _.extend( {
      host: 'localhost',
      database: 'agenda_locations',
      user: 'root',
      password: false,
      table: 'location'
    }, cfg ),
    noLoadDatabase: true
  } )

  .then( _checkDb )

  .then( _checkSchema )

  .done( v => {

    log( 'init complete' );

    config = v.config;

    if ( cb ) cb( null );

  }, cb );

}


function _clean( namespace ) {

  return v => {

    let items = _.isArray( v[ namespace ] ) ? v[ namespace ] : [ v[ namespace ] ];

    items = items.map( l => {

      if ( !l ) {

        return l;

      }

      // description may have been input in store as string.
      // it should be multilingual therefore an object
      if ( typeof l.description === 'string' ) {

        l.description = { fr: l.description };

      }

      // same for access
      if ( typeof l.access == 'string' ) {

        l.access = { fr: l.access };

      }

      return l;

    } );

    v[ namespace ] = _.isArray( v[ namespace ] ) ? items : items[ 0 ];

    return v;

  }

}


function _filterWheres( v ) {

  v.filteredWheres = {};

  [ 'name', 'agendaId', 'uid' ].filter( f => v.wheres[ f ] !== undefined ).forEach( f => {

    v.filteredWheres[ f ] = v.wheres[ f ];

  } );

  return v;

}


function _defineListQuery( v ) {

  const wheresObj = _toDbFields( v.filteredWheres );

  const wheres = [];

  for( const k in wheresObj ) {

    if ( wheresObj[ k ] === null ) {

      wheres.push( k + ' is null' );

    } else if ( _.isArray( wheresObj[ k ] ) ) {

      wheres.push( k + ' in (' + wheresObj[ k ].map( w => mysql.escape( w ) ).join( ', ' ) + ')' );

    } else {

      wheres.push( k + ' = ' + mysql.escape( wheresObj[ k ] ) );

    }

  }

  v.query = [
    `select ${fields.map( f => typeof f == 'string' ? f : f.db ).join( ', ' )}`,
    `from ${v.config.table}`,
    wheres.length ? `where ${wheres.join( ' and ' )}` : '',
    `limit ${v.offset}, ${v.limit}`
  ].join( ' ' );

  if ( log ) log( 'list query: %s', v.query );

  return v;

}


function _runQuery( targetField ) {

  return v => {

    const d = w.defer();

    _query( v.query, ( err, rows ) => {

      if ( err ) return d.reject( err );

      v[ targetField ] = rows.map( _fromDbFields );

      d.resolve( v );

    } );

    return d.promise;

  }

}


function _connect( config ) {

  if ( !config ) return false;

  return mysql.createConnection( config );

}


function _query( str, args, cb ) {

  if ( !config ) return false;

  if ( config.query ) {

    config.query( str, args, cb );

  } else {

    if ( !con ) con = mysql.createConnection( config );

    con.query( str, args, cb );

  }

}

function _update( v ) {

  log( 'running update' );

  return w( v )

  .then( _updateLocation );

}


function _create( v ) {

  log( 'running create' );

  return w( v )

  .then( _assignUniqueUid )

  .then( _assignUniqueSlug )

  .then( _insertLocation );

}

function _defineGetQuery( v ) {

  const idFields = v.idFields.map( idf => {

    const f = fields.filter( f => ( typeof f == 'string' ? f : f.obj ) == idf )[ 0 ];

    return typeof f == 'string' ? f : f.db;

  } );

  if ( !idFields.length ) {

    v.query = false;

    return v;

  }

  v.query = [ 'select' ]
    .concat( ( v.fields || fields ).map( f => typeof f == 'string' ? f : f.db ).join( ', ') )
    .concat( `from ${v.config.table} where` )
    .concat( idFields.map( ( f, i ) => f + ' = ' + mysql.escape( v.values[ i ] ) ).join( ' and ') )
    .concat( [ 'limit 0, 1' ] ).join( ' ' );

  // if ( log ) log( 'get query: %s', v.query );

  return v;

}


function _validateTermFields( v ) {

  v.fields.forEach( field => {

    if ( termFields.indexOf( field ) == -1 ) {

      throw 'unauthorized term';

    }

  } );

  return v;

}


function _defineTermsQuery( v ) {

  const wheresObj = _toDbFields( v.filteredWheres );

  const wheres = [];

  const selects = v.fields;

  for( const k in wheresObj ) {

    wheres.push(  k + ( wheresObj[ k ] === null ? ' is ' : '=' ) + mysql.escape( wheresObj[ k ] ) );

  }

  v.fields.map( field => {

    wheres.push( field + ' is not null' );

    wheres.push( field + ' <> "null"' );

    wheres.push( field + ' <> ""' );

  } );

  selects[ 0 ] = 'distinct ' + selects[ 0 ];

  v.query = [
    `select ${selects.join( ', ' )}`,
    `from ${v.config.table}`,
    wheres.length ? `where ${wheres.join( ' and ' )}` : ''
  ].join( ' ' );

  if ( log ) log( 'terms query: %s', v.query );

  return v;    

}


function _cleanTerms( v ) {

  v.terms.forEach( t => {

    if ( t.countryCode ) {

      t.country = countries.getLabel( t.countryCode );

    }

  } );

  return v;

}


function _runGetQuery( v ) {

  if ( !v.query ) {

    v.location = null;

    return v;

  }

  const d = w.defer();

  _query( v.query, [], ( err, rows ) => {

    if ( err ) return d.reject( err );

    v.location = rows.length ? _fromDbFields( rows[ 0 ] ) : null;

    d.resolve( v );

  } );

  return d.promise;

}


function _defineRemoveQuery( v ) {

  if ( v.location === null ) return v;

  v.query = [
    `delete from ${v.config.table}`,
    `where id = ${mysql.escape( v.location.id )}`,
    'limit 1'
  ].join( ' ' );

  return v;

}


function _defineUnlinkQuery( v ) {

  if ( v.location === null ) return v;

  v.query = [
    `update ${v.config.table} set agenda_id=NULL`,
    `where id = ${mysql.escape( v.location.id )}`,
    'limit 1'
  ].join( ' ' );

  return v;

}


function _runRemoveQuery( v ) {

  if ( v.location === null ) return v;

  const d = w.defer();

  _query( v.query, [], ( err ) => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}


function _toDbFields( values, previousValues ) {

  const dbData = _transform( values, 'obj', 'db' );

  // if store values are undefined and previous values exist,
  // they should be used and not be reset

  if ( dbData.store && previousValues ) {

    for( const k in dbData.store ) {

      if ( dbData.store[ k ] === undefined ) {

        dbData.store[ k ] = previousValues[ k ];

      }

    }

  }

  return dbData;

}


function _fromDbFields( values ) {

  const objData = _transform( values, 'db', 'obj' );

  let store;

  if ( values.store ) {

    try {

      store = JSON.parse( values.store ) || {};

    } catch( e ) {

      log( 'error', 'could not parse store: %s', values.store );

      return objData;

    }

    storeFields.forEach( f => {

      objData[ f ] = store[ f ];

    } ); 

  }

  return objData;

}


function _transform( values, from, to ) {

  const transformed = {};

  fields.filter( f => values[ typeof f == 'string' ? f : f[ from ] ] !== undefined )

  .forEach( f => {

    transformed[ typeof f == 'string' ? f : f[ to ] ] = values[ typeof f == 'string' ? f : f[ from ] ];

  } );

  return transformed;

}


function _assignUniqueUid( v ) {

  log( 'assigning unique uid' );

  const d = w.defer();

  _defineUnique( v, 'uid', () => Math.ceil( Math.random() * 100000000 ), ( err, uid ) => {

    if ( err ) return d.reject( err );

    log( 'assigned uid %s', uid );

    v.location.uid = uid;

    d.resolve( v );

  } );

  return d.promise;

}

function _assignUniqueSlug( v ) {

  log( 'assigning unique slug' );

  const d = w.defer();

  let tried = false;

  _defineUnique( v, 'slug', () => {

    let sluggedName = slug( v.location.name, { lower: true } );

    if ( tried ) {

      sluggedName += Math.ceil( Math.random() * 1000 );

    }

    tried = true;

    return sluggedName;

  }, ( err, sluggedName ) => {

    log( 'selected slug %s', sluggedName );

    if ( err ) return d.reject( err );

    v.location.slug = sluggedName;

    d.resolve( v );

  } );

  return d.promise;

}


function _insertLocation( v ) {

  log( 'inserting location' );

  const d = w.defer();

  const dbData = _toDbFields( v.location );

  dbData.created_at = new Date();

  dbData.updated_at = new Date();

  helpers.insert( _query, v.config.table, dbData, ( err, result ) => {

    if ( err ) return d.reject( err );

    v.location.id = result.insertId;

    d.resolve( v );

  } );

  return d.promise;

}


function _updateLocation( v ) {

  const d = w.defer();

  const identifiers = _extractIdentifiers( v.data, [ 'id', 'uid' ] );

  const dbData = _toDbFields( v.location, v.currentLocation );

  dbData.updated_at = new Date();

  log( 'updating location of id %s with data %s', JSON.stringify( identifiers.obj ), JSON.stringify( dbData ) );

  helpers.update( _query, v.config.table, identifiers.obj, dbData, ( err ) => {

    if ( err ) return d.reject( err );

    // get refreshed values from db ( if only to fetch id for subsequent search indexing )
    get( identifiers.obj, ( err, location ) => {

      if ( err ) return d.reject( err );

      if ( !location ) return d.reject( 'could not fetch updated event' );

      v.location = location;

      d.resolve( v );

    } );

  } );

  return d.promise;

}


function _defineUnique( v, field, generator, cb ) {

  let uniqueValue = false;

  async.doWhilst( wcb => {

    const value = generator();

    log( 'attempting values %s for field %s', value, field );

    _query( `select id from ${v.config.table} where ${field} = ${mysql.escape( value )} limit 0, 1`, [], ( err, rows ) => {

      if ( err ) return wcb( err );

      if ( !rows.length ) {

        log( 'value %s is unique', value );

        uniqueValue = value;

      }

      wcb();

    } );

  }, () => !uniqueValue, ( err ) => {

    cb( err, uniqueValue );

  } );

}


function _resyncLocationTags( location, settings, cb ) {

  let changed = false;

  const settingsTags = settings.tagSet.groups.reduce( ( prev, g ) => {

    return prev.concat( g.tags );

  }, [] );

  // if has tags that settings does not have, remove them
  const locationTags = ( location.tags || [] ).filter( t => {

    if ( settingsTags.map( st => st.id ).indexOf( t.id ) == -1 ) {

      changed = true;

      return false;

    }

    return true;

  } )

  // if a tag label is different, update
  .map( t => {

    const st = settingsTags.filter( st => st.id === t.id )[ 0 ];

    if ( st.label !== t.label ) {

      changed = true;

      t.label = st.label;

    }

    return t;

  } );

  // nothing to update, don't bother db
  if ( !changed ) {

    log( 'location %s tags are already in sync', location.id );

    return cb( null );

  }

  location.tags = locationTags;

  set( location, settings, cb );

}


function _determineCreateOrUpdate( v ) {

  const d = w.defer();

  const identifiers = _extractIdentifiers( v.data, [ 'id', 'uid', 'eveId' ] ).obj;

  v.operation = 'create';

  log( '_determineCreateOrUpdate for identifiers %s', JSON.stringify( identifiers ) );

  // if not a single unique identifier is defined, no need to get
  if ( !Object.keys( identifiers ).length ) {

    log( '_determineCreateOrUpdate: no identifiers defined -> create' );

    return v;

  }

  // optionally add agenda constraint if specified
  
  if ( v.data.agendaId ) {

    identifiers.agendaId = v.data.agendaId;

  }

  get( identifiers, ( err, location ) => {

    if ( err ) return d.reject( err );

    if ( location ) {

      log( '_determineCreateOrUpdate: found location id %s -> update', location.id );

      v.data.id = location.id;

      v.currentLocation = location;

      v.operation = 'update';

    }

    log( '_determineCreateOrUpdate: identifiers %s trigger an %s', JSON.stringify( identifiers ), v.operation );

    d.resolve( v );

  } );

  return d.promise;
  
}


function _extractIdentifiers( data, idFieldCandidates ) {

  const extracted = {
    idFields: [],
    values: [],
    obj: {}
  };

  idFieldCandidates.forEach( ( field ) => {

    if ( !data[ field ] ) return;

    extracted.idFields.push( field );

    extracted.values.push( data[ field ] );

    extracted.obj[ field ] = data[ field ];

  } );

  return extracted;

}

function _checkDb( v ) {

  const d = w.defer();

  const q = `create database if not exists ${v.config.database}`;

  const con = _connect( {
    host: v.config.host,
    user: v.config.user,
    password: v.config.password
  } );

  con.query( q, err => {

    con.end();

    if ( err ) {

      return d.reject( err );

    }

    d.resolve( v );

  } );

  return d.promise;

}


function _validate( v ) {

  log( '_validate' );

  try {

    v.location = validate( v.data, v.settings, v.operation !== 'create' );

  } catch( e ) {

    v.errors = e;

    return v;

  }
  
  if ( !v.location.store ) v.location.store = {};

  storeFields.forEach( f => {

    v.location.store[ f ] = v.location[ f ];

  } );

  return v;

}

function _checkSchema( v ) {

  const d = w.defer();

  const con = _connect( {
    host: v.config.host,
    user: v.config.user,
    password: v.config.password,
    database: v.config.database,
    multipleStatements: true
  });

  con.query( `
CREATE TABLE IF NOT EXISTS ${v.config.table}
(id BIGINT AUTO_INCREMENT,
uid BIGINT UNIQUE,
agenda_id bigint,
slug VARCHAR(100) NOT NULL UNIQUE,
placename VARCHAR(100) NOT NULL,
address VARCHAR(255),
city VARCHAR(100),
country VARCHAR(2),
latitude DECIMAL(10, 6) NOT NULL,
longitude DECIMAL(10, 6) NOT NULL,
owner_id BIGINT,
main TINYINT(1) DEFAULT '0' NOT NULL,
store LONGTEXT,
processed_at datetime,
region VARCHAR(255),
department VARCHAR(255),
city_district VARCHAR(255),
postal_code VARCHAR(20),
insee VARCHAR(10),
eve_id VARCHAR(100) UNIQUE,
created_at DATETIME NOT NULL,
updated_at DATETIME NOT NULL, 
UNIQUE INDEX slug_idx (slug), 
INDEX latlng_idx (latitude, longitude),
INDEX owner_id_idx (owner_id),
PRIMARY KEY(id)) DEFAULT CHARACTER 
SET utf8 COLLATE utf8_general_ci ENGINE = INNODB; 
CREATE TABLE IF NOT EXISTS ${v.config.agendaSettingsTableName}
(agenda_id BIGINT UNIQUE NOT NULL,
store LONGTEXT,
PRIMARY KEY(agenda_id)) DEFAULT CHARACTER
SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;`,

  err => {

    con.end();

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}
