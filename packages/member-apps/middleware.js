const matchAppMw = require( '@openagenda/react-utils/dist/matchAppMw' );
const createStore = require( '@openagenda/react-utils/dist/createStore' );
const ApiClient = require( '@openagenda/react-utils/dist/ApiClient' );

const getRoutes = require( './react/dist/routes' );
const reducer = require( './react/dist/redux/reducer' );

module.exports = {
  matchApp: matchAppMw( createStore( reducer ), getRoutes, ApiClient )
};
