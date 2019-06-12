import React from 'react';
import { storiesOf } from '@storybook/react';
import TimingsPicker from '../src';
import '../src/App.css';

storiesOf( 'App', module )
  .add( 'default', () => (
    <TimingsPicker />
  ) )
  .add( 'with allowed timings', () => (
    <TimingsPicker
      allowedTimings={[
        {
          begin: '2019-05-15',
          end: '2019-05-16'
        },
        {
          begin: '2019-05-17',
          end: '2019-05-24'
        }
      ]}
    />
  ) )
  .add( 'in French language', () => (
    <TimingsPicker
      allowedTimings={[
        {
          begin: '2019-05-15',
          end: '2019-05-16'
        },
        {
          begin: '2019-05-17',
          end: '2019-05-24'
        }
      ]}
      locale="fr"
    />
  ) )
  .add( 'override locales', () => (
    <TimingsPicker
      locales={{
        fr: {
          'rtp.defineTiming': 'Clique et glisse !'
        }
      }}
      locale="fr"
    />
  ) );
