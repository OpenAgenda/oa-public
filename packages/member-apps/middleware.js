const logger = require( 'basic-logger' );

const matchAppMw = require( 'react-utils/dist/matchAppMw' );
const createStore = require( 'react-utils/dist/createStore' );
const ApiClient = require( 'react-utils/dist/ApiClient' );

const getRoutes = require( './react/dist/routes' );
const reducer = require( './react/dist/redux/reducer' );

module.exports = {
  matchApp: matchAppMw( createStore( reducer ), getRoutes, ApiClient )
};
