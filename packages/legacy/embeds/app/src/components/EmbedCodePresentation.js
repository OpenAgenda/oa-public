import React, { useState } from 'react';

import {
  template
} from 'lodash';

import { ReactSelectInput } from '@openagenda/react-shared';

export default ({
  embed,
  embedCodeTemplate,
  initialLanguage = 'fr',
  embedLanguages,
  label
}) => {
  const [language, setLanguage] = useState(initialLanguage);

  const render = template(embedCodeTemplate);

  return (
    <div>
      <p>{label}</p>
      <div className="row">
        <div className="col-sm-10">
          <input
            type="text"
            value={render({
              lang: language,
              agendaUid: embed.agendaUid,
              uid: embed.uid
            })}
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
