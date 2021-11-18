import '@openagenda/bs-templates/compiled/main.css';

import componentFromFixtures from './utils/componentFromFixtures';
import ProvidersDecorator from './decorators/Providers';

export default {
  title: 'App - Step 3: Confirmation',
  decorators: [ProvidersDecorator]
};

export const BasicConfirmation = componentFromFixtures(
  'Contributor saved his event, is shown default completion screen',
  200, '/confirmation'
);

export const CustomMessageConfirmation = componentFromFixtures(
  'Contributor saved his event, is show completion screen with custom message',
  201, '/confirmation'
);
