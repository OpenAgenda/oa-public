import NotFound from '@openagenda/react-utils/dist/NotFound';
import loadable from './loadable';

const CreationApp = loadable( () =>
  import( /* webpackChunkName: "agendaSettings-CreationApp" */ './containers/CreationApp/CreationApp' )
);
const AgendaCreation = loadable( () =>
  import( /* webpackChunkName: "agendaSettings-AgendaCreation" */ './containers/AgendaCreation/AgendaCreation' )
);

export default function ( prefix = '', notFoundKey = 'agendaSettingsNew' ) {
  return [
    {
      component: CreationApp,
      routes: [
        { path: `${prefix}/`, exact: true, component: AgendaCreation },
        { component: NotFound, notFoundKey }
      ]
    }
  ];
}
