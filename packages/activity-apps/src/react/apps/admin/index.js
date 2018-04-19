import createApp from '@openagenda/react-utils/dist/createApp';
import createStore from '@openagenda/react-utils/dist/createStore';
import ApiClient from '@openagenda/react-utils/dist/ApiClient';
import getRoutes from './routes';
import reducer from '../../redux/reducer';

export default function ( options ) {

  return createApp( options.state, createStore( reducer ), getRoutes, ApiClient );

};
