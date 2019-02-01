import React from 'react';
import { withRouter, Redirect } from 'react-router';

const NotFound = ( { staticContext = {}, route, location } ) => {
  const locationState = location.state || {};
  const newLocationState = {
    ...locationState,
    notFoundErrors: {
      ...locationState.notFoundErrors,
      [ route.notFoundkey ]: true
    }
  };

  staticContext.status = 404;

  return <Redirect to={{ state: newLocationState }} />;
};

NotFound.Capture = withRouter( ( { children, location, notFoundkey } ) => {
  return location && location.state && location.state.notFoundErrors && location.state.notFoundErrors[ notFoundkey ]
    ? null
    : children;
} );

NotFound.isNotFound = true;

export default NotFound;
