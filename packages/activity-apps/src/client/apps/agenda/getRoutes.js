import { loadable } from '@openagenda/react-shared';

const AgendaApp = loadable(() =>
  import( /* webpackChunkName: "activities-AgendaActivitiesApp" */ '../../containers/AgendaApp/AgendaApp' )
);
const AgendaDashboard = loadable(() =>
  import( /* webpackChunkName: "activities-AgendaActivitiesDashboard" */ '../../containers/AgendaDashboard/AgendaDashboard' )
);


export default function (prefix = '') {
  return [
    {
      path: prefix,
      component: AgendaApp,
      routes: [
        { path: `${prefix}/`, exact: true, component: AgendaDashboard }
      ]
    }
  ];
};
