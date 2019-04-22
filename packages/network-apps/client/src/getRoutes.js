import Main from './containers/Main';
import NetworkEdit from './containers/NetworkEdit';

export default function( prefix = '' ) {

  return [ {
    path: `${prefix}`,
    exact: true,
    component: Main
  }, {
    path: `${prefix}/networks/:uid`,
    component: NetworkEdit
  } ]

}
