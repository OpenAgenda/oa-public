import React from 'react';
import { wrapApp } from '@openagenda/react-shared';
import { createMemoryHistory } from 'history';
import createApp from '../../src';
import fixtures from '../fixtures';
import loadInitialState from './loadInitialState';

export default function componentFromFixtures(message, agendaUid, entryRoute = '') {
  const initialState = loadInitialState();

  const {
    extraProps,
    extraDevInitialState = {},
    agenda
  } = fixtures(agendaUid);


  const history = createMemoryHistory({
    initialEntries: [`/${agenda.slug}/contribute${entryRoute}`]
  });

  return () => (
    <>
      <p className="text-center"><strong>{message}</strong></p>
      {wrapApp(
        createApp({
          initialState: { ...initialState, ...extraDevInitialState },
          history
        }),
        {
          extraProps
        }
      )}
    </>
  );
}
