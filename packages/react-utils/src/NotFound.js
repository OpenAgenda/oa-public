import React from 'react';
import { Redirect } from 'react-router';

const NotFound = ( { staticContext = {} } ) => {
  staticContext.status = 404;

  return <Redirect to={{ state: { notFoundError: true } }} />;
};

export default NotFound;
