import { createMemoryHistory } from 'history';
import { wrapApp } from '@openagenda/react-shared';
import React, { useRef } from 'react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import createApp from '../src/app';
import AdminPageDecorator from './decorators/AdminPage';
import ProvidersDecorator from './decorators/Providers';

import '@openagenda/bs-templates/compiled/main.css';
import mainData from './fixtures/new.json';

const getDefaultState = ({ lang = 'fr', apiRoot = '' } = {}) => ({
  settings: {
    lang,
    apiRoot,
    prefix: '',
    perPageLimit: 20,
    mapTiles:
      'https://maps.geoapify.com/v1/tile/klokantech-basic/{z}/{x}/{y}@2x.png?apiKey=9f8da49724b645f486f281abbe690750',
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
