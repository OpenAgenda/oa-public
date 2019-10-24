'use strict';

module.exports = (services, req, res, next) => {

  services.aggregatorSources(req.agenda.id).remove({
    uid: req.query.uid
  }).then(async result => {
    res.send( result );

    let entities = {};

    try {
      const {
        user,
        member,
        agenda,
        source
      } = entities = await loadNeedsForActivity(services, req);

      await addRemoveSourceActivity(services.activities, { user, member, agenda, source });
    } catch (e) {
      req.log('error', 'failed adding activity of type agenda.removeSource', { member: entities.member, exception: e });
    }
  }, next);
}

async function loadNeedsForActivity({ members, agendas }, req) {
  const member = await members.get({
    agendaUid: req.agenda.uid,
    userUid: req.user.uid
  });

  if (!member) {
    throw new Error( 'Cannot found member' );
  }

  const source = await agendas.get({ uid: req.query.uid }, { private: null });

  if (!source) {
    throw new Error('Cannot found source agenda');
  }

  return {
    user: req.user,
    agenda: req.agenda,
    member,
    source
  };
}


function addRemoveSourceActivity(activities, { user, member, agenda, source }) {
  activities.feed( {
    entityType: 'agenda',
    entityUid: agenda.uid
  } ).activities.add( {
    actor: 'user:' + user.uid,
    verb: 'agenda.removeSource',
    object: 'agenda:' + source.uid,
    target: 'agenda:' + agenda.uid,
    store: {
      labels: {
        actor: member.custom.contactName || user.fullName,
        object: source.title,
        target: agenda.title
      }
    }
  } );
}
