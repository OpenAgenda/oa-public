import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import useChildLayouts from '../hooks/useChildLayouts';
import Loading from '../components/Loading';

function RequiredUser({
  childLayouts,
  children,
  extraProps,
  onError,
  FallbackComponent
}) {
  const history = useHistory();
  const location = useLocation();
  const getContent = useChildLayouts(
    children,
    { extraProps, onError, FallbackComponent },
    childLayouts
  );

  if (!extraProps.user) {
    const url = location.pathname + location.search;
    const base64Url = Buffer.from(url).toString('base64');

    if (typeof window === 'undefined') {
      history.replace(`/signin?redirect=${base64Url}`);
    } else {
      window.location.href = `/signin?redirect=${base64Url}`;
    }

    // Display Loading waiting redirection
    return <Loading />;
  }

  return getContent();
}

RequiredUser.layoutName = 'RequiredUser';

export default RequiredUser;
