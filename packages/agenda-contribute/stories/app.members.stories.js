import React, { useState } from 'react';
import axios from 'axios';
import MockAdapter from '@openagenda/axios-mock-adapter';
import { wrapApp } from '@openagenda/react-shared';
import { createMemoryHistory } from 'history';
import '@openagenda/bs-templates/compiled/main.css';
import createApp from '../client/src';
import ProvidersDecorator from './decorators/Providers';

import incompleteAdminMemberData from './fixtures/administrator.incomplete.json';
import contributorMemberData from './fixtures/contributor.json';
import completeContributorData from './fixtures/complete.contributor.json';
import mdb from './fixtures/mdb.agenda.json';
import mdbDetailed from './fixtures/mdb.detailed.agenda.json';

const res = {
  member: '/api/me/agendas/:agendaUid',
  requestContribute: '/:agendaSlug/request-contribute/conversation/create/thiswillbreakthestorybook',
  detailedSchema: '/api/agendas/:agendaUid', // ?detailed=1&includeNonDataFields=1',
  locations: {
    get: '/locations/:uid.json',
    index: '/agendas/:agendaUid/locations.json?sample=1',
    create: '/agendas/:agendaUid/locations',
    geocode: '/locations/geocode',
    reverse: '/locations/geocode/reverse',
    insee: '/locations/insee',
    default: '/agendas/:agendaUid/locations',
  },
  references: '/api/agendas/:agendaUid/events',
  suggestions: '/agendas/:agendaUid/events/suggestions',
  suggestChangeRes: '/:agendaSlug/admin/events/:eventSlug/contact'
};

const memberFreshness = new Date();
memberFreshness.setMonth(memberFreshness.getMonth() - 6);

export default {
  title: 'App - Member evaluation',
  decorators: [ProvidersDecorator]
};

export const MemberIsAdminModAndDataIsIncomplete = () => {
  const mock = new MockAdapter(axios);

  mock.onGet(res.member).reply(200, incompleteAdminMemberData);
  mock.onGet(res.detailedSchema.split('?').shift()).reply(200, mdbDetailed);

  return (
    <>
      <strong className="text-center">User is AdminMod and member data is incomplete. Event form is presented anyways.</strong>
      {wrapApp(
        createApp({
          initialState: {
            apiRoot: `http://localhost:${process.env.STORYBOOK_PORT}`,
            prefix: '/:agendaSlug/contribute',
            res,
            memberFreshness,
            files: {
              maxSize: 200000000,
              store: { type: 's3', bucket: 'oadev' }
            },
            tiles: 'https://map.tiles'
          },
          history: createMemoryHistory({
            initialEntries: ['/some-agenda/contribute']
          })
        }),
        {
          extraProps: {
            lang: 'fr',
            agenda: mdb
          }
        }
      )}
    </>
  );
};

export const MemberIsContributorAndDataIsCompleteAndFresh = () => {
  const mock = new MockAdapter(axios);

  const completeFreshContributorData = {
    ...completeContributorData,
    updatedAt: new Date()
  };

  mock.onGet(res.member).reply(200, completeFreshContributorData);
  mock.onGet(res.detailedSchema.split('?').shift()).reply(200, mdbDetailed);

  return (
    <>
      <strong className="text-center">Agenda is open, contributor data is complete and fresh. Event form is presented. User can go back to the first step by clicking on it.</strong>
      {wrapApp(
        createApp({
          initialState: {
            apiRoot: `http://localhost:${process.env.STORYBOOK_PORT}`,
            prefix: '/:agendaSlug/contribute',
            res,
            memberFreshness,
            files: {
              maxSize: 200000000,
              store: { type: 's3', bucket: 'oadev' }
            },
            tiles: 'https://map.tiles'
          },
          history: createMemoryHistory({
            initialEntries: ['/some-agenda/contribute']
          })
        }),
        {
          extraProps: {
            lang: 'fr',
            agenda: mdb
          }
        }
      )}
    </>
  );
};

export const MemberIsContributorAndDataIsCompleteButIsOld = () => {
  const mock = new MockAdapter(axios);

  mock.onGet(res.member).reply(200, completeContributorData);

  return (
    <>
      <p className="text-center">Agenda is open, contributor data is complete but has not been refreshed recently. User is redirected to the member step.</p>
      {wrapApp(
        createApp({
          initialState: {
            apiRoot: `http://localhost:${process.env.STORYBOOK_PORT}`,
            prefix: '/:agendaSlug/contribute',
            res,
            memberFreshness
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
                  type: 1,
                  useFields: true
                }
              }
            }
          }
        }
      )}
    </>
  );
};

export const MemberDataRequiredAndContributorIsIncomplete = () => {
  const mock = new MockAdapter(axios);

  const freshContributorData = {
    ...contributorMemberData,
    updatedAt: new Date()
  };

  mock.onGet(res.member).reply(200, freshContributorData);

  return (
    <>
      <p className="text-center">Agenda is open but requires member data. User is a contributor with an incomplete form. He is shown the member form.</p>
      {wrapApp(
        createApp({
          initialState: {
            apiRoot: `http://localhost:${process.env.STORYBOOK_PORT}`,
            prefix: '/:agendaSlug/contribute',
            res,
            memberFreshness
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
                  type: 1,
                  useFields: true
                }
              }
            }
          }
        }
      )}
    </>
  );
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

export const ClosedAgendaForAdminMods = () => {
  const mock = new MockAdapter(axios);

  mock.onGet(res.member).reply(200, incompleteAdminMemberData);
  mock.onGet(res.detailedSchema.split('?').shift()).reply(200, mdbDetailed);

  return (
    <>
      <strong className="text-center">Agenda is closed to contributions. AdminMod can access form but is notified of the closed state</strong>
      {wrapApp(
        createApp({
          initialState: {
            apiRoot: `http://localhost:${process.env.STORYBOOK_PORT}`,
            prefix: '/:agendaSlug/contribute',
            res,
            memberFreshness,
            files: {
              maxSize: 200000000,
              store: { type: 's3', bucket: 'oadev' }
            },
            tiles: 'https://map.tiles'
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
            res,
            memberFreshness,
            files: {
              maxSize: 200000000,
              store: { type: 's3', bucket: 'oadev' }
            },
            tiles: 'https://map.tiles'
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
