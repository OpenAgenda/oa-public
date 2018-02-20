import matchAppMw from '@openagenda/react-utils/dist/matchAppMw';
import createStore from '@openagenda/react-utils/dist/createStore';
import ApiClient from '@openagenda/react-utils/dist/ApiClient';
import reducer from './redux/reducer';
import getRoutes from './routes';

export const matchApp = matchAppMw( createStore( reducer ), getRoutes, ApiClient );
