"use strict";

const servicePath = __dirname + '/../services',

  w = require( 'when' ),

  async = require( 'async' ),

  _ = require( 'lodash' ),

  utils = require( 'utils' ),

  logger = require( 'logger' ),

  mailer = require( 'mailer' ),

  appSvc = {
    agenda: require( servicePath + '/agenda' ),
    event: require( servicePath + '/event' )
  },

  emailStrategie = require( 'emailStrategie' ),

  unsubscribed = require( 'unsubscribed' ),

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

  sessions = require( 'sessions' ),

  aggregatorSourcesSvc = require( 'aggregator-sources' ),

  invitationsSvc = require( 'invitations' ),

  activitiesSvc = require( 'activities' ),

  activityAppsMw = require( 'activity-apps/middleware' ),

  coms = require( './coms' ),

  getInvitationLabel = require( 'labels' )( require( 'labels/members/invitation' ) );

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

    .then( _initSessions )

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

    .then( _initInvitations )

    .then( _initUnsubscribed )

    .then( _initActivities )

    .then( _initActivityApps )

    .done( () => {
      cb()
    }, err => {

      log( 'error', err );

      cb( err )

    } );

}

function _initActivityApps( config ) {

  log( 'info', 'activity-apps' );

  activityAppsMw.init( { limit: 20 } );

  return config

}

function _initActivities( config ) {

  log( 'info', 'activities' );

  const getRole = agendaStakeholders.types.get; 

  return activitiesSvc.init( {
    mysql: config.db,
    schemas: config.schemas,
    migrations: {
      tableName: 'activity_migrations'
    },
    filterFollows: [ {
      verb: [ 'event.publish', 'event.unpublish' ],
      getFeeds: true,
      filter: ( activity, originFeed, targetFeed, follow, cb ) => {

        if ( targetFeed.entityType === 'agenda' && targetFeed.entityUid !== activity.target.split( ':' )[ 1 ] ) {
          return cb( null, false );
        }

        cb( null, true );

      }
    }, {
      verb: 'agenda.setMemberRole',
      filter: ( activity, originFeed, targetFeed, follow, cb ) => {

        agendaStakeholders.type.get( 'moderator' );

        if (
          !agendaStakeholders.types.isSuperiorTo( follow.store.credential, getRole( 'moderator' ), true ) // less than moderator
          || (follow.store.credential === getRole( 'moderator' ) && activity.store.credential === getRole( 'administrator' ) ) // moderator doesn't sees who has become an administrator
        ) {

          return cb( null, false );

        }

        cb( null, true );

      }
    } ]
  } )
    .then( () => config );

}


function _initUnsubscribed( config ) {

  log( 'info', 'unsubscribed' );

  unsubscribed.init( {
    mysql: config.db,
    schemas: {
      unsubscribed: config.schemas.unsubscribed
    }
  } );

  return config;

}


function _initInvitations( config ) {

  log( 'info', 'invitations' );

  invitationsSvc.init( {
    mysql: config.db,
    schemas: config.schemas,
    interfaces: {
      onAssign: ( action, invitation, cb ) => cb( null )
    },
    actions: {
      linkStakeholder: ( executeData, actionParams, cb ) => {

        const { user } = executeData;
        const [ stakeholder, context ] = actionParams;

        agendaStakeholders.agenda( stakeholder.agendaId ).update( {
          id: stakeholder.id
        }, {
          contact_name: user.fullName
        }, {
          allowPartial: true,
          userId: user.id,
          context
        }, err => cb( err ) );

      }
    }
  } );

  return config;

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
    mw: {
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
    logger
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
    logger
  } );

  return config;

}


function _initFiles( config ) {

  log( 'info', 'files' );

  filesSvc.init( {
    bucket: config.aws.bucket,
    accessKeyId: config.aws.accessKeyId, // required
    secretAccessKey: config.aws.secretAccessKey, // required too
    logger
  } );

  return config;

}


function _initAdminAgendas( config ) {

  log( 'info', 'admin agenda' );

  let d = w.defer();

  adminAgendaSvc.init( {
    services: {
      agendas: agendasSvc,
      agendaStakeholders
    },
    mysql: config.db,
    schemas: config.schemas,
    logger
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
    interfaces: {
      beforeRemove: ( user, cb ) => {

        // remove 100 stakeholders

        activitiesSvc.feed( { entityType: 'user', entityUid: user.uid } ).remove( () => {

          agendaStakeholders.user( user.id ).list( 0, 100, ( err, stakeholders ) => {

            async.eachSeries(
              stakeholders,
              ( sh, acb ) => {

                agendaStakeholders.agenda( sh.agendaId ).update( { id: sh.id }, {}, {
                  allowPartial: true,
                  deletedUser: true
                }, err => {

                  if ( err ) log( 'error', 'could not remove stakeholder ', err );

                  acb( null );

                } );

              },
              () => cb()
            );

          } );

        } );

      }
    },
    logger
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
    logger
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
      logger
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
    logger,
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
    logger
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

  const sendStakeholderInvitation = ( invitation, stakeholder, context, agenda ) => {

    userSvc.get( context.invitationSender.userId, ( err, user ) => {

      if ( err ) return log( 'error', err );

      activitiesSvc.feed( { entityType: 'agenda', entityUid: agenda.uid } ).activities.add( {
        actor: 'user:' + user.uid,
        verb: 'agenda.sendInvitation',
        object: stakeholder.custom.email,
        target: 'agenda:' + agenda.uid,
        store: {
          labels: {
            actor: context.invitationSender.name || user.full_name,
            // object: stakeholder.custom.email,
            target: agenda.title
          },
          credential: stakeholder.credential
        }
      } );

    } );

    let lang = ( context && context.lang ) || 'fr';

    let signupUrl = genUrl( 'signup', {
      invitation: invitation.token,
      email: stakeholder.custom.email,
      lang
    }, {
      abs: true,
      protocol: 'https://'
    } );

    mailer( {
      recipient: stakeholder.custom.email,
      subject: getInvitationLabel( 'emailSubject', lang ),
      data: {
        logo: 'https://openagenda.com/images/openagenda.png',
        title: {
          text: getInvitationLabel( 'emailTitle', { title: agenda.title }, lang ),
          link: signupUrl
        },
        action: {
          label: getInvitationLabel( 'emailAction', lang ),
          link: signupUrl
        },
        description: context.message ? context.message : getInvitationLabel( 'emailDescription', {
          title: agenda.title,
          credential: getInvitationLabel( agendaStakeholders.types.codes.get( stakeholder.credential ), lang )
        }, lang )
      }
    } );

  };

  agendaStakeholders.init( {
    queue: {
      names: {
        bulk: config.queues.stakeholderCreate,
        message: config.queues.stakeholderMessage
      },
      redis: config.redis,
      threshold: 20
    },
    schemas: config.schemas,
    mysql: config.db,
    logger,
    interfaces: {
      onMessage( stakeholder, message, cb ) {

        // if user has an invitation, set activation link as call to action
        // if user has an account, set agenda add event page as cta
        cb()

      },
      onCreate( stakeholder, context ) {

        agendasSvc.get( { id: stakeholder.agendaId }, { private: null }, ( err, agenda ) => {

          if ( err ) return log( 'error', err );

          if ( !agenda ) return log( 'info', 'agenda not found: %s', stakeholder.agendaId );

          // user already exists
          if ( stakeholder.userId ) {

            userSvc.get( stakeholder.userId, ( err, user ) => {

              if ( err ) return log( 'error', err );

              userSvc.get( context.invitationSender.userId, ( err, senderUser ) => {

                if ( err ) return log( 'error', err );

                activitiesSvc.feed( { entityType: 'user', entityUid: user.uid } )
                  .follow( { entityType: 'agenda', entityUid: agenda.uid }, { credential: stakeholder.credential } )
                  .then( () => {

                    activitiesSvc.feed( { entityType: 'agenda', entityUid: agenda.uid } ).activities.add( {
                      actor: 'user:' + senderUser.uid,
                      verb: 'agenda.addMember',
                      object: 'user:' + user.uid,
                      target: 'agenda:' + agenda.uid,
                      store: {
                        labels: {
                          actor: context.invitationSender.name || senderUser.full_name,
                          object: stakeholder.custom.contactName || user.full_name,
                          target: agenda.title
                        },
                        credential: stakeholder.credential
                      }
                    } );

                  } );

              } );

            } );

            return;

          }

          // new user
          invitationsSvc.assign( { email: stakeholder.custom.email }, 'linkStakeholder', [ stakeholder, context ] )
            .then( ( { invitation } ) => {

              sendStakeholderInvitation( invitation, stakeholder, context, agenda );

            } )
            .catch( err => {

              log( 'error', err );

            } );

        } );

      },
      onUpdate( before, stakeholder, context ) {

        agendasSvc.get( { id: stakeholder.agendaId }, { private: null }, ( err, agenda ) => {

          if ( err ) return log( 'error', err );

          if ( !agenda ) return log( 'info', 'agenda not found: %s', stakeholder.agendaId );

          // Activities
          userSvc.get( stakeholder.userId, ( err, user ) => {

            if ( err ) return log( 'error', err );

            userSvc.get( context.invitationSender.userId, ( err, senderUser ) => {

              if ( err ) return log( 'error', err );

              // new user
              if ( stakeholder.userId && before.userId !== stakeholder.userId ) {

                activitiesSvc.feed( { entityType: 'user', entityUid: user.uid } )
                  .follow( { entityType: 'agenda', entityUid: agenda.uid }, { credential: stakeholder.credential } )
                  .then( () => {

                    activitiesSvc.feed( { entityType: 'agenda', entityUid: agenda.uid } ).activities.add( {
                      actor: 'user:' + user.uid,
                      verb: 'agenda.acceptInvitation',
                      object: 'user:' + senderUser.uid,
                      target: 'agenda:' + agenda.uid,
                      store: {
                        labels: {
                          actor: stakeholder.custom.contactName || user.full_name,
                          object: context.invitationSender.name || senderUser.full_name,
                          target: agenda.title
                        },
                        credential: stakeholder.credential
                      }
                    } );

                  } );

              }

              // change credentials
              if ( stakeholder.userId && before.credential !== stakeholder.credential ) {

                activitiesSvc.feed( { entityType: 'user', entityUid: user.uid } )
                  .unfollow( { entityType: 'agenda', entityUid: agenda.uid }, err => {

                    if ( err ) return log( 'error', err );

                    activitiesSvc.feed( { entityType: 'user', entityUid: user.uid } )
                      .follow( {
                        entityType: 'agenda',
                        entityUid: agenda.uid
                      }, { credential: stakeholder.credential }, err => {

                        if ( err ) return log( 'error', err );

                        activitiesSvc.feed( { entityType: 'agenda', entityUid: agenda.uid } ).activities.add( {
                          actor: 'user:' + senderUser.uid,
                          verb: 'agenda.setMemberRole',
                          object: 'user:' + user.uid,
                          target: 'agenda:' + agenda.uid,
                          store: {
                            labels: {
                              actor: context.invitationSender.name || senderUser.full_name,
                              object: stakeholder.custom.contactName || user.full_name,
                              target: agenda.title
                            },
                            beforeCredential: before.credential,
                            credential: stakeholder.credential
                          }
                        } );

                      } );

                  } );

              }

            } );

          } );

          // Invitation
          if (
            !_.isEqual( _.omit( before, 'updatedAt' ), _.omit( stakeholder, 'updatedAt' ) )
            || stakeholder.deletedUser
            || stakeholder.userId
          ) {

            return;

          }

          invitationsSvc.get( { email: stakeholder.custom.email } )
            .then( ( { invitation } ) => {

              const action = invitation.data.actions.find( v => v.name === 'linkStakeholder' );
              context = action.params[ 1 ] || context;

              sendStakeholderInvitation( invitation, stakeholder, context, agenda );

            } );

        } );

      },
      onRemove( stakeholder ) {

        agendasSvc.get( { id: stakeholder.agendaId }, { private: null }, ( err, agenda ) => {

          if ( err ) return log( 'error', err );

          if ( !agenda ) return log( 'info', 'agenda not found: %s', stakeholder.agendaId );

          userSvc.get( stakeholder.userId, ( err, user ) => {

            if ( err ) return log( 'error', err );

            if ( !user ) return;

            activitiesSvc.feed( { entityType: 'user', entityUid: user.uid } )
              .unfollow( { entityType: 'agenda', entityUid: agenda.uid } );

          } );

        } );

        invitationsSvc.get( { email: stakeholder.custom.email } )
          .then( ( { invitation } ) => {

            const action = invitation.data.actions.find( v => {
              return v.name === 'linkStakeholder' && v.params[ 0 ].id === stakeholder.id;
            } );

            if ( !action ) return;

            if ( invitation.data.actions.length > 1 ) {
              return invitation.removeAction( action.id );
            }

            return invitation.remove();

          } );

      },
      beforeTransferEvent( eventUid, ownerId, nextOwnerId, cb ) {

        userSvc.get( ownerId, ( err, ownerUser ) => {

          if ( err ) return cb( err );

          userSvc.get( nextOwnerId, ( err, nextOwnerUser ) => {

            if ( err ) return cb( err );

            activitiesSvc.feed( { entityType: 'user', entityUid: ownerUser.uid } )
              .unfollow( { entityType: 'event', entityUid: eventUid }, err => {

                if ( err ) {

                  log( 'error', err );
                  return cb( err );

                }

                activitiesSvc.feed( { entityType: 'user', entityUid: nextOwnerUser.uid } )
                  .follow( { entityType: 'event', entityUid: eventUid }, err => {

                    if ( err ) {

                      log( 'error', err );
                      return cb( err );

                    }

                    cb();

                  } );

              } );

          } );

        } );

      },
      getUser( identifiers, cb ) {

        userSvc.get( identifiers, cb );

      },
      getExistingCredentials( agendaId, cb ) {

        agendasSvc.get( { id: agendaId }, { instanciate: true, private: null }, ( err, agenda ) => {

          if ( err ) return cb( err );

          agenda.getRoles( ( err, credentials ) => {

            if ( err ) return cb( err );

            cb( null, credentials.map( c => c.value ) );

          } );

        } );

      },
      getEventCount( agendaId, userId, cb ) {

        model.lib.query( [
          'select count( distinct ra.id ) event_count',
          'from review_article as ra',
          'where ra.review_id = ? and ra.user_id = ?'
        ].join( ' ' ), [ agendaId, userId ], ( err, rows ) => {

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
    logger,
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
    existingRoles: agendaStakeholders.types.types,
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

            if ( !err ) return;

            log( 'error', {
              message: 'agenda creation default stakeholder settings could not be created',
              error: err
            } );

          } );

        }

        activitiesSvc.feed( { entityType: 'agenda', entityUid: agenda.uid } ).create( ( err, agendaFeed ) => {

          if ( err ) return log( 'error', err );

          userSvc.get( agenda.ownerId, ( err, user ) => {

            if ( err ) return log( 'error', err );

            agendaStakeholders( agenda.id ).create( {
              email: user.email
            }, {
              allowPartial: true,
              credential: agendaStakeholders.types.get( 'administrator' )
            }, ( err, stakeholder ) => {

              if ( err ) return log( 'error', 'could not name agenda %s owner administrator', agenda.id );

              activitiesSvc.feed( agendaFeed ).activities.add( {
                actor: 'user:' + user.uid,
                verb: 'agenda.create',
                target: 'agenda:' + agenda.uid,
                store: {
                  labels: {
                    actor: user.full_name,
                    target: agenda.title
                  }
                }
              } )
                .catch( err => {

                  log( 'error', err );

                } );

            } );

          } );

        } );

      },
      onUpdate: ( before, after, context ) => {

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

            if ( err ) log( 'error', {
              message: 'agenda update default stakeholder settings could not be created',
              error: err,
              agendaId: before.id
            } );

          } );

        }

        coms.publish( config.mainChannel, {
          name: 'agenda.update',
          values: {
            id: after.id,
            type: updateType
          }
        } );

        if ( !_.isEqual(
            _.omit( before, [ 'settings', 'credentials', 'title', 'official', 'updatedAt' ] ),
            _.omit( after, [ 'settings', 'credentials', 'title', 'official', 'updatedAt' ] )
          ) ) {

          updateType = 'profile';

        }

        if ( context && context.user ) {

          if ( before.title !== after.title ) {

            activitiesSvc.feed( { entityType: 'agenda', entityUid: after.uid } ).activities.add( {
              actor: 'user:' + context.user.uid,
              verb: 'agenda.rename',
              target: 'agenda:' + after.uid,
              store: {
                labels: {
                  actor: context.user.name,
                  beforeTitle: before.title,
                  afterTitle: after.title
                }
              }
            } );

          }

          if ( updateType && updateType !== 'credentials' ) {

            activitiesSvc.feed( { entityType: 'agenda', entityUid: after.uid } ).activities.add( {
              actor: 'user:' + context.user.uid,
              verb: 'agenda.update' + _.upperFirst( updateType ),
              target: 'agenda:' + after.uid,
              store: {
                labels: {
                  actor: context.user.name,
                  target: after.title
                }
              }
            } );

          }

          if ( before.official !== after.official ) {

            activitiesSvc.feed( { entityType: 'agenda', entityUid: after.uid } ).activities.add( {
              actor: 'user:' + context.user.uid,
              verb: 'agenda.setOfficial',
              target: 'agenda:' + after.uid,
              store: {
                labels: {
                  actor: context.user.name,
                  target: after.title
                },
                officialized: !!after.official
              }
            } );

          }

        }

      },
      onRemove: agenda => {

        activitiesSvc.feed( { entityType: 'agenda', entityUid: agenda.uid } ).remove();

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
    logger,
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
    logger,
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
    log: logger( 'mailer' ),
    mailService: config.mailer.service,
    mailServiceConf: Object.assign( {
      mailDefault: config.mailer.mailDefault
    }, config.mailerServices[ config.mailer.service ] )
  } );

  return config;

}


function _initGenUrl( config ) { // sync

  log( 'info', 'genUrl' );

  genUrl.init( { domain: config.domain } );

  return config;

}


function _initSessions( config ) {

  log( 'info', 'sessions' );

  sessions.init( {
    redis: {
      host: config.redis.host,
      port: config.redis.port,
      hash: config.session.namespace
    },
    sessionCookie: config.session,
    writableCookie: {
      maxAge: config.session.maxAge,
      name: config.session.writableName // overriden by iso configuration
    },
    interfaces: {
      getUser: ( query, cb ) => {

        userSvc.get( query, { detailed: true }, ( err, u ) => {

          if ( err || !u ) return cb( err, u );

          cb( null, {
            id: u.id,
            uid: u.uid,
            name: u.full_name,
            thumbnail: u.image ? config.aws.imageBucketPath + u.image : null,
            email: u.email,
            culture: u.culture
          } );

        } );

      }
    }
  } );

  return config;

}


function _initLogger( config ) { // sync

  logger.init( config.logger );

  log = logger( 'init' );

  return config;

}