import _ from 'lodash';
import { matchRoutes } from '@openagenda/react-utils/dist/asyncMatchRoutes';
import { createLocation } from 'history';
import getNotFoundState from './getNotFoundState';

export default function historyActionMaker( {
  history,
  apps
} ) {
  return action => ( path, state ) => {
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

    const componentsPerApps = Object.values( apps )
      .map( app => app.routes && matchRoutes( app.routes, newLocation.pathname ).map( v => v.route.component ) )

    const { visibleApps/* , notFoundApps */ } = Object.values( apps )
      .reduce( ( result, app, key ) => {
        if ( componentsPerApps[ key ].some( v => (v && v.isNotFound) ) ) {
          result.notFoundApps.push( app );
        } else {
          result.visibleApps.push( app );
        }

        return result;
      }, { visibleApps: [], notFoundApps: [] } );

    if ( !_.isEqual( newLocation.state, history.location.state ) ) {
      Promise.all(
        visibleApps.map( app => app.triggerHooks( { pathname: newLocation.pathname, hooks: [ 'inject' ] } ) )
      ).then( () => {
        action( newLocation );
      } )
    } else {
      action( newLocation );
    }
  };
};
