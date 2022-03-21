import React from 'react';
import { wrapApp } from '@openagenda/react-shared';
import '@openagenda/bs-templates/compiled/main.css';
import { createMemoryHistory } from 'history';

import createApp from '../src/app';

import AdminCanvas from './decorators/AdminCanvas';
import Providers from './decorators/Providers';
import fixtures from './fixtures';

export default {
  title: 'Integrated',
  decorators: [AdminCanvas, Providers]
};

const set = {
  title: 'Les lieux en Ardèche',
  uid: 1903810,
  agendasCount: 3,
  locationsCount: 5
};

const res = {
  index: '/api/agendas/:agendaUid/locations?detailed=1',
  getSettings: '/api/agendas/:agendaUid/locations/settings',
  get: '/api/agendas/:agendaUid/locations/:locationUid?detailed=1',
  create: '/api/agendas/:agendaUid/locations',
  update: '/api/agendas/:agendaUid/locations/:locationUid',
  merge: '/api/agendas/:agendaUid/locations/merge',
  remove: '/api/agendas/:agendaUid/locations/:locationUid',
  geocode: '/api/agendas/:agendaUid/locations/geocode',
  reverseGeocode: '/api/agendas/:agendaUid/locations/geocode/reverse',
  insee: '/api/agendas/:agendaUid/locations/insee',
  csv: '#csv',
  xlsx: '#xlsx',
  disqualifyDuplicates: '/api/agendas/:agendaUid/locations/disqualify',
  agendaSearch: '/api/agendas/:agendaUid/locations/agendas',
  seeEvents: '/api/agendas/:agendaUid/locations/:agendaSlug/admin?locationUid=:locationUid&q.locationUid=:locationUid',
  suggestChange: '/:agendaSlug/locations/:locationUid/suggest-change/conversation/create'
};

export function Admin() {
  return (
    <>
      <div
        className="col-md-3 col-md-push-5 col-sm-12"
      />
      <div className="col-md-9 col-md-pull-3 col-sm-12 wsq">
        {wrapApp(
          createApp({
            initialState: {
              settings: {
                pageSize: 20,
                message: 'Ca marche',
                apiRoot: '',
                prefix: '/:agendaSlug/admin/locations',
                staticTiles: 'https://maps.geoapify.com/v1/staticmap?style=klokantech-basic&width={w}&height={h}&center=lonlat:{lon},{lat}&zoom=14&marker=lonlat:{lon},{lat};color:%2341acdd;size:small&apiKey=9f8da49724b645f486f281abbe690750',
              },
              res,
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

export function AdminUidFilter() {
  return (
    <>
      <div
        className="col-md-3 col-md-push-5 col-sm-12"
      />
      <div className="col-md-9 col-md-pull-3 col-sm-12 wsq">
        {wrapApp(
          createApp({
            initialState: {
              settings: {
                pageSize: 20,
                message: 'Ca marche',
                apiRoot: '',
                prefix: '/:agendaSlug/admin/locations',
                staticTiles: 'https://maps.geoapify.com/v1/staticmap?style=klokantech-basic&width={w}&height={h}&center=lonlat:{lon},{lat}&zoom=14&marker=lonlat:{lon},{lat};color:%2341acdd;size:small&apiKey=9f8da49724b645f486f281abbe690750',
              },
              res
            },
            history: createMemoryHistory({
              initialEntries: ['/metropole-europeenne-de-lille/admin/locations?uids[]=29605170']
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
      <div className="col-md-9 col-md-pull-3 col-sm-12 wsq">
        {wrapApp(
          createApp({
            initialState: {
              settings: {
                pageSize: 20,
                message: 'Ca marche',
                apiRoot: '',
                prefix: '/:agendaSlug/admin/locations',
                staticTiles: 'https://maps.geoapify.com/v1/staticmap?style=klokantech-basic&width={w}&height={h}&center=lonlat:{lon},{lat}&zoom=14&marker=lonlat:{lon},{lat};color:%2341acdd;size:small&apiKey=9f8da49724b645f486f281abbe690750',
              },
              res
            },
            history: createMemoryHistory({
              initialEntries: ['/metropole-europeenne-de-lille/admin/locations/29605170']
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

export function Merge() {
  return (
    <>
      <div
        className="col-md-3 col-md-push-5 col-sm-12"
      />
      <div className="col-md-9 col-md-pull-3 col-sm-12 wsq">
        {wrapApp(
          createApp({
            initialState: {
              settings: {
                pageSize: 20,
                message: 'Ca marche',
                apiRoot: '',
                prefix: '/:agendaSlug/admin/locations',
                staticTiles: 'https://maps.geoapify.com/v1/staticmap?style=klokantech-basic&width={w}&height={h}&center=lonlat:{lon},{lat}&zoom=14&marker=lonlat:{lon},{lat};color:%2341acdd;size:small&apiKey=9f8da49724b645f486f281abbe690750',
              },
              res
            },
            history: createMemoryHistory({
              initialEntries: ['/metropole-europeenne-de-lille/admin/locations/merge']
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
      <div className="col-md-9 col-md-pull-3 col-sm-12 wsq">
        {wrapApp(
          createApp({
            initialState: {
              settings: {
                pageSize: 20,
                message: 'Ca marche',
                apiRoot: '',
                prefix: '/:agendaSlug/admin/locations',
              },
              res
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
      <div className="col-md-9 col-md-pull-3 col-sm-12 wsq">
        {wrapApp(
          createApp({
            initialState: {
              settings: {
                pageSize: 20,
                message: 'Ca marche',
                apiRoot: '',
                prefix: '/:agendaSlug/admin/locations',
              },
              res
            },
            history: createMemoryHistory({
              initialEntries: ['/metropole-europeenne-de-lille/admin/locations/29605170/edit']
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

export function AdminLocationSet() {
  return (
    <>
      <div
        className="col-md-3 col-md-push-5 col-sm-12"
      />
      <div className="col-md-9 col-md-pull-3 col-sm-12 wsq">
        {wrapApp(
          createApp({
            initialState: {
              settings: {
                pageSize: 20,
                message: 'Ca marche',
                apiRoot: '',
                prefix: '/:agendaSlug/admin/locations',
                staticTiles: 'https://maps.geoapify.com/v1/staticmap?style=klokantech-basic&width={w}&height={h}&center=lonlat:{lon},{lat}&zoom=14&marker=lonlat:{lon},{lat};color:%2341acdd;size:small&apiKey=9f8da49724b645f486f281abbe690750',
              },
              res,
              set,
            },
            history: createMemoryHistory({
              initialEntries: ['/metropole-europeenne-de-lille/admin/locations']
            }),
          }),
          {
            extraProps: fixtures(2).extraProps,
            disableScrollToTop: true
          }
        )}
      </div>
    </>
  );
}

export function AdminExternal() {
  return (
    <>
      <div
        className="col-md-3 col-md-push-5 col-sm-12"
      />
      <div className="col-md-9 col-md-pull-3 col-sm-12 wsq">
        {wrapApp(
          createApp({
            initialState: {
              settings: {
                pageSize: 20,
                message: 'Ca marche',
                apiRoot: '',
                prefix: '/:agendaSlug/admin/locations',
                staticTiles: 'https://maps.geoapify.com/v1/staticmap?style=klokantech-basic&width={w}&height={h}&center=lonlat:{lon},{lat}&zoom=14&marker=lonlat:{lon},{lat};color:%2341acdd;size:small&apiKey=9f8da49724b645f486f281abbe690750',
              },
              res,
            },
            history: createMemoryHistory({
              initialEntries: ['/metropole-europeenne-de-lille/admin/locations']
            }),
          }),
          {
            extraProps: fixtures(3).extraProps,
            disableScrollToTop: true
          }
        )}
      </div>
    </>
  );
}

export function AdminErrors() {
  return (
    <>
      <div
        className="col-md-3 col-md-push-5 col-sm-12"
      />
      <div className="col-md-9 col-md-pull-3 col-sm-12 wsq">
        {wrapApp(
          createApp({
            initialState: {
              settings: {
                pageSize: 20,
                message: 'Ca marche',
                apiRoot: '',
                prefix: '/:agendaSlug/admin/locations',
                staticTiles: 'https://maps.geoapify.com/v1/staticmap?style=klokantech-basic&width={w}&height={h}&center=lonlat:{lon},{lat}&zoom=14&marker=lonlat:{lon},{lat};color:%2341acdd;size:small&apiKey=9f8da49724b645f486f281abbe690750',
              },
              res,
            },
            history: createMemoryHistory({
              initialEntries: ['/metropole-europeenne-de-lille/admin/locations']
            }),
          }),
          {
            extraProps: fixtures(4).extraProps,
            disableScrollToTop: true
          }
        )}
      </div>
    </>
  );
}