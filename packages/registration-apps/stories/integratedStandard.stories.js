import { useState } from 'react';

// eslint-disable-next-line
import '@openagenda/bs-templates/compiled/main.css';

import Registration from '../src/bootstrap';

export default {
  title: 'integrated/Standard',
  // decorators: [ComponentsProvider],
};

export const EmptyAtLoad = () => {
  const [value, setValue] = useState();

  return (
    <div className="oa-form col-lg-offset-3 col-lg-6">
      <Registration
        value={value}
        onChange={setValue}
        field={{
          placeholder: {
            fr: 'Ajouter un item ici',
          },
        }}
        lang="fr"
      />
    </div>
  );
};

export const WithData = () => {
  const [value, setValue] = useState([
    'https://oa.com',
    'céla@decadanc.an',
    { type: 'phone', value: '06' },
  ]);

  return (
    <div className="oa-form col-lg-offset-3 col-lg-6">
      <Registration
        value={value}
        onChange={setValue}
        field={{
          placeholder: {
            fr: 'Ajouter un item ici',
          },
        }}
        lang="fr"
      />
    </div>
  );
};
