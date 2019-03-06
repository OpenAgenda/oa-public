import React from 'react';
import { withRouter, Redirect } from 'react-router';

const NotFound = ( { staticContext, route, location } ) => {
  const locationState = location.state || {};
  const newLocationState = {
    ...locationState,
    notFound: {
      ...locationState.notFound,
      [ route.notFoundKey ]: true
    }
  };

  if ( staticContext ) {
    staticContext.status = 404;
  }

  return <Redirect to={{ state: newLocationState }} />;
};

NotFound.Capture = withRouter( ( { children, location, notFoundKey } ) => {
  return location && location.state && location.state.notFound && location.state.notFound[ notFoundKey ]
    ? null
    : children;
} );

NotFound.isNotFound = true;

export default NotFound;
