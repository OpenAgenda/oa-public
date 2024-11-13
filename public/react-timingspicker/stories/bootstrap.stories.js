import TimingsPicker, { classNames } from '../src/index.js';

import 'bootstrap/dist/css/bootstrap.css';
import 'react-day-picker/lib/style.css';
import '../src/App.css';

// Titre de la story
export default {
  title: 'Boostrap',
  component: TimingsPicker,
};

// Première story
export const Default = () => <TimingsPicker />;

// Deuxième story
export const WithAllowedTimings = () => (
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
);
