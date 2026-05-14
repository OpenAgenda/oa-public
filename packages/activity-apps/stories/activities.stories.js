import { http, HttpResponse } from 'msw';
import { ActivityItem } from '../src/client/components/index.js';
import Provider from './decorators/Provider.js';
import refusedEvent from './fixtures/refusedEvent.json' with { type: 'json' };
import updatedEvent from './fixtures/updatedEvent.json' with { type: 'json' };
import groupedMessages from './fixtures/historyGroupedMessage.json' with { type: 'json' };
import config from './fixtures/config.json' with { type: 'json' };

export default {
  title: 'Activities',
  decorators: [Provider],
  parameters: {
    msw: {
      handlers: [
        http.get('/activities/16663579', () =>
          HttpResponse.json({
            detail: JSON.stringify({
              text: 'ceci est un motif de refus: \n bla bla bla',
            }),
          })),
        http.get('/activities/17063823', () =>
          HttpResponse.json({
            detail: JSON.stringify({
              text: '# message pour vous\n : **Attention** [lien](openagenda.com)',
            }),
          })),
        http.get('/activities16877416', () => HttpResponse.json({ diff: {} })),
      ],
    },
  },
};

export const Refused = () => (
  <ul>
    <li>
      <ActivityItem activity={refusedEvent} config={config} />
    </li>
    <li>
      <ActivityItem
        activity={{ ...refusedEvent, detail: false }}
        config={config}
      />
    </li>
  </ul>
);

export const Updated = () => (
  <ActivityItem activity={updatedEvent} config={config} />
);

export const GroupedMessages = () => (
  <ActivityItem activity={groupedMessages.activities[0]} config={config} />
);
