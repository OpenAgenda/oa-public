import { rest } from 'msw';
import { useRef } from 'react';
import { createMemoryHistory } from 'history';
import { wrapApp } from '@openagenda/react-shared';

import createApp from '../src/app';
import AdminPageDecorator from './decorators/AdminPage';
import ProvidersDecorator from './decorators/Providers';

import '@openagenda/bs-templates/compiled/main.css';
import mainData from './fixtures/new.json';
import exportSettings from './fixtures/exportSettings.json';

const getDefaultState = () => ({
  settings: {
    prefix: '',
    perPageLimit: 20,
    mapTiles: '',
  },
  res: {
    jsonExport: '/:slug/events.json',
    search: '/:slug/events/search',
  },
});

export default {
  title: 'Integrated',
};

export const Presentation = {
  render: function Render() {
    const filtersContainerRef = useRef();

    return (
      <>
        <div
          className="col-md-3 col-md-push-5 col-sm-12 wsq filters"
          ref={filtersContainerRef}
        />
        <div className="col-md-5 col-md-pull-3 col-sm-12 wsq padding-bottom-sm">
          {wrapApp(
            createApp({
              history: createMemoryHistory(),
              initialState: getDefaultState({}),
            }),
            {
              disableScrollToTop: true,
              extraProps: {
                agendaSchema: {
                  fields: [],
                },
                lang: 'fr',
                agenda: {
                  uid: 48959239,
                  slug: 'la-gargouille',
                  title: 'La gargouille',
                  credentials: {
                    aggregator: true,
                  },
                },
                filtersContainerRef,
              },
            },
          )}
        </div>
      </>
    );
  },
  parameters: {
    msw: {
      handlers: [
        rest.post('/la-gargouille/events/search', (req, res, ctx) => {
          console.log(req.body);
          return res(ctx.json(mainData));
        }),
        rest.get('/agendas/48959239/admin/settings/exports', (req, res, ctx) =>
          res(ctx.json(exportSettings))),
        rest.post('/:agendaSlug/events/:eventSlug/state', (req, res, ctx) => {
          const event = JSON.parse(
            JSON.stringify(
              mainData.events.find(e => e.slug === req.params.eventSlug),
            ),
          );
          return res(ctx.json({ ...event, ...req.body }));
        }),
      ],
    },
  },
  decorators: [AdminPageDecorator, ProvidersDecorator],
};
