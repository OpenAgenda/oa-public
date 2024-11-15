import { loadable } from '@openagenda/react-shared';

const AgendaApp = loadable(
  () =>
    import(
      /* webpackChunkName: "activities-AgendaActivitiesApp" */ '../../containers/AgendaApp/AgendaApp.js'
    ),
);
const AgendaDashboard = loadable(
  () =>
    import(
      /* webpackChunkName: "activities-AgendaActivitiesDashboard" */ '../../containers/AgendaDashboard/AgendaDashboard.js'
    ),
);

export default (prefix = '') => [
  {
    path: prefix,
    component: AgendaApp,
    routes: [{ path: `${prefix}/`, exact: true, component: AgendaDashboard }],
  },
];
