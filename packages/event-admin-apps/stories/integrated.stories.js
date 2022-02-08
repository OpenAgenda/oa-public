import { createMemoryHistory } from 'history';
import { wrapApp } from '@openagenda/react-shared';
import React, { useRef } from 'react';
import axios from 'axios';
import MockAdapter from '@openagenda/axios-mock-adapter';

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
  },
});

export default {
  title: 'Integrated',
};

export const Presentation = function Presentation() {
  const mock = new MockAdapter(axios, {
    delayResponse: 1000,
  });

  mock.onGet('/la-gargouille/events.json').reply(200, mainData);

  mock
    .onGet('/agendas/48959239/admin/settings/exports')
    .reply(200, exportSettings);

  mock
    .onPost('/:agendaSlug/events/:eventSlug/state')
    .reply(({ data, routeParams }) => {
      const parsed = JSON.parse(data);
      const event = JSON.parse(
        JSON.stringify(
          mainData.events.find(e => e.slug === routeParams.eventSlug)
        )
      );

      return [200, { ...event, ...parsed }];
    });

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
          }
        )}
      </div>
    </>
  );
};

Presentation.decorators = [AdminPageDecorator, ProvidersDecorator];
