import createApp from 'react-utils/dist/createApp';
import createStore from 'react-utils/dist/createStore';
import ApiClient from 'react-utils/dist/ApiClient';
import getRoutes from './routes';
import reducer from '../../redux/reducer';

require( 'dom-utils/ie8' );
require( 'dom-utils/ie9' );

export default function ( options ) {

  return createApp( options.state, createStore( reducer ), getRoutes, ApiClient );

};
