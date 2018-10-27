import React from 'react';
import { storiesOf } from '@storybook/react';
import Spinner from '../components/Spinner';
import Decorator from './helpers/Decorator';

import '@openagenda/bs-templates/compiled/main.css';

storiesOf( 'Spinner', module )
  .addDecorator( Decorator )
  .add( 'Inline', () => (

    <Spinner mode="inline" message="this is an inline spinner" />

  ) )
  .add( 'Centered', () => (

    <Spinner />

  ) )
  .add( 'With message', () => (

      <Spinner message="Look ma', I'm spinning! Weeee!" />

  ) )
  .add( 'Page', () => (

    <Spinner page={true} message="this will close soon" />

  ) );
