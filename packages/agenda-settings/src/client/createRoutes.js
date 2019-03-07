import NotFound from '@openagenda/react-utils/dist/NotFound';
import { CreationApp, AgendaCreation } from './containers';

export default function ( prefix = '', notFoundKey = 'agendaSettingsCreate' ) {
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
