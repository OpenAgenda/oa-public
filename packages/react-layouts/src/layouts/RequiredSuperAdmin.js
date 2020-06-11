import React, { useMemo } from 'react';
import { useIsomorphicLayoutEffect } from 'react-use';
import { useHistory } from 'react-router-dom';
import ChildLayouts from '../components/ChildLayouts';
import Loading from '../components/Loading';

function RequiredSuperAdmin({
  childLayouts,
  children,
  extraProps,
  onError,
  FallbackComponent
}) {
  const history = useHistory();

  const shouldRedirect = useMemo(
    () => ![75052324, 99999999, 31046551].includes(extraProps.user?.uid),
    [extraProps.user]
  );

  useIsomorphicLayoutEffect(() => {
    if (![75052324, 99999999, 31046551].includes(extraProps.user?.uid)) {
      history.replace('/home');
    }
  }, [shouldRedirect, history, extraProps.user]);

  if (shouldRedirect) {
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
