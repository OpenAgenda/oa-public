import React from 'react';
import { wrapApp } from '@openagenda/react-shared';
import '@openagenda/bs-templates/compiled/main.css';
import { createMemoryHistory } from 'history';

import createApp from '../src';

import AdminCanvas from './decorators/AdminCanvas';
import Providers from './decorators/Providers';
import fixtures from './fixtures';

// metropole-europeenne-de-lille/admin/locations

export default {
  title: 'Integrated',
  decorators: [AdminCanvas, Providers]
};

export function Integrated() {
  return (
    <>
      <div
        className="col-md-3 col-md-push-5 col-sm-12"
      />
      <div className="col-md-6 col-md-pull-3 col-sm-12 wsq">
        {wrapApp(
          createApp({
            initialState: {
              settings: {
                pageSize: 20,
                message: 'Ca marche',
                APIRoot: `http://localhost:${process.env.STORYBOOK_API_PORT}`,
                prefix: '/:agendaSlug/admin/locations',
              },
              res: {
                index: '/api/agendas/:agendaUid/locations?detailed=1',
                get: '/api/agendas/:agendaUid/locations/:locationUid?detailed=1',
                create: '/api/agendas/:agendaUid/locations',
                geocode: '/api/agendas/:agendaUid/locations/geocode',
                reverseGeocode: '/api/agendas/:agendaUid/locations/geocode/reverse'
              }
            },
            history: createMemoryHistory({
              initialEntries: ['/metropole-europeenne-de-lille/admin/locations?state=0&hasNull[0]=adminLevel1&hasNull[1]=adminLevel2']
            }),
          }),
          {
            extraProps: fixtures(1).extraProps,
            disableScrollToTop: true
          }
        )}
      </div>
    </>
  );
}

export function IntegratedForm() {
  return (
    <>
      <div
        className="col-md-3 col-md-push-5 col-sm-12"
      />
      <div className="col-md-6 col-md-pull-3 col-sm-12 wsq">
        {wrapApp(
          createApp({
            initialState: {
              settings: {
                pageSize: 20,
                message: 'Ca marche',
                APIRoot: `http://localhost:${process.env.STORYBOOK_API_PORT}`,
                prefix: '/:agendaSlug/admin/locations',
              },
              res: {
                index: '/api/agendas/:agendaUid/locations?detailed=1',
                get: '/api/agendas/:agendaUid/locations/:locationUid?detailed=1',
                create: '/api/agendas/:agendaUid/locations',
                geocode: '/api/agendas/:agendaUid/locations/geocode',
                reverseGeocode: '/api/agendas/:agendaUid/locations/geocode/reverse'
              }
            },
            history: createMemoryHistory({
              initialEntries: ['/metropole-europeenne-de-lille/admin/locations/create']
            }),
          }),
          {
            extraProps: fixtures(1).extraProps,
            disableScrollToTop: true
          }
        )}
      </div>
    </>
  );
}

