import Main from './containers/Main';
import NetworkEdit from './containers/NetworkEdit';
import NetworkAgendas from './containers/NetworkAgendas';

export default function(prefix = '') {
  const prefixWithSlash = prefix.match(/\/$/) ? prefix : prefix + '/';
  return [{
    path: prefixWithSlash,
    exact: true,
    component: Main
  }, {
    path: `${prefixWithSlash}networks/:uid`,
    exact: true,
    component: NetworkEdit
  }, {
    path: `${prefixWithSlash}networks/:uid/agendas`,
    component: NetworkAgendas
  }]

}
