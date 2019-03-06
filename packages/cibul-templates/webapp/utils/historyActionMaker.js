import _ from 'lodash';
import asyncMatchRoutes, { matchRoutes } from '@openagenda/react-utils/dist/asyncMatchRoutes';
import { createLocation } from 'history';
import getNotFoundState from './getNotFoundState';

export default function historyActionMaker( {
  history,
  apps,
  onLocationChangeStart,
  onLocationChangeFinish
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

    const { visibleApps, notFoundApps } = Object.values( apps )
      .reduce( ( result, app, key ) => {
        if ( componentsPerApps[ key ].some( v => (v && v.isNotFound) ) ) {
          result.notFoundApps.push( app );
        } else {
          result.visibleApps.push( app );
        }

        return result;
      }, { visibleApps: [], notFoundApps: [] } );

    const someNotReady = Object.values( apps ).some( ( app, key ) => {
      if ( notFoundApps.includes( app ) ) {
        return false;
      }

      return componentsPerApps[ key ].some( v => (!v || (typeof v.isReady === 'function' && !v.isReady())) );
    } );

    const needToPreload = someNotReady && !_.isEqual( newLocation.state, history.location.state );

    if ( needToPreload ) {
      if ( typeof onLocationChangeStart === 'function' ) {
        onLocationChangeStart();
      }

      Promise.all( visibleApps.map( app => asyncMatchRoutes( app.routes, newLocation.pathname ) ) )
        .then( matchResults => {
          action( newLocation );

          if ( matchResults.every( ( { components } ) => !components.some( v => v[ '@@redial-hooks' ] ) ) ) {
            if ( typeof onLocationChangeFinish === 'function' ) {
              onLocationChangeFinish();
            }
          }
        } );
    } else {
      action( newLocation );
    }
  };
};
