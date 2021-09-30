import React from 'react';
import { useSelector } from 'react-redux';
import { useLayoutData } from '@openagenda/react-shared';
import { hot } from 'react-hot-loader/root';

import Dashboard from './Dashboard';

function WrapperComponent() {
  const res = useSelector(state => state.res ?? null);

  const {
    agenda,
    filtersContainerRef: selectionMenuContainerRef
  } = useLayoutData();

  return (
    <Dashboard
      agendaUid={agenda.uid}
      selectionMenuContainerRef={selectionMenuContainerRef}
      res={res}
    />
  );
}

export default hot(WrapperComponent);
