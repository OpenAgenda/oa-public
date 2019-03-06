import { matchRoutes } from '@openagenda/react-utils/dist/asyncMatchRoutes';

export default function getNotFoundState( apps, pathname ) {
  const componentsPerApps = Object.values( apps )
    .map( app => app.routes && matchRoutes( app.routes, pathname ).map( v => v.route.component ) );

  return Object.values( apps )
    .reduce( ( result, app, key ) => {
      if ( componentsPerApps[ key ].some( v => (v && v.isNotFound) ) ) {
        return {
          ...result,
          [ app.notFoundKey ]: true
        };
      }

      return result;
    }, {} );
}
