import React from 'react';
import { configure, addDecorator } from '@storybook/react';
import { withOptions } from '@storybook/addon-options';
import { checkA11y } from '@storybook/addon-a11y';

function importAll( req ) {
  req.keys()
    .forEach( filename => req( filename ) );
}

function loadStories() {
  importAll( require.context( './stories', true, /\.stories\.js$/ ) );
}

if ( process.env.NODE_ENV === 'development' ) {
  // eslint-disable-next-line global-require
  const { whyDidYouUpdate } = require( 'why-did-you-update' );
  whyDidYouUpdate( React );
}

addDecorator( checkA11y );

addDecorator(
  withOptions( {
    selectedAddonPanel: 'storybook/stories/stories-panel'
  } )
);

configure( loadStories, module );
