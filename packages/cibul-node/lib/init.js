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

  model = require( '../services/model' ),

  genUrl = require( servicePath + '/genUrl' ),

  facebookSvc = require( 'facebook' ),

  agendaTags = require( 'agenda-tags' ),

  agendaCategories = require( 'agenda-categories' ),

  agendaStakeholders = require( 'agenda-stakeholders' ),

  agendaLocations = require( 'agenda-locations' ),

  agendaEventReferences = require( 'agenda-event-references' ),

  agendaSettings = require( 'agenda-settings' ),

  newsletterSvc = require( 'newsletter' ),

  adminAgendaSvc = require( 'admin-agendas' ),

  userSvc = require( 'users' ),

  imageSvc = require( 'images' ),

  filesSvc = require( 'files' ),

  homeSvc = require( 'home' ),

  aggregatorSourcesSvc = require( 'aggregator-sources' ),

  coms = require( './coms' );

let log;

module.exports = function ( config, cb ) {

  if ( arguments.length == 1 && typeof config === 'function' ) {

    cb = config;
    config = require( '../config' );

  } else if ( arguments.length === 0 ) {

    config = require( '../config' );
    cb = () => {
    };

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

    .then( _initAgendaSettings )

    .then( _initEmailStrategie )

    .then( _initImages )

    .then( _initNewsletter )

    .then( _initFiles )

    .then( _initAdminAgendas )

    .then( _initUsers )

    .then( _initFacebook )

    .then( _initHome )

    .then( _initAggregatorSources )

    .done( () => {
      cb()
    }, err => {

      log( 'error', err );

      cb( err )

    } );

}


function _initAggregatorSources( config ) {

  log( 'info', 'aggregator-sources' );

  let d = w.defer();

  aggregatorSourcesSvc.init( {
    mysql: config.db,
    schemas: config.schemas,
    image: {
      path: config.aws.imageBucketPath.replace( 'cibuldev', 'cibul' ),
      default: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    mw : {
      limit: 20
    }
  }, err => {

    if ( err ) {

      log( 'error', 'could not init aggregator-sources: %s', err );

      return d.reject( err );

    }

    d.resolve( config );

  } );

  return d.promise;

}


function _initHome( config ) {

  log( 'info', 'home' );

  let d = w.defer();

  homeSvc.init( {
    mysql: config.db,
    schemas: config.schemas,
    image: {
      path: config.aws.imageBucketPath.replace( 'cibuldev', 'cibul' ),
      default: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    mw: {
      limit: 20
    }
  }, err => {

    if ( err ) {

      log( 'error', 'could not init home: %s', err );

      return d.reject( err );

    }

    d.resolve( config );

  } );

  return d.promise;

}

function _initFacebook( config ) {

  log( 'info', 'facebook' );

  let d = w.defer();

  facebookSvc.init( {
    app: config.auth.facebook,
    routes: {
      tabRedirect: config.root + '/facebook/tab/create/:state'
    },
    db: config.db
  }, err => {

    if ( err ) {

      log( 'error', 'could not init facebook: %s', err );

      return d.reject( err );

    }

    d.resolve( config );

  } );

  return d.promise;

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

  let d = w.defer();

  adminAgendaSvc.init( {
    services: {
      agendas: agendasSvc,
      agendaStakeholders: agendaStakeholders
    },
    mysql: config.db,
    schemas: config.schemas,
    logger: logger
  }, err => {

    if ( err ) {

      log( 'error', 'could not init admin agenda service %s', err );

      return d.reject( err );

    }

    return d.resolve( config );

  } );

  return d.promise;

}


function _initUsers( config ) {

  log( 'info', 'users' );

  let d = w.defer();

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
  }, err => {

    if ( err ) {

      log( 'error', 'could not init user service %s', err );

      return d.reject( err );

    }

    return d.resolve( config );

  } );

  return d.promise;

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

function _initAgendaSettings( config ) {

  log( 'info', 'agenda settings' );

  return new Promise( ( resolve, reject ) => {

    agendaSettings.init( {
      services: {
        agendas: agendasSvc
      },
      mysql: config.db,
      schemas: config.schemas,
      logger: logger
    }, err => {

      if ( err ) return reject( err );

      resolve( config );
      
    } );

  } );

}


function _initAgendaEventReferences( config ) {

  log( 'info', 'agenda event references' );

  let d = w.defer();

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

    if ( err ) {

      log( 'error', 'could not init agenda-event-references: %s', err );

      return d.reject( err );

    }

    d.resolve( config );

  } );

  return d.promise;

}


function _initAgendaLocations( config ) {

  log( 'info', 'agenda locations' );

  let d = w.defer();

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
    files: {
      tmpPath: config.tmpFolderPath,
      bucket: config.aws.bucket,
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    },
    maxLimit: 300,
    // callbacks for updating other app services when changes occur
    interfaces: utils.extend( {
      getAgendaSettings: ( agendaId, cb ) => {

        agendasSvc.get( agendaId, ( err, agenda ) => cb( err, agenda ? agenda.settings : {} ) )

      }
    }, appSvc.event.locations ),
    logger: logger
  }, err => {

    if ( err ) {

      log( 'error', 'could not init agenda locations: %s', err );

      return d.reject( err );

    }

    d.resolve( config );

  } );

  return d.promise;

}


function _initAgendaStakeholders( config ) { // async

  log( 'info', 'agenda stakeholders' );

  let d = w.defer();

  agendaStakeholders.init( {
    schemas: config.schemas,
    mysql: config.db,
    logger: logger,
    interfaces: {
      getUser: ( userId, cb ) => {

        userSvc.get( { id: userId }, cb );

      },
      getEventCount: ( agendaId, userId, cb ) => {

        model.lib.query( [
          'select count( distinct ra.id ) event_count',
          'from review_article as ra',
          'where ra.review_id = ? and ra.user_id = ?'
        ].join( ' ' ), [ agendaId, userId ], ( err, rows ) => {

          if ( err ) return cb( err );

          if ( !rows.length ) return cb( null, 0 );

          cb( null, parseInt( rows[ 0 ].event_count ) );

        } );

      }
    }
  }, err => {

    if ( err ) {

      log( 'error', 'could not init agenda stakeholders: %s', err );

      return d.reject( err );

    }

    d.resolve( config );

  } );

  return d.promise;

}


function _initAgendaSearch( config ) { // sync

  log( 'info', 'agenda search' );

  agendaSearch.init( {
    services: {
      agendas: agendasSvc
    },
    schemas: config.schemas,
    elasticsearch: {
      host: config.es.host + ':' + config.es.port,
      log: [ {
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
    logger: logger,
    site: {
      url: config.root,
      image: config.logo
    }
  } );

  return config;

}


function _initAgendaService( config ) { // sync

  log( 'agenda service' );

  agendasSvc.init( {
    mysql: config.db,
    schemas: config.schemas,
    files: {
      tmpPath: config.tmpFolderPath,
      bucket: config.aws.bucket,
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    },
    imagePath: config.aws.imageBucketPath,
    logger,
    interfaces: {
      onCreate: agenda => {

        // legacy elasticsearch needs to index reviews
        coms.publish( config.mainChannel, {
          name: 'agenda.create',
          values: {
            id: agenda.id
          }
        } );

        if ( agenda.settings.contribution.useFields ) {

          agendaStakeholders( agenda.id ).settings.setDefault( err => {

            log( 'error', { message: 'agenda creation default stakeholder settings could not be created', error: err } );

          } );

        }

        agendaStakeholders( agenda.id ).new( {
          userId: agenda.ownerId, 
          credential: 2
        } ).save( err => {

          if ( !err ) return;

          log( 'error', 'could not name agenda %s owner administrator', agenda.id );

        } );

      },
      onUpdate: ( before, after ) => {

        let updateType,

        hasContributionSettingsChange = JSON.stringify( before.settings.contribution ) !== JSON.stringify( after.settings.contribution ),

        hasCredentialsChange = JSON.stringify( before.credentials ) !== JSON.stringify( after.credentials );

        if ( hasContributionSettingsChange ) {

          updateType = 'contribution';

        } else if ( hasCredentialsChange ) {

          updateType = 'credentials';

        }

        // set stakeholder field requirements
        if ( !before.settings.contribution.useFields && after.settings.contribution.useFields ) {

          agendaStakeholders( before.id ).settings.setDefault( err => {

            if ( err ) log( 'error', { message: 'agenda update default stakeholder settings could not be created', error: err, agendaId: before.id } );

          } );

        }

        coms.publish( config.mainChannel, {
          name: 'agenda.update',
          values: {
            id: after.id,
            type: updateType
          }
        } );

      }
    }
  } );

  return config;

}


function _initAgendaCategories( config ) { // async

  let d = w.defer();

  log( 'info', 'agenda categories' );

  agendaCategories.init( {
    store: config.db,
    legacy: config.db,
    logger: logger,
    interfaces: appSvc.agenda.tagsAndCategories
  }, err => {

    if ( err ) return d.reject( err );

    d.resolve( config );

  } );

  return d.promise;

}


function _initAgendaTags( config ) { // async

  let d = w.defer();

  log( 'info', 'agenda tags' );

  agendaTags.init( {
    store: config.db,
    legacy: config.db,
    logger: logger,
    interfaces: appSvc.agenda.tagsAndCategories
  }, err => {

    if ( err ) return d.reject( err );

    d.resolve( config );

  } );

  return d.promise;

}


function _initMailer( config ) { // sync

  log( 'info', 'mailer' );

  mailer.init( {
    queueName: 'mailer',
    host: config.redis.host,
    port: config.redis.port,
    log: logger( 'mailer' )
  } );

  return config;

}


function _initGenUrl( config ) { // sync

  log( 'info', 'genUrl' );

  genUrl.init( { domain: config.domain } );

  return config;

}


function _initLogger( config ) { // sync

  logger.init( config.logger );

  log = logger( 'init' );

  return config;

}