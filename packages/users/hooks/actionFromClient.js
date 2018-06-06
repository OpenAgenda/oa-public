module.exports = function actionFromClient() {
  return context => {
    const params = context.params;

    if ( params && params.query && params.query.$client && typeof params.query.$client === 'object' ) {
      const client = params.query.$client;

      if ( 'action' in client ) {
        params.action = client.action;
        delete params.query.$client.action;
      }

      if ( Object.keys( client ).length === 0 ) {
        delete params.query.$client;
      }

      params.query = Object.assign( {}, params.query );
    }

    return context;
  }
};
