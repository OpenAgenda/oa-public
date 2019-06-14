"use strict";

const _ = require( 'lodash' );

const activities = require( '@openagenda/activities' );
const agendaStakeholders = require( '@openagenda/agenda-stakeholders' );
const { Inbox } = require( '@openagenda/inboxes' );
const keys = require( '@openagenda/keys' );
const log = require( '@openagenda/logs' )( 'services/agendas/onCreate' );
const users = require( '@openagenda/users' );

const controlDataSvc = require( '../legacy' ).controlData;
const legacyEventSearch = require( '../elasticsearch' );

module.exports = async ( agenda, cb ) => {

  if ( agenda.settings.contribution.useFields ) {

    agendaStakeholders( agenda.id ).settings.setDefault( err => {

      if ( !err ) return;

      log( 'error', {
        message: 'agenda creation default stakeholder settings could not be created',
        error: err
      } );

    } );

  }

  try {
    await legacyEventSearch.updateAgenda( agenda.id );
  } catch ( e ) {
    log( 'error', 'could not update legacy search for agenda %s', agenda.slug, e );
  }

  // inbox
  log( 'create inbox (agenda uid %d)', agenda.uid );
  new Inbox().create( { type: 'agenda', identifier: agenda.uid } ).then( _.noop );

  // feed / activity
  activities.feed( { entityType: 'agenda', entityUid: agenda.uid } ).create( ( err, agendaFeed ) => {

    if ( err ) return log( 'error', err );

    users.findOne( {
      query: {
        id: agenda.ownerId
      }
    } )
      .then( async user => {

        if ( user.isNew ) {

          await users.setNewFlag( user.uid, false );

        }

        controlDataSvc.rebuild( agenda.uid ).then( () => {
          controlDataSvc.memberSet( { agendaUid: agenda.uid, userUid: user.uid, role: 2 } );
        } );

        agendaStakeholders( agenda.id ).create( {
          email: user.email
        }, {
          allowPartial: true,
          credential: agendaStakeholders.types.get( 'administrator' )
        }, ( err, stakeholder ) => {

          if ( err ) {
            return log( 'error', 'could not name agenda %s owner administrator, err: %s', agenda.id, err.message || err );
          }

          cb();

          activities.feed( agendaFeed ).activities.add( {
            actor: 'user:' + user.uid,
            verb: 'agenda.create',
            target: 'agenda:' + agenda.uid,
            store: {
              labels: {
                actor: user.fullName,
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

      } )
      .catch( err => {

        log( 'error', err );

      } );

  } );

}
