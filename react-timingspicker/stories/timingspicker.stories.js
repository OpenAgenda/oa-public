import TimingsPicker from '../src';

import 'react-day-picker/lib/style.css';
import '../src/App.css';

// Titre de la story
export default {
  title: 'App',
  component: TimingsPicker,
};

// Stories individuelles
export const Default = () => <TimingsPicker />;

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
  />
);

export const WithDefinedValue = () => (
  <TimingsPicker
    value={[
      {
        begin: '2019-10-31T10:30',
        end: '2019-10-31T22:30',
      },
    ]}
  />
);

export const WithScrollFocusedOnValue = () => (
  <TimingsPicker
    value={[
      {
        begin: '2019-08-10T04:30',
        end: '2019-08-10T22:30',
      },
    ]}
    locale="fr"
  />
);

export const InFrenchLanguage = () => (
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
);

export const OverrideLocales = () => (
  <TimingsPicker
    locales={{
      fr: {
        'rtp.defineTiming': 'Clique et glisse !',
      },
    }}
    locale="fr"
  />
);

export const DST = () => (
  <TimingsPicker
    value={[
      {
        begin: '2019-03-31T00:30:00',
        end: '2019-03-31T02:30:00',
      },
    ]}
  />
);

export const DisableEditOnClick = () => <TimingsPicker editOnClick={false} />;
