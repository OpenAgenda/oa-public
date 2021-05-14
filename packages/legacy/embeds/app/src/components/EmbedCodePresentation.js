import React, { useState } from 'react';

import { ReactSelectInput } from '@openagenda/react-shared';

export default ({
  embedCodeTemplate,
  initialLanguage = 'fr',
  embedLanguages,
  label
}) => {
  const [language, setLanguage] = useState(initialLanguage);

  return (
    <div>
      <p>{label}</p>
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
