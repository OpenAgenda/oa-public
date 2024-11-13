import { loadable } from '@openagenda/react-shared';

const CreationApp = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaSettings-CreationApp" */ './containers/CreationApp/CreationApp.js'
    ),
);
const AgendaCreation = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaSettings-AgendaCreation" */ './containers/AgendaCreation/AgendaCreation.js'
    ),
);

export default (prefix = '') => [
  {
    path: prefix,
    component: CreationApp,
    routes: [{ path: `${prefix}/`, exact: true, component: AgendaCreation }],
  },
];
