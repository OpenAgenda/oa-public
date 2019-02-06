import React from 'react';
import { withRouter, Redirect } from 'react-router';

const NotFound = ( { staticContext, route, history, location } ) => {
  const locationState = location.state || {};
  const newLocationState = {
    ...locationState,
    notFound: {
      ...locationState.notFound,
      [ route.notFoundkey ]: true
    }
  };

  if ( staticContext ) {
    staticContext.status = 404;
  }

  return <Redirect to={{ state: newLocationState }} />;
};

NotFound.Capture = withRouter( ( { children, location, notFoundkey } ) => {
  return location && location.state && location.state.notFound && location.state.notFound[ notFoundkey ]
    ? null
    : children;
} );

NotFound.isNotFound = true;

export default NotFound;
