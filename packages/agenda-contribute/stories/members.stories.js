import React, { useState } from 'react';
import axios from 'axios';
import MockAdapter from '@openagenda/axios-mock-adapter';
import { wrapApp } from '@openagenda/react-shared';
import { createMemoryHistory } from 'history';
import '@openagenda/bs-templates/compiled/main.css';
import createApp from '../client/src';
import ProvidersDecorator from './decorators/Providers';

import adminMemberData from './fixtures/administrator.json';
import contributorMemberData from './fixtures/contributor.json';

const res = {
  member: '/api/me/agendas/:agendaUid',
  requestContribute: '/:agendaSlug/request-contribute/conversation/create/thiswillbreakthestorybook'
};

export default {
  title: 'Member step',
  decorators: [ProvidersDecorator]
};

export const NonMemberOnMembersOnly = () => {
  const mock = new MockAdapter(axios);

  mock.onGet(res.member).reply(200, null);

  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <p className="text-center">Agenda is restricted to members and user is not a member yet. He is redirected to a conversation form to request to become member. Expect a 404 to appear in the storybook</p>
      <div className="text-center">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsLoaded(true)}
        >
          Load app
        </button>
      </div>
      {isLoaded ? wrapApp(
        createApp({
          initialState: {
            apiRoot: `http://localhost:${process.env.STORYBOOK_PORT}`,
            prefix: '/:agendaSlug/contribute',
            res
          },
          history: createMemoryHistory({
            initialEntries: ['/some-agenda/contribute']
          })
        }),
        {
          extraProps: {
            lang: 'fr',
            agenda: {
              uid: 16904082,
              slug: 'mdb',
              title: 'Mieux se Déplacer à Bicyclette',
              description: 'MDB a pour but de développer l’usage de la bicyclette tant pour les déplacements que pour les loisirs en Île-de-France.',
              url: 'http://www.mdb-idf.org',
              settings: {
                contribution: {
                  type: 2
                }
              }
            }
          }
        }
      ) : null}
    </>
  );
};

export const ClosedAgendaForContributor = () => {
  const mock = new MockAdapter(axios);

  mock.onGet(res.member).reply(200, contributorMemberData);

  return (
    <>
      <p className="text-center">Agenda is closed to contributions. Contributor is faced with a message indicating he cannot contribute</p>
      {wrapApp(
        createApp({
          initialState: {
            apiRoot: `http://localhost:${process.env.STORYBOOK_PORT}`,
            prefix: '/:agendaSlug/contribute',
            res
          },
          history: createMemoryHistory({
            initialEntries: ['/some-agenda/contribute']
          })
        }),
        {
          extraProps: {
            lang: 'fr',
            agenda: {
              uid: 16904082,
              title: 'Mieux se Déplacer à Bicyclette',
              description: 'MDB a pour but de développer l’usage de la bicyclette tant pour les déplacements que pour les loisirs en Île-de-France.',
              url: 'http://www.mdb-idf.org',
              settings: {
                contribution: {
                  type: 0
                }
              }
            }
          }
        }
      )}
    </>
  );
};
