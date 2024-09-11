import { loadable } from '@openagenda/react-shared';

const CreationApp = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaSettings-CreationApp" */ './containers/CreationApp/CreationApp'
    ),
);
const AgendaCreation = loadable(
  () =>
    import(
      /* webpackChunkName: "agendaSettings-AgendaCreation" */ './containers/AgendaCreation/AgendaCreation'
    ),
);

export default (prefix = '') => [
  {
    path: prefix,
    component: CreationApp,
    routes: [{ path: `${prefix}/`, exact: true, component: AgendaCreation }],
  },
];
