import { useState, useCallback, useContext, useEffect } from 'react';
import PassCultureCheckbox from './passCulture/Checkbox.js';
import ComponentsContext from './components/Context.js';
import spreadRegistrationValuesByService from './utils/spreadRegistrationValuesByService.js';
import mergeSpreadRegistrationValues from './utils/mergeSpreadRegistrationValues.js';

const flattenLabel = (label, lang) => {
  if (!label) return label;
  return typeof label === 'string' ? label : label[lang];
};

function Registration(props) {
  const {
    onChange: propsOnChange,
    value,
    relatedValues = {},
    field: {
      placeholder,
      info,
      default: defaultValue,
      settings = {
        passCulture: null,
      },
    } = {},
    lang = 'en',
    userRole,
    enabled = true,
  } = props;

  const { StandardRegistrationField } = useContext(ComponentsContext);

  const [inputValue, setInputValue] = useState('');

  const { passCulture: passCultureValue, standard: standardValue } = spreadRegistrationValuesByService(value);

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

  useEffect(() => {
    if (value || !defaultValue) {
      return;
    }
    defaultValue.forEach((v) => {
      appendValue(v);
    });
  }, []);

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
          access={access}
          enabled={enabled}
          value={passCultureValue}
          settings={settings.passCulture}
          timings={relatedValues?.timings ?? []}
          location={relatedValues?.location ?? {}}
          title={relatedValues?.title?.fr || relatedValues?.title || null}
          longDesc={
            relatedValues?.longDescription?.fr
            || relatedValues?.longDescription
            || null
          }
          conditions={
            relatedValues?.conditions?.fr || relatedValues?.conditions || null
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
        enabled={enabled}
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
