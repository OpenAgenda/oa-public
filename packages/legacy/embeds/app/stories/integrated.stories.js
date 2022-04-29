import { wrapApp } from '@openagenda/react-shared';
import React, { useRef } from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { HelmetProvider } from 'react-helmet-async';

import createApp from '../src';

import toulouseEmbed from './fixtures/toulouse.json';
import apiAgendasToulouse from './fixtures/api.agendas.toulouse.get.json';
import toulouseEvents from './fixtures/toulouse.events.json';
import toulouseDefaultEmbed from './fixtures/toulouse.default.json';

import AdminCanvas from './decorators/AdminCanvas';

export default {
  title: 'Integrated',
  decorators: [AdminCanvas]
};

export function IntegratedDefaultTemplates() {
  const selectionMenuRef = useRef();
  const mock = new MockAdapter(axios, {
    delayResponse: 1000
  });

  mock.onGet('/agendas/50522407').reply(200, apiAgendasToulouse);
  mock.onGet('/agendas/50522407/embeds').reply(200, [toulouseDefaultEmbed]);
  mock.onPost('/agendas/50522407/embeds').reply(200);
  mock.onGet('/agendas/50522407/events').reply(200, toulouseEvents);

  return (
    <HelmetProvider>
      <div className="col-md-3 col-md-push-5 col-sm-12" ref={selectionMenuRef} />
      <div className="col-md-5 col-md-pull-3 col-sm-12 wsq padding-bottom-sm">
        {
          wrapApp(
            createApp({
              initialState: {
                apiRoot: `http://localhost:${process.env.STORYBOOK_PORT}`,
                prefix: '',
                res: {
                  events: '/agendas/:agendaUid/events',
                  embeds: '/agendas/:agendaUid/embeds',
                  agendaSettings: '/agendas/:agendaUid',
                  preview: 'https://d.openagenda.com/agendas/:agendaUid/previewEmbeds/:embedUid/events',
                  previewScript: 'https://d.openagenda.com/js/embed/cibulBodyWidget.js'
                }
              }
            }),
            {
              disableScrollToTop: true,
              extraProps: {
                lang: 'fr',
                agenda: {
                  uid: 50522407,
                  slug: 'toulouse',
                  title: 'Métropole de Toulouse',
                },
                filtersContainerRef: selectionMenuRef
              }
            }
          )
        }
      </div>
    </HelmetProvider>
  );
}

export function IntegratedForUpdate() {
  const mock = new MockAdapter(axios, {
    delayResponse: 1000
  });

  mock.onGet('/agendas/50522407').reply(200, apiAgendasToulouse);
  mock.onGet('/agendas/50522407/embeds').reply(200, [toulouseEmbed]);
  mock.onGet('/agendas/50522407/events').reply(200, toulouseEvents);
  mock.onPost('/agendas/50522407/embeds/80717033').reply(200);

  const selectionMenuRef = useRef();

  return (
    <HelmetProvider>
      <div className="col-md-3 col-md-push-5 col-sm-12" ref={selectionMenuRef} />
      <div className="col-md-5 col-md-pull-3 col-sm-12 wsq padding-bottom-sm">
        {
          wrapApp(
            createApp({
              initialState: {
                apiRoot: `http://localhost:${process.env.STORYBOOK_PORT}`,
                prefix: '',
                res: {
                  events: '/agendas/:agendaUid/events',
                  embeds: '/agendas/:agendaUid/embeds',
                  agendaSettings: '/agendas/:agendaUid',
                  preview: 'https://d.openagenda.com/agendas/:agendaUid/previewEmbeds/:embedUid/events',
                  previewScript: 'https://d.openagenda.com/js/embed/cibulBodyWidget.js'
                }
              }
            }),
            {
              disableScrollToTop: true,
              extraProps: {
                lang: 'fr',
                agenda: {
                  uid: 50522407,
                  slug: 'toulouse',
                  title: 'Métropole de Toulouse',
                },
                filtersContainerRef: selectionMenuRef
              }
            }
          )
        }
      </div>
    </HelmetProvider>
  );
}
