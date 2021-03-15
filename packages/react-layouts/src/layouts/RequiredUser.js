import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import ChildLayouts from '../components/ChildLayouts';
import Loading from '../components/Loading';

function RequiredUser({
  childLayouts,
  children,
  extraProps,
  onError,
  FallbackComponent,
}) {
  const history = useHistory();
  const location = useLocation();

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

  return (
    <ChildLayouts
      layouts={childLayouts}
      extraProps={extraProps}
      onError={onError}
      FallbackComponent={FallbackComponent}
    >
      {children}
    </ChildLayouts>
  );
}

RequiredUser.layoutName = 'RequiredUser';

export default RequiredUser;
