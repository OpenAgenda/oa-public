"use strict";

const config = require( '../config' );
const agendas = require( 'agendas' );
const agendaStakeholders = require( 'agenda-stakeholders' );
const activities = require( '@openagenda/activities' );
const users = require( '@openagenda/users' );
const model = require( './model' );
const coms = require( '../lib/coms' );
const logger = require( 'logger' );
const _ = require( 'lodash' );
const keys = require( '@openagenda/keys' );

let log = console.log;

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
    defaultImagePath: config.aws.defaultImagePath,
    logger,
    interfaces: {
      onCreate: onCreate.bind( null, config.mainChannel ),
      onUpdate: onUpdate.bind( null, config.mainChannel ),
      beforeRemove,
      onRemove
    }
  } );

}

module.exports.setLog = l => log = l;


function onCreate( channel, agenda, cb ) {

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

  activities.feed( { entityType: 'agenda', entityUid: agenda.uid } ).create( ( err, agendaFeed ) => {

    if ( err ) return log( 'error', err );

    users.get( agenda.ownerId, ( err, user ) => {

      if ( err ) return log( 'error', err );

      if ( user.is_new ) {

        users.setNewFlag( { id: user.id }, false, ( err ) => {

          if ( err ) return log( 'error', err );

        } )

      }

      agendaStakeholders( agenda.id ).create( {
        email: user.email
      }, {
        allowPartial: true,
        credential: agendaStakeholders.types.get( 'administrator' )
      }, ( err, stakeholder ) => {

        if ( err ) {

          return log( 'error', 'could not name agenda %s owner administrator, err: %s', agenda.id, err.message || err );
          
        }

        cb( err );

        activities.feed( agendaFeed ).activities.add( {
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

      keys( { type: 'agendaFullRead', identifier: agenda.uid } ).create()
        .catch( err => {

          log( 'error', err );

        } );

    } );

  } );

}


function beforeRemove( agenda, cb ) {

  model.lib.query(
    `DELETE FROM ${config.schemas.conversationReviewerRequestInfo} WHERE review_id = ?`,
    agenda.id,
    () => cb()
  );

}


function onRemove( agenda ) {

  activities.feed( { entityType: 'agenda', entityUid: agenda.uid } ).remove();

}


function onUpdate( channel, before, after, context ) {

  let updateType,

    hasContributionSettingsChange = JSON.stringify( before.settings.contribution ) !== JSON.stringify( after.settings.contribution ),

    hasCredentialsChange = JSON.stringify( before.credentials ) !== JSON.stringify( after.credentials );

  if ( hasContributionSettingsChange ) {

    updateType = 'contribution';

  } else if ( hasCredentialsChange ) {

    updateType = 'credentials';

  } else if ( !_.isEqual(
      _.omit( before, [ 'settings', 'credentials', 'title', 'official', 'updatedAt' ] ),
      _.omit( after, [ 'settings', 'credentials', 'title', 'official', 'updatedAt' ] )
    ) ) {

    updateType = 'profile';

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

  if ( context && context.user ) {

    if ( before.title !== after.title ) {

      activities.feed( { entityType: 'agenda', entityUid: after.uid } ).activities.add( {
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

      activities.feed( { entityType: 'agenda', entityUid: after.uid } ).activities.add( {
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

      activities.feed( { entityType: 'agenda', entityUid: after.uid } ).activities.add( {
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