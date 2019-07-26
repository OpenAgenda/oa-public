"use strict";

const _ = require( 'lodash' );

const activities = require( '@openagenda/activities' );
const agendaStakeholders = require( '@openagenda/agenda-stakeholders' );

const log = require( '@openagenda/logs' )( 'services/agendas/onCreate' );
const legacyEventSearch = require( '../elasticsearch' );

module.exports = async ( before, after, context ) => {

  const hasContributionSettingsChange = JSON.stringify( before.settings.contribution ) !== JSON.stringify( after.settings.contribution );
  const hasCredentialsChange = JSON.stringify( before.credentials ) !== JSON.stringify( after.credentials );
  let updateType;

  try {
    await legacyEventSearch.updateAgenda( after.id );
  } catch ( e ) {
    log( 'error', 'could not update legacy search for agenda %s', after.slug, e );
  }

  if ( hasContributionSettingsChange ) {
    updateType = 'contribution';
  } else if ( hasCredentialsChange ) {
    updateType = 'credentials';
  } else if ( !_.isEqual(
    _.omit( before, [ 'settings', 'credentials', 'title', 'official', 'officializedAt', 'updatedAt' ] ),
    _.omit( after, [ 'settings', 'credentials', 'title', 'official', 'officializedAt', 'updatedAt' ] )
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
