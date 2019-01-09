import { matchRoutes } from 'react-router-config';

function getComponents( match, propName = 'preload' ) {
  return match.map( v => v.route.component ).reduce( async ( result, component ) => {
    if ( typeof component[ propName ] === 'function' ) {
      const res = await component[ propName ]();
      const ret = [ ...(await result), component, ...(res || []) ];

      return ret;
    }

    return [ ...(await result), component ];
  }, [] );
}

function getParams( match ) {
  return match.reduce( ( result, component ) => {
    if ( component.match && component.match.params ) {
      return { ...result, ...component.match.params };
    }
    return result;
  }, {} );
}

const asyncMatchRoutes = async ( routes, pathname, propName ) => {
  const match = matchRoutes( routes, pathname );
  const params = getParams( match );
  const components = await getComponents( match, propName );

  return { components, match, params };
};

export default asyncMatchRoutes;
