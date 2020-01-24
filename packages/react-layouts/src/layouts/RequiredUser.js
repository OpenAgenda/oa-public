import React from 'react';
import useChildLayouts from '../hooks/useChildLayouts';
import Loading from '../components/Loading';

function RequiredUser({
  childLayouts,
  children,
  extraProps,
  onError,
  FallbackComponent
}) {
  const getContent = useChildLayouts(
    children,
    { extraProps, onError, FallbackComponent },
    childLayouts
  );

  if (!extraProps.user) {
    const url = window.location.pathname + window.location.search;
    const base64Url = Buffer.from(url).toString('base64');

    window.location.href = `/signin?redirect=${base64Url}`;

    // Display Loading waiting redirection
    return <Loading />;
  }

  return getContent();
}

RequiredUser.layoutName = 'RequiredUser';

export default RequiredUser;
