import _ from 'lodash';
import React, { Component } from 'react';
import { Route, Link, generatePath } from 'react-router-dom';

import getRoutes from '../getRoutes';

export default props => <ol className="margin-v-z breadcrumb">{
  extractCrumbs(
    getRoutes( props.config.base ).map( r => r.path ),
    props.match
  ).map( crumb => <Crumb key={crumb.pattern} {...props} {...crumb} /> )
}</ol>

const Crumb = props => {

  const { path, pattern, exact } = props;
  const { base } = props.config;

  return <li className={exact ? 'active' : null}><Link to={path}>{_.get( _.mapKeys( {
    '' : 'Réseaux',
    '/networks/:uid' : _.get( props, 'network.network.title' ),
    '/networks/:uid/agendas' : 'Agendas'
  }, ( v, k ) => base + k ), pattern, 'Là il faut dire quelque chose.' )}</Link></li>

}

function extractCrumbs( routePatterns, match ) {

  const parts = match.path.split( '/' );

  return parts
    .reduce( ( crumbPaths, part, index ) => crumbPaths.concat(
      parts.filter( ( p, i ) => i <= index ).join( '/' )
    ), [] )
    .filter( pattern => routePatterns.indexOf( pattern ) !== -1 )
    .map( pattern => ( {
      path: generatePath( pattern, match.params ),
      pattern,
      exact: match.path === pattern
    } ) );

}
