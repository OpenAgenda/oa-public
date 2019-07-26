import Main from './containers/Main';
import NetworkEdit from './containers/NetworkEdit';
import NetworkAgendas from './containers/NetworkAgendas';

export default function( prefix = '' ) {

  return [ {
    path: `${prefix}`,
    exact: true,
    component: Main
  }, {
    path: `${prefix}/networks/:uid`,
    exact: true,
    component: NetworkEdit
  }, {
    path: `${prefix}/networks/:uid/agendas`,
    component: NetworkAgendas
  } ]

}
