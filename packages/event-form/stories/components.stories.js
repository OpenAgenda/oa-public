import AgeComponent from '../src/components/Age.js';
import TimingsComponent from '../src/components/Timings.js';
import Providers from './decorators/Providers.js';
import StandardCanvas from './decorators/StandardCanvas.js';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'Components',
  decorators: [Providers, StandardCanvas],
};

export const Age = () => (
  <div className="wsq padding-v-xs padding-h-sm">
    <div className="margin-v-sm">Disabled age form component</div>
    <div className="form-group disabled">
      <AgeComponent onChange={() => {}} lang="fr" enabled={false} />
    </div>
  </div>
);

export const Timings = () => (
  <div className="wsq padding-v-xs padding-h-sm">
    <div className="margin-v-sm">
      Timings component. Should work in any timezone
    </div>
    <div className="form-group">
      <TimingsComponent
        value={[
          {
            begin: { date: '2024-10-31', hours: '10', minutes: '00' },
            end: { date: '2024-10-31', hours: '13', minutes: '00' },
          },
        ]}
        lang="fr"
      />
    </div>
  </div>
);
