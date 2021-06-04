import React from 'react';
import { useSelector } from 'react-redux';
import { hot } from 'react-hot-loader/root';

import Dashboard from './Dashboard';

function WrapperComponent({ agendaUid, selectionMenuContainerRef }) {
  const res = useSelector(state => state.res ?? null);

  return (
    <Dashboard
      agendaUid={agendaUid}
      selectionMenuContainerRef={selectionMenuContainerRef}
      res={res}
    />
  );
}

export default hot(WrapperComponent);
