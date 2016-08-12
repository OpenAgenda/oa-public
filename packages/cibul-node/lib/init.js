"use strict";

const servicePath = __dirname + '/../services',

w = require( 'when' ),

utils = require( 'utils' ),

logger = require( 'logger' ),

mailer = require( 'mailer' ),

appSvc = {
  agenda: require( servicePath + '/agenda' ),
  event: require( servicePath + '/event' )
},

emailStrategie = require( 'emailStrategie' ),

cookieParser = require( 'cookie-parser' ),

agendaSearch = require( 'agenda-search' ),

agendasSvc = require( 'agendas' ),

genUrl = require( servicePath + '/genUrl' ),

facebookSvc = require( 'facebook' ),

agendaTags = require( 'agenda-tags' ),

agendaCategories = require( 'agenda-categories' ),

agendaStakeholders = require( 'agenda-stakeholders' ),

agendaLocations = require( 'agenda-locations' ),

agendaEventReferences = require( 'agenda-event-references' ),

newsletterSvc = require( 'newsletter' ),

adminAgendaSvc = require( 'admin-agendas' ),

userSvc = require( 'users' ),

imageSvc = require( 'images' ),

filesSvc = require( 'files' );

let log;

module.exports = function( config, cb ) {

  if ( arguments.length == 1 && typeof config === 'function' ) {

    cb = config;
    config = require( '../config' );

  } else if ( arguments.length === 0 ) {

    config = require( '../config' );
    cb = () => {};

  }

  w( config )

  .then( _initLogger )

  .then( _initGenUrl )

  .then( _initMailer )

  .then( _initAgendaService )

  .then( _initAgendaSearch )

  .then( _initAgendaTags )

  .then( _initAgendaCategories )

  .then( _initAgendaStakeholders )

  .then( _initAgendaLocations )

  .then( _initAgendaEventReferences )

  .then( _initEmailStrategie )

  .then( _initImages )

  .then( _initNewsletter )

  .then( _initFiles )

  .then( _initAdminAgendas )

  .then( _initUsers )

  .then( _initFacebook )

  .done( () => { cb() }, cb );

}


function _initFacebook( config ) {

  log( 'info', 'initing facebook' );

  facebookSvc.init( {
    app: config.auth.facebook,
    routes: {
      tabRedirect: config.root + '/facebook/tab/create/:state'
    },
    db: config.db
  }, err => {

    if ( err ) log( 'error', 'could not init agenda-event-references: %s', err );

  } );

  return config;

}


function _initImages( config ) {

  log( 'info', 'images' );

  imageSvc.init( {
    tmpPath: config.tmpFolderPath,
    logger: logger
  } );

  return config;

}


function _initNewsletter( config ) {

  log( 'info', 'newsletter' );

  newsletterSvc.init( {
    sendinblue: {
      apiKey: config.sendinblue.apiKey,
      newsletterList: config.sendinblue.newsletterList
    },
    logger: logger
  } );

  return config;

}


function _initFiles( config ) {

  log( 'info', 'files' );

  filesSvc.init( {
    bucket: config.aws.bucket,
    accessKeyId: config.aws.accessKeyId, // required
    secretAccessKey: config.aws.secretAccessKey, // required too
    logger: logger
  } );

  return config;

}


function _initAdminAgendas( config ) {

  log( 'info', 'admin agenda' );

  adminAgendaSvc.init( {
    mysql: config.db,
    schemas: config.schemas,
    logger: logger
  } );

  return config;

}


function _initUsers( config ) {

  log( 'info', 'users' );

  userSvc.init( {
    mysql: config.db,
    schemas: config.schemas,
    files: {
      bucket: config.aws.bucket,
      accessKeyId: config.aws.accessKeyId, // required
      secretAccessKey: config.aws.secretAccessKey,
      tmpPath: config.tmpFolderPath
    },
    logger: logger
  } );

  return config;

}




function _initEmailStrategie( config ) {

  log( 'info', 'emailStrategie' );

  emailStrategie.init( {
    database: config.emailStrategieDb,
    redis: config.redis,
    logger: logger
  } );

  return config;

}


function _initAgendaEventReferences( config ) {

  log( 'info', 'agenda event references' );

  agendaEventReferences.init( {
    schema: config.schemas.eventReferences,
    mysql: config.db,
    logger: logger,
    interfaces: {

      events: ( agendaId, refQuery, options, cb ) => {

        if ( arguments.length === 3 ) {

          cb = options;
          options = {};

        }

        let params = utils.extend( {
          showAll: false
        }, options );

        appSvc.agenda.get( { id: agendaId }, ( err, agenda ) => {

          if ( err ) return cb( err );

          let query = {};

          if ( refQuery.search ) query.what = refQuery.search;

          if ( refQuery.exclude ) query.exclude = refQuery.exclude;

          if ( refQuery.uids ) query.uids = refQuery.uids;

          agenda.search( query, params, ( err, result ) => {

            if ( err ) return cb( err );

            cb( err, result.events.map( e => ( {
              uid: e.uid,
              title: e.title,
              description: e.description,
              location: {
                name: e.locations[ 0 ].name,
                address: e.locations[ 0 ].address
              },
              dateRange: {
                fr: appSvc.event.instanciate( e ).getRange( 'fr' ),
                en: appSvc.event.instanciate( e ).getRange( 'en' )
              }
            } ) ) );

          } );

        } );

      }

    }
  }, err => {

    if ( err ) log( 'error', 'could not init agenda-event-references: %s', err );

  } );

  return config;

}


function _initAgendaLocations( config ) {

  log( 'info', 'agenda locations' );

  agendaLocations.init( {
    geocodefarm: config.geocodeFarm,
    elasticsearch: {
      host: config.es.host + ':' + config.es.port,
      log: config.esLocation.log,
      index: config.esLocation.index,
      apiVersion: config.esLocation.apiVersion,
      timeout: config.esLocation.timeout
    },
    mysql: {
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      table: 'location',
      agendaSettingsTableName: 'location_agenda_settings'
    },
    files: {
      tmpPath: config.tmpFolderPath,
      bucket: config.aws.bucket,
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    },
    // callbacks for updating other app services when changes occur
    interfaces: appSvc.event.locations,
    logger: logger
  }, err => {

    if ( err ) log( 'error', 'could not init agenda locations: %s', err );

  } );

  return config;

}


function _initAgendaStakeholders( config ) {

  log( 'info', 'agenda stakeholders' );

  agendaStakeholders.init( {
    schemas: config.schemas,
    mysql: config.db,
    logger: logger
  }, err => {

    if ( err ) log( 'error', 'could not init agenda stakeholders: %s', err );

  } );

  return config;

}


function _initAgendaSearch( config ) {

  log( 'info', 'agenda search' );

  agendaSearch.init( {
    services: {
      agendas: agendasSvc
    },
    schemas: config.schemas,
    elasticsearch: {
      host: config.es.host + ':' + config.es.port,
      log: [ {
        type: 'stdio',
        level: [ 'error', 'warning' ]
      } ],
      apiVersion: '1.3',
      timeout: 30000
    },
    mw: {
      limit: {
        default: 20,
        max: 100
      }
    },
    image: {
      path: config.aws.imageBucketPath.replace( 'cibuldev', 'cibul' ),
      default: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    logger: logger
  }, err => {

    if ( err ) log( 'error', 'could not init agenda search: %s', err );

  } );

  return config;

}


function _initAgendaService( config ) {

  log( 'agenda service' );

  agendasSvc.init( {
    mysql: config.db,
    schemas: config.schemas,
    logger: logger
  } );

  return config;

}


function _initAgendaCategories( config ) {

  log( 'info', 'agenda categories' );

  agendaCategories.init( {
    store: config.db,
    legacy: config.db,
    logger: logger
  } );

  return config;

}


function _initAgendaTags( config ) {

  log( 'info', 'agenda tags' );

  agendaTags.init( {
    store: config.db,
    legacy: config.db,
    logger: logger,
    interfaces: appSvc.agenda.tags
  } );

  return config;

}


function _initMailer( config ) {

  log( 'info', 'mailer' );

  mailer.init( {
    queueName: 'mailer',
    host: config.redis.host,
    port: config.redis.port,
    log: logger( 'mailer' )
  } );

  return config;

}


function _initGenUrl( config ) {

  log( 'info', 'genUrl' );

  genUrl.init( { domain: config.domain } );

  return config;

}


function _initLogger( config ) {

  logger.init( config.logger );

  log = logger( 'init' );

  return config;

}