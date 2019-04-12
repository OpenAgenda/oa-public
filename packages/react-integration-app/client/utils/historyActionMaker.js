import { createLocation } from 'history';
import getNotFoundState from './getNotFoundState';

export default function historyActionMaker( {
  history,
  apps,
  action
} ) {
  return ( path, state ) => {
    const newLocation = createLocation(
      path,
      state,
      null,
      history.location
    );

    newLocation.state = Object.assign(
      { notFound: getNotFoundState( apps, newLocation.pathname ) },
      newLocation.state
    );

    action( newLocation );
  };
};
