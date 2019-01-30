const NotFound = ( { staticContext = {} } ) => {
  staticContext.status = 404;
  return null;
};

export default NotFound;
