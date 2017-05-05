"use strict";

const agendas = require( 'agendas' );

const agendaStakeholders = require( 'agenda-stakeholders' ),
  
  activitiesSvc = require( 'activities' ),

  coms = require( '../lib/coms' ),

  logger = require( 'logger' ),

  _ = require( 'lodash' );

module.exports.init = config => {

 agendas.init( {
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
      onCreate: onCreate.bind( null, config.mainChannel ),
      onUpdate: onUpdate.bind( null, config.mainChannel ),
      onRemove
    }
  } );

}


function onCreate( channel, agenda ) {

  // legacy elasticsearch needs to index reviews
  coms.publish( channel, {
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

}

function onRemove( agenda ) {

  activitiesSvc.feed( { entityType: 'agenda', entityUid: agenda.uid } ).remove();

}


function onUpdate( channel, before, after, context ) {

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

  coms.publish( channel, {
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

}