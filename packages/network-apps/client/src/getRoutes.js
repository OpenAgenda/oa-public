import Main from './containers/Main.js';
import getPaths from './getPaths.js';
import NetworkEdit from './containers/NetworkEdit.js';
import NetworkAgendas from './containers/NetworkAgendas.js';

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
