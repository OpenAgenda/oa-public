import { useState, useCallback, useContext } from 'react';
import PassCultureCheckbox from './passCulture/Checkbox';
import ComponentsContext from './components/Context';
import spreadRegistrationValuesByService from './utils/spreadRegistrationValuesByService';
import mergeSpreadRegistrationValues from './utils/mergeSpreadRegistrationValues';

const flattenLabel = (label, lang) => {
  if (!label) return label;
  return typeof label === 'string' ? label : label[lang];
};

function Registration(props) {
  const {
    onChange: propsOnChange,
    value = [],
    relatedValues = {},
    field: {
      placeholder,
      info,
      settings = {
        passCulture: null,
      },
    } = {},
    lang = 'en',
    userRole,
  } = props;

  const { StandardRegistrationField } = useContext(ComponentsContext);

  const { passCulture: passCultureValue, standard: standardValue } = spreadRegistrationValuesByService(value);

  const [inputValue, setInputValue] = useState('');

  const appendValue = useCallback(
    (item) => {
      setInputValue('');

      propsOnChange([].concat(value ?? []).concat(item));
    },
    [value, propsOnChange],
  );

  const onInputChange = useCallback(
    (e) => {
      const parts = e.target.value.split(/;|,|\|/);

      if (parts.length < 2) {
        setInputValue(e.target.value);
      } else {
        appendValue(parts.shift());
      }
    },
    [setInputValue, appendValue],
  );

  const onStandardChange = useCallback(
    (updatedValue) => {
      setInputValue('');
      propsOnChange(
        mergeSpreadRegistrationValues({
          standard: updatedValue,
          passCulture: passCultureValue,
          OGValue: value || [],
        }),
      );
    },
    [propsOnChange, passCultureValue, value],
  );

  const access = settings.passCulture?.access || ['administrator', 'moderator'];

  return (
    <div className="">
      {(settings.passCulture?.siren ?? []).length
      && access.includes(userRole) ? (
        <PassCultureCheckbox
          value={passCultureValue}
          settings={settings.passCulture}
          timings={relatedValues?.other?.timings ?? []}
          location={relatedValues?.other?.location ?? {}}
          title={
            relatedValues?.other?.title?.fr
            || relatedValues?.other?.title
            || null
          }
          longDesc={
            relatedValues?.other?.longDescription?.fr
            || relatedValues?.other?.longDescription
            || null
          }
          conditions={
            relatedValues?.other?.conditions?.fr
            || relatedValues?.other?.conditions
            || null
          }
          onChange={(updatedPassCultureValue) =>
            propsOnChange(
              mergeSpreadRegistrationValues({
                standard: standardValue,
                passCulture: updatedPassCultureValue,
                OGValue: value || [],
              }),
            )}
        />
        ) : null}
      <StandardRegistrationField
        value={standardValue}
        inputValue={inputValue}
        onChange={onStandardChange}
        onInputChange={onInputChange}
        placeholder={
          placeholder && !standardValue?.length
            ? flattenLabel(placeholder, lang)
            : undefined
        }
        infoLabel={info}
      />
    </div>
  );
}

export default Registration;
