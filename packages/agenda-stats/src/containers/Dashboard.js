import React from //   useMemo,
//   useState,
//   useEffect,
//   useRef
  'react';
import { hot } from 'react-hot-loader/root';
// import { useHistory, useParams } from 'react-router-dom';
// import { defineMessages, useIntl } from 'react-intl';
// import { useSelector, useDispatch } from 'react-redux';
// import qs from 'qs';
// import { css } from '@emotion/core';
// import Spinner from '@openagenda/react-components/build/Spinner';
// import useApiClient from '@openagenda/react-utils/dist/useApiClient';

// const messages = defineMessages({});

function Dashboard(/* {
  agenda,
  agendaSchema
} */) {
  // const history = useHistory();
  // const params = useParams();
  // const query = useMemo(
  //   () => qs.parse(history.location.search, { ignoreQueryPrefix: true }),
  //   [history.location.search]
  // );

  // const intl = useIntl();
  // const dispatch = useDispatch();
  // const apiClient = useApiClient();

  // const res = useSelector(state => state.res);

  // const initialQuery = useRef(query);

  // useEffect(() => {
  //   dispatch(sourcesActions.load(params.slug, initialQuery.current));
  //   dispatch(sourcesActions.loadAggregator(params.slug));
  // }, [dispatch, params.slug]);

  // if (loading) {
  //   return (
  //     <div className="padding-v-md" style={{ position: 'relative' }}>
  //       <Spinner />
  //     </div>
  //   );
  // }

  return <div>ICI</div>;
}

export default hot(Dashboard);
