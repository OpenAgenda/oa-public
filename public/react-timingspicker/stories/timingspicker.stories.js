import React from 'react';
import { storiesOf } from '@storybook/react';
import TimingsPicker from '../src';

import 'react-day-picker/lib/style.css';
import '../src/App.css';

storiesOf('App', module)
  .add('default', () => <TimingsPicker />)
  .add('with allowed timings', () => (
    <TimingsPicker
      allowedTimings={[
        {
          begin: '2019-05-15',
          end: '2019-05-16',
        },
        {
          begin: '2019-05-17',
          end: '2019-05-24',
        },
      ]}
    />
  ))
  .add('with defined value', () => (
    <TimingsPicker
      value={[
        {
          begin: '2019-10-31T10:30',
          end: '2019-10-31T22:30',
        },
      ]}
    />
  ))
  .add('with scroll focused on value', () => (
    <TimingsPicker
      value={[
        {
          begin: '2019-08-10T04:30',
          end: '2019-08-10T22:30',
        },
      ]}
      locale="fr"
    />
  ))
  .add('in French language', () => (
    <TimingsPicker
      allowedTimings={[
        {
          begin: '2019-05-15',
          end: '2019-05-16',
        },
        {
          begin: '2019-05-17',
          end: '2019-05-24',
        },
      ]}
      locale="fr"
    />
  ))
  .add('override locales', () => (
    <TimingsPicker
      locales={{
        fr: {
          'rtp.defineTiming': 'Clique et glisse !',
        },
      }}
      locale="fr"
    />
  ))
  .add('DST', () => (
    <TimingsPicker
      value={[
        {
          begin: '2019-03-31T00:30:00',
          end: '2019-03-31T02:30:00',
        },
      ]}
    />
  ))
  .add('disable editOnClick', () => <TimingsPicker editOnClick={false} />);
