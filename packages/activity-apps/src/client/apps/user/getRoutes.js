import NotFound from '@openagenda/react-utils/dist/NotFound';
import { UserApp, UserDashboard } from '../../containers';

export default function ( prefix = '', notFoundKey ) {
  return [
    {
      component: UserApp,
      routes: [
        { path: `${prefix}/`, exact: true, component: UserDashboard },
        { component: NotFound, notFoundKey }
      ]
    }
  ];
};
