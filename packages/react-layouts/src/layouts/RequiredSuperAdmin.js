import React from 'react';
import { useHistory } from 'react-router-dom';
import ChildLayouts from '../components/ChildLayouts';
import Loading from '../components/Loading';

function RequiredSuperAdmin({
  childLayouts,
  children,
  extraProps,
  onError,
  FallbackComponent,
}) {
  const history = useHistory();

  if (
    ![75052324, 99999999, 31046551, 87101680].includes(extraProps.user?.uid)
  ) {
    history.replace('/home');

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

RequiredSuperAdmin.layoutName = 'RequiredSuperAdmin';

export default RequiredSuperAdmin;
