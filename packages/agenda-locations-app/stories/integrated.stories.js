import React from 'react';
import { wrapApp } from '@openagenda/react-shared';
import '@openagenda/bs-templates/compiled/main.css';
import { createMemoryHistory } from 'history';

import createApp from '../src';

import AdminCanvas from './decorators/AdminCanvas';
import Providers from './decorators/Providers';
import fixtures from './fixtures';

export default {
  title: 'Integrated',
  decorators: [AdminCanvas, Providers]
};

export function Admin() {
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
                staticTiles: 'https://maps.geoapify.com/v1/staticmap?style=klokantech-basic&width={w}&height={h}&center=lonlat:{lon},{lat}&zoom=14&marker=lonlat:{lon},{lat};color:%2341acdd;size:small&apiKey=9f8da49724b645f486f281abbe690750',
              },
              res: {
                index: '/api/agendas/:agendaUid/locations?detailed=1',
                getSettings: '/api/agendas/:agendaUid/locations/settings',
                get: '/api/agendas/:agendaUid/locations/:locationUid?detailed=1',
                create: '/api/agendas/:agendaUid/locations',
                geocode: '/api/agendas/:agendaUid/locations/geocode',
                reverseGeocode: '/api/agendas/:agendaUid/locations/geocode/reverse',
                csv: '#csv',
                xlsx: '#xlsx',
              }
            },
            history: createMemoryHistory({
              initialEntries: ['/metropole-europeenne-de-lille/admin/locations?page=2&state=0&hasNull[0]=adminLevel1&hasNull[1]=adminLevel2']
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

export function DetailModal() {
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
                staticTiles: 'https://maps.geoapify.com/v1/staticmap?style=klokantech-basic&width={w}&height={h}&center=lonlat:{lon},{lat}&zoom=14&marker=lonlat:{lon},{lat};color:%2341acdd;size:small&apiKey=9f8da49724b645f486f281abbe690750',
              },
              res: {
                index: '/api/agendas/:agendaUid/locations?detailed=1',
                getSettings: '/api/agendas/:agendaUid/locations/settings',
                get: '/api/agendas/:agendaUid/locations/:locationUid?detailed=1',
                create: '/api/agendas/:agendaUid/locations',
                geocode: '/api/agendas/:agendaUid/locations/geocode',
                reverseGeocode: '/api/agendas/:agendaUid/locations/geocode/reverse',
                csv: '#csv',
                xlsx: '#xlsx',
              }
            },
            history: createMemoryHistory({
              initialEntries: ['/metropole-europeenne-de-lille/admin/locations/2']
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

export function CreateForm() {
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

export function UpdateForm() {
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
              initialEntries: ['/metropole-europeenne-de-lille/admin/locations/40/edit']
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
