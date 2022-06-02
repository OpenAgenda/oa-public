import React from 'react';
import { storiesOf } from '@storybook/react';
import TimingsPicker, { classNames } from '../src';

import 'bootstrap/dist/css/bootstrap.css';
import 'react-day-picker/lib/style.css';
import '../src/App.css';

storiesOf('Boostrap', module)
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
      classNames={classNames.bootstrap3}
    />
  ));
