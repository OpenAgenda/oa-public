import React from 'react';
import { wrapApp } from '@openagenda/react-shared';
import '@openagenda/bs-templates/compiled/main.css';
import { createMemoryHistory } from 'history';

import createApp from '../src/app';

import AdminCanvas from './decorators/AdminCanvas';
import Providers from './decorators/Providers';

export default {
  title: 'Integrated',
  decorators: [AdminCanvas, Providers],
};

const res = {
  eventSchema: '/api/agendas/:agendaUid/settings/eventSchema',
  memberSchema: '/api/agendas/:agendaUid/settings/memberSchema',
};

export function AdminWithoutPremium() {
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
                prefix: '/:agendaSlug/admin/schema',
                apiRoot: '',
              },
              res,
            },
            history: createMemoryHistory({
              initialEntries: ['/metropole-europeenne-de-lille/admin/schema'],
            }),
          }),
          {
            extraProps: {
              lang: 'fr',
              agenda: {
                uid: 1,
                slug: 'metropole-europeenne-de-lille',
                credentials: {
                  premiumCustomFields: false,
                },
              },
            },
          },
        )}
      </div>
    </>
  );
}

export function AdminWithPremium() {
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
                prefix: '/:agendaSlug/admin/schema',
                apiRoot: '',
              },
              res,
            },
            history: createMemoryHistory({
              initialEntries: ['/metropole-europeenne-de-lille/admin/schema'],
            }),
          }),
          {
            extraProps: {
              lang: 'fr',
              agenda: {
                uid: 1,
                slug: 'metropole-europeenne-de-lille',
                credentials: {
                  premiumCustomFields: true,
                },
              },
            },
          },
        )}
      </div>
    </>
  );
}

export function AdminWithMember() {
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
                prefix: '/:agendaSlug/admin/schema',
                apiRoot: '',
              },
              res,
            },
            history: createMemoryHistory({
              initialEntries: ['/metropole-europeenne-de-lille/admin/schema?member'],
            }),
          }),
          {
            extraProps: {
              lang: 'fr',
              agenda: {
                uid: 1,
                slug: 'metropole-europeenne-de-lille',
                credentials: {
                  premiumCustomFields: true,
                },
              },
            },
          },
        )}
      </div>
    </>
  );
}