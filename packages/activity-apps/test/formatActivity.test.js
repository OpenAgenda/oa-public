import _ from 'lodash';
import { createIntl } from '@formatjs/intl';
import { getLocaleValue } from '@openagenda/intl';
import createActivityFormatter from '../src/client/utils/formatActivity';

describe('activities - formatActivity', () => {
  it('format a simple activity', () => {
    const intl = createIntl({
      locale: 'fr',
      messages: {
        hasTakenACoffee: 'Il a commandé un café !',
      },
    });

    const formatActivity = createActivityFormatter({
      intl,
      activities: {
        takeCoffee: {
          labelId: 'hasTakenACoffee',
        },
      },
    });

    expect(formatActivity({ verb: 'takeCoffee' })).toBe('Il a commandé un café !');
  });

  it('format an activity with entities', () => {
    const intl = createIntl({
      locale: 'fr',
      messages: {
        hasTakenACoffee: '{user} a commandé un café !',
      },
    });

    const formatActivity = createActivityFormatter({
      intl,
      activities: {
        takeCoffee: {
          labelId: 'hasTakenACoffee',
          entities: {
            user: 'store.labels.user',
          },
        },
      },
    });

    expect(formatActivity({
      verb: 'takeCoffee',
      store: {
        labels: {
          user: 'Kévin',
        },
      },
    })).toBe('Kévin a commandé un café !');
  });

  it('format an activity with tags', () => {
    const intl = createIntl({
      locale: 'fr',
      messages: {
        'activities.eventUpdateFull': '<user>{userName}</user> a mis à jour <event>{eventName}</event> sur <agenda>{agendaName}</agenda>',
        'activities.eventUpdateActor': '<user>{userName}</user> a mis à jour <event>{eventName}</event>',
        'activities.eventUpdateTarget': '<event>{eventName}</event> a été mis à jour sur <agenda>{agendaName}</agenda>',
      },
    });

    const formatActivity = createActivityFormatter({
      intl,
      activities: {
        eventUpdate: {
          labelIds: [
            ['activities.eventUpdateFull', ['actor', 'target']], // user + agenda
            ['activities.eventUpdateActor', ['actor']], // user
            ['activities.eventUpdateTarget', ['target']] // agenda
          ],
          entities: {
            userUid: 'actor.uid',
            eventUid: 'object.uid',
            agendaUid: 'target.uid',
            userName: 'store.labels.actor',
            eventName: 'store.labels.object',
            agendaName: 'store.labels.target',
          },
          tags: {
            user: {
              highlight: true,
              filter: 'actor',
            },
            event: {
              link: '/agendas/:agendaUid/events/:eventUid',
              filter: 'object',
            },
            agenda: {
              link: '/agendas/:agendaUid',
              filter: 'target',
            },
          },
        },
      },
      renderTag: ({ chunks/* , tagName */, activity/* , intl, entities*/, link, highlight, filter }) => {
        let result = chunks.join('');

        if (filter) {
          result += `<i
            class="fa fa-filter"
            aria-hidden="true"
            data-filterlabel="${_.escape(getLocaleValue(activity.store.labels[filter]))}"
            data-filtertype="${_.escape(filter)}"
            data-filtervalue="${_.escape(activity[filter])}"></i>`
            .replace(/\n^\s{10,12}(.*)$/mg, ' $1');
        }

        if (link) {
          result = `<a href="${link}">${result}</a>`;
        }

        if (highlight) {
          result = `<span class="activity-highlight">${result}</span>`;
        }

        return result;
      },
    });

    expect(formatActivity({
      verb: 'eventUpdate',
      actor: 'user:123456',
      target: 'agenda:456789',
      object: 'event:654321',
      store: {
        labels: {
          actor: 'Kévin',
          object: { fr: 'Un événement', en: 'An event' },
          target: { fr: 'Un agenda', en: 'An agenda' },
        },
      },
    })).toBe('<span class="activity-highlight">Kévin<i class="fa fa-filter" aria-hidden="true" data-filterlabel="Kévin" data-filtertype="actor" data-filtervalue="user:123456"></i></span> a mis à jour <a href="/agendas/456789/events/654321">Un événement<i class="fa fa-filter" aria-hidden="true" data-filterlabel="An event" data-filtertype="object" data-filtervalue="event:654321"></i></a> sur <a href="/agendas/456789">Un agenda<i class="fa fa-filter" aria-hidden="true" data-filterlabel="An agenda" data-filtertype="target" data-filtervalue="agenda:456789"></i></a>');
  });
});
