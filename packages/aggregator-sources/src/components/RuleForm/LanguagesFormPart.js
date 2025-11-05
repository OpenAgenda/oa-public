import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Field } from 'react-final-form';

import { ReactSelectField } from '@openagenda/react-shared';
import messages from './messages.js';

export default ({ sourceAgendaUid, res }) => {
  const intl = useIntl();
  const [isLoadingLang, setIsLoadingLang] = useState(true);
  const [languagesOptions, setLanguagesOptions] = useState([]);

  useEffect(() => {
    fetch(res.replace(':agendaUid', sourceAgendaUid))
      .then((r) => r.json())
      .then((data) => {
        const langs = data.aggregations.languages;
        if (langs) {
          setLanguagesOptions(
            langs
              .filter((l) => l.eventCount)
              .reduce((prev, curr) => {
                const label = intl.formatDisplayName([curr.key], {
                  type: 'language',
                });
                return prev.concat([
                  {
                    value: curr.key,
                    label: label.charAt(0).toUpperCase() + label.slice(1),
                  },
                ]);
              }, []),
          );
        }
        setIsLoadingLang(false);
      });
  }, [intl, res, sourceAgendaUid]);

  return (
    <div className="row">
      {!isLoadingLang ? (
        <div className="form-group form-group-v-aligned">
          <div className="col-sm-10">
            <ReactSelectField
              name="languages"
              Field={Field}
              placeholder={intl.formatMessage(messages.selectLanguages)}
              noOptionsMessage={() => intl.formatMessage(messages.noOption)}
              options={languagesOptions}
              menuPosition="fixed"
              isSearchable
              isMulti
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};
