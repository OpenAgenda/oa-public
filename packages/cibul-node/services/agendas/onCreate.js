"use strict";

const _ = require( 'lodash' );

const activities = require( '../activities' );
const { Inbox } = require( '@openagenda/inboxes' );
const keys = require( '@openagenda/keys' );
const log = require( '@openagenda/logs' )( 'services/agendas/onCreate' );

const controlDataSvc = require( '../legacy' ).controlData;
const legacyEventSearch = require( '../elasticsearch' );
const usersSvc = require('../users');
const membersSvc = require('../members');

module.exports = async agenda => {
  try {
    await legacyEventSearch.updateAgenda( agenda.id );
  } catch (e) {
    log( 'error', 'could not update legacy search for agenda %s', agenda.slug, e );
  }

  // inbox
  try {
    log( 'create inbox (agenda uid %d)', agenda.uid );
    await new Inbox().create( {
      type: 'agenda',
      identifier: agenda.uid
    } );
  } catch (e) {
    log('error', 'failed to create agenda inbox', e);
  }

  let agendaFeed;

  // feed / activity
  try {
    agendaFeed = await activities.feed({
      entityType: 'agenda',
      entityUid: agenda.uid
    }).create();
  } catch(e) {
    log('error', 'failed to created agenda feed', e);
  }

  const user = await usersSvc.findOne({
    query: {
      id: agenda.ownerId
    }
  });

  if (user.isNew) {
    await usersSvc.setNewFlag(user.uid, { isNew: false });
  }

  try {
    await controlDataSvc.rebuild( agenda.uid );
    await controlDataSvc.memberSet({
      agendaUid: agenda.uid,
      userUid: user.uid,
      role: 2
    });
  } catch (e) {
    log('error', 'failed to set agenda control data', e);
  }

  const { member } = await membersSvc.create({
    agendaUid: agenda.uid,
    userUid: user.uid,
    role: 2
  }, { requireCustom: false }).catch(e => {
    if (e) log('error', 'failed to create member');
    throw e;
  });

  if (agendaFeed) {
    try {
      await activities.feed(agendaFeed).activities.add({
        actor: 'user:' + user.uid,
        verb: 'agenda.create',
        target: 'agenda:' + agenda.uid,
        store: {
          labels: {
            actor: user.fullName,
            target: agenda.title
          }
        }
      });
    } catch(e) {
      log('error', 'failed to create agenda create activity', e);
    }
  }

  try {
    await keys({
      type: 'agendaFullRead',
      identifier: agenda.uid
    }).create();
  } catch (e) {
    log('error', 'failed to create agenda key', e);
  }

  log('done');
}
