import { loadable } from '@openagenda/react-shared';

const UserApp = loadable(() =>
  import( /* webpackChunkName: "activities-UserActivitiesApp" */ '../../containers/UserApp/UserApp' )
);
const UserDashboard = loadable(() =>
  import( /* webpackChunkName: "activities-UserActivitiesDashboard" */ '../../containers/UserDashboard/UserDashboard' )
);

export default function (prefix = '') {
  return [
    {
      path: prefix,
      component: UserApp,
      routes: [
        { path: `${prefix}/`, exact: true, component: UserDashboard }
      ]
    }
  ];
};
