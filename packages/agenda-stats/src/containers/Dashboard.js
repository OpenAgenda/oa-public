import _ from 'lodash';
import React, { useMemo, useEffect, useRef } from 'react';
import { hot } from 'react-hot-loader/root';
import { useHistory } from 'react-router-dom';
// import { defineMessages, useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import qs from 'qs';
// import { css } from '@emotion/core';
import Spinner from '@openagenda/react-components/build/Spinner';
// import useApiClient from '@openagenda/react-utils/dist/useApiClient';
import * as statsActions from '../reducers/stats';
import OriginAgendasChart from '../components/OriginAgendasChart';

// const messages = defineMessages({});

function Dashboard({ user, agenda }) {
  const history = useHistory();
  const query = useMemo(
    () => qs.parse(history.location.search, { ignoreQueryPrefix: true }),
    [history.location.search]
  );

  // const intl = useIntl();
  const dispatch = useDispatch();
  // const apiClient = useApiClient();

  const loading = useSelector(state => _.get(state, 'stats.loading', true));
  // const loaded = useSelector(state => _.get(state, 'stats.loaded'));
  const aggregations = useSelector(state => state.stats.data);

  const initialQuery = useRef(query);

  useEffect(() => {
    dispatch(statsActions.load(user, agenda, initialQuery.current));
  }, [dispatch, user, agenda]);

  if (loading) {
    return (
      <div className="padding-v-md" css={{ position: 'relative' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      {aggregations.originAgendas?.length ? (
        <OriginAgendasChart data={aggregations.originAgendas} />
      ) : null}

      <pre>{JSON.stringify(Object.keys(aggregations), null, 2)}</pre>
      <pre>{JSON.stringify(aggregations.originAgendas, null, 2)}</pre>
    </div>
  );
}

export default hot(Dashboard);
