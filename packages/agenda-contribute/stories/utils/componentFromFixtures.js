import React from 'react';
import { wrapApp } from '@openagenda/react-shared';
import { createMemoryHistory } from 'history';
import createApp from '../../client/src';
import fixtures from '../fixtures';
import loadInitialState from './loadInitialState';

const initialState = loadInitialState();

export default function componentFromFixtures(message, agendaUid, entryRoute = '') {
  const {
    extraProps,
    extraDevInitialState = {}
  } = fixtures(agendaUid);

  return () => (
    <>
      <p className="text-center"><strong>{message}</strong></p>
      {wrapApp(
        createApp({
          initialState: { ...initialState, ...extraDevInitialState },
          history: createMemoryHistory({
            initialEntries: [`/some-agenda/contribute${entryRoute}`]
          })
        }),
        {
          extraProps
        }
      )}
    </>
  );
}
