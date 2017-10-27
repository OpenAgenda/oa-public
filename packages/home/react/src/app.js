import createApp from '@openagenda/react-utils/dist/createApp';
import createStore from '@openagenda/react-utils/dist/createStore';
import getRoutes from './routes';
import ApiClient from '@openagenda/react-utils/dist/ApiClient';
import reducer from './redux/reducer';

export default function ( options ) {

  return createApp( options.state, createStore( reducer ), getRoutes, ApiClient );

};
