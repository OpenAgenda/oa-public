import NotFound from '@openagenda/react-utils/dist/NotFound';
import { AdminApp, AdminDashboard } from '../../containers';

export default function ( prefix = '', notFoundKey ) {
  return [
    {
      component: AdminApp,
      routes: [
        { path: `${prefix}/`, exact: true, component: AdminDashboard },
        { component: NotFound, notFoundKey }
      ]
    }
  ];
};
