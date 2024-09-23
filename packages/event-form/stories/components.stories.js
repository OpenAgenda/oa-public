import AgeComponent from '../src/components/Age';
import Providers from './decorators/Providers';
import StandardCanvas from './decorators/StandardCanvas';

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
