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
  .add( 'with defined value', () => (
    <TimingsPicker
      value={[
        {
          begin: new Date( '2019-08-10T19:30' ),
          end: new Date( '2019-08-10T22:30' )
        }
      ]}
      locale="fr"
    />
  ) )
  .add( 'with scroll focused on value', () => (
    <TimingsPicker
      value={[
        {
          begin: new Date( '2019-08-10T04:30' ),
          end: new Date( '2019-08-10T22:30' )
        }
      ]}
      locale="fr"
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
