import React from 'react';
import { hoistStatics, withProps } from 'recompose';
import NotFound from '@openagenda/react-utils/dist/NotFound';
import { App, SettingsContainer } from './containers';

const withActiveTab = activeTab => hoistStatics( withProps( { activeTab } ) );

export default function ( prefix = '' ) {
  return [
    {
      component: App,
      routes: [
        { path: `${prefix}/`, exact: true, component: SettingsContainer },
        { path: `${prefix}/profile`, component: withActiveTab( 'profile' )( SettingsContainer ) },
        { path: `${prefix}/image`, component: withActiveTab( 'image' )( SettingsContainer ) },
        { path: `${prefix}/email`, component: withActiveTab( 'email' )( SettingsContainer ) },
        { path: `${prefix}/password`, component: withActiveTab( 'password' )( SettingsContainer ) },
        { path: `${prefix}/apiKey`, component: withActiveTab( 'apiKey' )( SettingsContainer ) },
        { path: `${prefix}/emails`, component: withActiveTab( 'emails' )( SettingsContainer ) },
        { component: NotFound }
      ]
    }
  ];
};
