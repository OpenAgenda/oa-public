import React from 'react';
import { wrapApp } from '@openagenda/react-shared';
import { createMemoryHistory } from 'history';
import createApp from '../../client/src';
import fixtures from '../fixtures';
import loadInitialState from './loadInitialState';

const initialState = loadInitialState();

export default function componentFromFixtures(message, agendaUid, entryRoute = '') {
  return () => (
    <>
      <p className="text-center"><strong>{message}</strong></p>
      {wrapApp(
        createApp({
          initialState,
          history: createMemoryHistory({
            initialEntries: [`/some-agenda/contribute${entryRoute}`]
          })
        }),
        {
          extraProps: fixtures(agendaUid).extraProps
        }
      )}
    </>
  );
}
