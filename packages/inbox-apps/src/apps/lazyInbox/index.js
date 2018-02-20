import _ from 'lodash';
import du from '@openagenda/dom-utils';
import createStore from '@openagenda/react-utils/dist/createStore';
import ApiClient from '@openagenda/react-utils/dist/ApiClient';
import createApp from '@openagenda/react-utils/dist/createApp';
import createHistory from 'history/lib/createMemoryHistory';
import getRoutes from '../../routes';
import reducer from '../../redux/reducer';

export default function renderApp( options ) {

  const params = _.merge( {
    selector: '.js_inbox_event',
    state: {
      settings: {
        prefix: '/',
        lang: 'fr',
        perPageLimit: 20
      },
      res: {
        conversations: {
          list: '/agendas/:agendaUid/events/:eventUid/conversations'
        },
        messages: {
          list: '/agendas/:agendaUid/events/:eventUid/conversations/:conversationId/messages',
          create: '/agendas/:agendaUid/events/:eventUid/conversations/:conversationId/messages'
        }
      },
      agenda: {
        //
      },
      event: {
        //
      }
    }
  }, options );

  const app = createApp( {
    state: params.state,
    createHistory,
    createStore: createStore( reducer ),
    getRoutes: _.partialRight( getRoutes, params ),
    ApiClient,
    routerScroll: false
  } );

  app.match( du.el( params.selector ) );

  return app;

};

export function expose( name ) {

  window[ name ] = renderApp;

}
