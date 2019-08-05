import loadable from '@openagenda/react-utils/dist/loadable';

const UserApp = loadable( () =>
  import( /* webpackChunkName: "home-UserActivitiesApp" */ '../../containers/UserApp/UserApp' )
);
const UserDashboard = loadable( () =>
  import( /* webpackChunkName: "home-UserActivitiesDashboard" */ '../../containers/UserDashboard/UserDashboard' )
);

export default function ( prefix = '' ) {
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
