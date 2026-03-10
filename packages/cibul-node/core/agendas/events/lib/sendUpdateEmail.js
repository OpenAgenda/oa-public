import _ from 'lodash';
import logs from '@openagenda/logs';
import Stopwatch from '../../utils/Stopwatch.js';

const log = logs('core/events/sendUpdateEmail');

const eventLink = (root, agenda, event) =>
  `${root}/${agenda.slug}/events/${event.slug}`;

const agendaLogo = (agenda) =>
  (agenda?.image
    ? {
      src: agenda.image.replace('.com/', '.com/rwtb'),
      width: '100px',
    }
    : {
      src: 'https://openagenda.com/images/openagenda.png',
      width: '300px',
    });

export default async function sendUpdateEmail(
  core,
  { batched, agenda, event },
) {
  const stopwatch = Stopwatch();
  const times = {};
  const { root } = core.getConfig();

  const { mails, members: membersSvc, users: usersSvc } = core.services;

  if (!mails) {
    log('warn', 'mails is not initialized');
    return;
  }

  log('processing');
  if (batched) {
    log('part of batch, not sending event update emails');
    return { times };
  }

  const link = eventLink(root, agenda, event);
  const logo = agendaLogo(agenda);

  const members = await membersSvc.listAllAdminMods(agenda.uid);

  times.members = stopwatch();

  if (!event.ownerUid) {
    throw new Error(
      'event owner reference is missing. Not sending update mail',
    );
  }

  const ownerUser = await usersSvc.findOne({
    query: { uid: event.ownerUid },
  });

  times.ownerUser = stopwatch();

  const ownerMember = ownerUser
    ? await membersSvc.get({
      agendaUid: agenda.uid,
      userUid: ownerUser.uid,
    })
    : null;

  times.ownerMember = stopwatch();

  if (!ownerMember) {
    log(
      'owner member was not found for user of uid % in agenda %s',
      event.ownerUid,
      agenda.slug,
    );
  } else if (agenda.uid === event.originAgenda.uid) {
    log('agenda is origin agenda and user is owner, sending myEventUpdate');
    const ownerLang = ownerUser.culture || 'fr';
    await mails.send({
      template: 'myEventUpdate',
      to: {
        address: ownerUser.email,
        unsubscriptions: [
          {
            rule: ['receive', 'myEventUpdate'],
            dataPath: 'unsubscribeLink',
          },
          {
            memberId: ownerMember.id,
            rule: ['receive', 'myEventUpdate'],
            dataPath: 'memberUnsubscribeLink',
          },
        ],
      },
      data: {
        event: event.title[ownerLang] ?? _.find(event.title),
        agenda: agenda.title,
        logo,
        link,
      },
      lang: ownerLang,
    });

    times.myEventUpdateSend = stopwatch();
  }

  const adminModMembers = members
    .filter((member) => !!member.user)
    .filter((member) => !ownerMember || member.id !== ownerMember.id);

  log('sending eventUpdate to %s adminmods', adminModMembers.length);
  await mails.send({
    template: 'eventUpdate',
    to: adminModMembers.map((member) => {
      const lang = member.user.culture || 'fr';
      const eventTitle = event.title[lang] || _.find(event.title);

      return {
        address: member.user.email,
        lang: member.user.culture,
        unsubscriptions: [
          {
            rule: ['receive', 'eventUpdate'],
            dataPath: 'unsubscribeLink',
          },
          {
            memberId: member.id,
            rule: ['receive', 'eventUpdate'],
            dataPath: 'memberUnsubscribeLink',
          },
        ],
        data: {
          event: eventTitle,
        },
      };
    }),
    data: {
      agenda: agenda.title,
      logo,
      link,
    },
  });

  times.eventUpdateSend = stopwatch();
  return { times };
}
