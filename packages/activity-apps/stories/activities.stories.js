import { http, HttpResponse } from 'msw';
import { ActivityItem } from '../src/client/components';
import Provider from './decorators/Provider';
import refusedEvent from './fixtures/refusedEvent.json';
import updatedEvent from './fixtures/updatedEvent.json';
import groupedMessages from './fixtures/historyGroupedMessage.json';
import config from './fixtures/config.json';

export default {
  title: 'Activities',
  decorators: [Provider],
  parameters: {
    msw: {
      handlers: [
        http.get('/activity/16663579/detail', () =>
          HttpResponse.json({
            text: 'ceci est un motif de refus: \n bla bla bla',
          })),
        http.get('/activity/17063823/detail', () =>
          HttpResponse.json({
            text: '# message pour vous\n : **Attention** [lien](openagenda.com)',
          })),
        http.get('/activity/16877416/detail', () =>
          HttpResponse.json({ diff: {} })),
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
