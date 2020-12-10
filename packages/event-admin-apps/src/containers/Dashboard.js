import _ from 'lodash';
import React from 'react';
import { hot } from 'react-hot-loader/root';
import { useSelector } from 'react-redux';
import { Spinner } from '@openagenda/react-components';

function Dashboard(/* {
  agenda,
  agendaSchema
  // ...
} */) {
  const loading = useSelector(state => _.get(state, 'events.loading', true));
  const loaded = useSelector(state => _.get(state, 'events.loaded'));

  if (loading) {
    return (
      <div className="padding-v-md" style={{ position: 'relative' }}>
        <Spinner />
      </div>
    );
  }

  if (!loaded) {
    // y'a probablement une erreur si c'est !loading && !loaded
    // TODO un truc avec les erreurs
  }

  return null;
}

export default hot(Dashboard);
