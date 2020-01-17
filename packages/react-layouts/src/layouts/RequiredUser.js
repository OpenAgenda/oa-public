import React from 'react';
import Spinner from '@openagenda/react-components/build/Spinner';
import useChildLayouts from '../hooks/useChildLayouts';

const Loading = () => (
  <div
    className="text-center margin-top-lg"
    style={{
      minHeight: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <Spinner
      mode="inline"
      options={{
        scale: 1,
        width: 1
      }}
    />
  </div>
);

function RequiredUser({
  childLayouts,
  children,
  extraProps,
  onError,
  FallbackComponent
}) {
  const content = useChildLayouts(
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

  return content;
}

RequiredUser.layoutName = 'RequiredUser';

export default RequiredUser;
