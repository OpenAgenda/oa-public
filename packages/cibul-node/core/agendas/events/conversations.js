import _ from 'lodash';
import { BadRequest } from '@openagenda/verror';

const create = async (core, agendaOrUid, eventOrUid, data, options) => {
  const { services } = core;
  const { inboxes, agendaEvents, events, agendas } = services;
  const { userUid } = options;

  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;
  const eventUid = _.isObject(eventOrUid) ? eventOrUid.uid : eventOrUid;

  const agenda = agendaOrUid?.constructor.name === 'Object'
    ? agendaOrUid
    : await agendas.get(
      { uid: agendaOrUid },
      {
        internal: true,
        private: null,
        includeImagePath: true,
      },
    );

  const event = await eventOrUid?.constructor.name === 'Object'
    ? eventOrUid
    : await events.get(eventOrUid, {
      private: null,
      access: 'internal',
      includeFields: ['uid', 'private', 'ownerUid', 'draft', 'title'],
    });

  const agendaEvent = await agendaEvents(agendaUid).get(eventUid, {
    throwOnNotFound: true,
  });

  if (userUid === agendaEvent.userUid) {
    throw new BadRequest('Cannot create conversation with yourself');
  }

  const consolidatedData = {
    type: 'event',
    typeIdentifier: eventUid,
    params: {
      agendaTitle: agenda.title?.fr ? agenda.title?.fr : agenda.title,
      agendaUid,
      eventTitle: event.title?.fr ? event.title?.fr : event.title, // get event tilte
    },
    destinationInbox: {
      type: 'user',
      identifier: agendaEvent.userUid,
    },
    creatorInboxUser: { userUid },
    message: data.message,
  };

  const inboxIdentifiers = {
    type: 'agenda',
    identifier: parseInt(agendaUid, 10),
  };

  const creatingInbox = new inboxes.Inbox(inboxIdentifiers);

  const conversationEntities = new inboxes.Conversations({
    userUid: parseInt(userUid, 10),
    inbox: creatingInbox,
  });

  const conversation = await conversationEntities.create({
    ...consolidatedData,
  });

  return conversation;
};

export default (core, agendaUid, eventUid) => ({
  create: (data, options) => create(core, agendaUid, eventUid, data, options),
});
