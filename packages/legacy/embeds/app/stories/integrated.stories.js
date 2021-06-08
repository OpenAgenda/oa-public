import { wrapApp } from '@openagenda/react-shared';
import React, { useRef } from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { HelmetProvider } from 'react-helmet-async';

import createApp from '../src';

import toulouseEmbed from './fixtures/toulouse.json';
import apiAgendasToulouse from './fixtures/api.agendas.toulouse.get.json';

import AdminCanvas from './decorators/AdminCanvas';

export default {
  title: 'Integrated',
  decorators: [AdminCanvas]
};

export function Integrated() {
  const mock = new MockAdapter(axios, {
    delayResponse: 1000
  });

  mock.onGet('/agendas/50522407').reply(200, apiAgendasToulouse);
  mock.onGet('/agendas/50522407/embeds').reply(
    200,
    [toulouseEmbed]
  );
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
                  legacy: '/agendas/:agendaUid/admin/webembed',
                  events: '/agendas/:agendaUid/events',
                  embeds: '/agendas/:agendaUid/embeds',
                  agendaSettings: '/agendas/:agendaUid',
                  preview: 'https://d.openagenda.com/agendas/:agendaUid/previewEmbeds/:embedUid/events',
                  previewScript: 'https://d.openagenda.com/js/embed/cibulBodyWidget.js'
                }
              }
            }),
            {
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
