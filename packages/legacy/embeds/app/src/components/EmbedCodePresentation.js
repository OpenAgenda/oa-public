import React, { useState } from 'react';

import { ReactSelectInput } from '@openagenda/react-shared';

export default ({
  embedCodeTemplate,
  initialLanguage = 'fr',
  embedLanguages
}) => {
  const [language, setLanguage] = useState(initialLanguage);

  return (
    <div>
      <p>Vue principale de l'agenda intégré. Elle montre la liste des événements de l'agenda ainsi que la vue détaillée de n'importe quel événement par simple clic. Affichez-le sur votre site en y plaçant le code.</p>
      <div className="row">
        <div className="col-sm-10">
          <input
            type="text"
            value={embedCodeTemplate.replace(/<%=\slang\s%>/g, language)}
            className="form-control"
            onClick={e => e.target.select()}
            onChange={() => {}}
          />
        </div>
        <div className="col-sm-2">
          <ReactSelectInput
            name="language"
            isClearable={false}
            value={{
              label: language.toUpperCase(),
              value: language
            }}
            options={embedLanguages.map(l => ({
              label: l.toUpperCase(),
              value: l
            }))}
            onChange={({ value }) => setLanguage(value)}
          />
        </div>
      </div>
    </div>
  );
};
