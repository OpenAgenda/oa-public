import Confirmation from './containers/Confirmation';
import EventNew from './containers/EventNew';
import EventEdit from './containers/EventEdit';
import Landing from './containers/Landing';
import Member from './containers/Member';

export default function ( prefix = '' ) {
  return [
    { path: `${prefix}`, exact: true, component: Landing },
    { path: `${prefix}/member`, component: Member },
    { path: `${prefix}/event`, exact: true, component: EventNew },
    { path: `${prefix}/event/:eventUid/draft`, exact: true, component: EventNew },
    { path: `${prefix}/event/:eventUid`, component: EventEdit },
    { path: `${prefix}/confirmation`, component: Confirmation }
  ];
};
