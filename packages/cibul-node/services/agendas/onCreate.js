import logs from '@openagenda/logs';

const log = logs('services/agendas/onCreate');

export default async (services, agenda) => {
  const {
    members,
    users: usersSvc,
    activities,
    inboxes,
    eventSearch,
    agendaSearch,
    discord,
  } = services;

  const Inbox = inboxes?.Inbox;

  // inbox
  if (Inbox) {
    try {
      log('create inbox (agenda uid %d)', agenda.uid);
      await new Inbox().create({
        type: 'agenda',
        identifier: agenda.uid,
      });
    } catch (e) {
      log('error', 'failed to create agenda inbox', e);
    }
  }

  let agendaFeed;

  // feed / activity
  if (activities) {
    try {
      agendaFeed = await activities
        .feed({
          entityType: 'agenda',
          entityUid: agenda.uid,
        })
        .create();
    } catch (e) {
      if (e.message !== 'Feed already exists') {
        log('error', 'failed to created agenda feed', e);
      }
    }
  }

  const user = await usersSvc.findOne({
    query: {
      id: agenda.ownerId,
    },
  });

  if (user.isNew) {
    await usersSvc.setNewFlag(user.uid, { isNew: false });
  }

  await members
    .create(
      {
        agendaUid: agenda.uid,
        userUid: user.uid,
        role: 2,
      },
      { requireCustom: false },
    )
    .catch((e) => {
      if (e) log('error', 'failed to create member');
      throw e;
    });

  if (agendaFeed) {
    try {
      await activities.addActivity(
        {
          entityType: 'agenda',
          entityUid: agenda.uid,
        },
        {
          actor: `user:${user.uid}`,
          verb: 'agenda.create',
          target: `agenda:${agenda.uid}`,
          store: {
            labels: {
              actor: user.fullName,
              target: agenda.title,
            },
          },
        },
      );
    } catch (e) {
      log('error', 'failed to create agenda create activity', e);
    }
  }

  if (agendaSearch && agenda.indexed) {
    try {
      await agendaSearch.set(agenda);
    } catch (e) {
      log('error', 'failed to index agenda in agenda search', e);
    }
  }

  try {
    await eventSearch.agendas(agenda).rebuild();
  } catch (e) {
    log('error', 'failed to create agenda index');
  }

  if (discord) {
    try {
      await discord.notifyAgendaCreation(agenda, user);
    } catch (e) {
      log('error', 'failed to notify discord %s', e);
    }
  }

  log('done');
};
