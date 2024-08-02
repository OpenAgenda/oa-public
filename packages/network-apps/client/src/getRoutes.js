import Main from './containers/Main';
import getPaths from './getPaths';
import NetworkEdit from './containers/NetworkEdit';
import NetworkAgendas from './containers/NetworkAgendas';

export default (prefix = '') => {
  const paths = getPaths(prefix);
  return [
    {
      path: paths.main,
      exact: true,
      component: Main,
    },
    {
      path: paths.networkEdit,
      exact: true,
      component: NetworkEdit,
    },
    {
      path: paths.networkAgendas,
      component: NetworkAgendas,
    },
  ];
};
