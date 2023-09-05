import Select from 'react-select';
import countries from '@openagenda/countries/labels'; 
import defaultLocationLabels from '@openagenda/labels/event/defaultLocation';
import flattenLabels from '@openagenda/labels/flatten';

const DefaultLocation = ({
  lang = 'fr',
  value = null,
  field,
  onChange,
  enabled = true,
}) => {
  const labels = flattenLabels(defaultLocationLabels, lang);
  const extractCountryNames = () => countries.map(c => ({
    value: c.code,
    label: c[lang],
  }));

  const options = extractCountryNames();
  const selectValue = options.find(option => option.value === value?.countryCode);

  return (
    <div
      className={
        enabled
          ? 'form-group country'
          : 'form-group country disabled'
      }
    >
      <label htmlFor="Country">
        {labels.chooseDefaultCountry}
      </label>

      <Select
        disabled={!enabled}
        options={options}
        value={selectValue}
        onChange={val => {
          onChange({ ...value, countryCode: val.value });
        }}
        clearable={false}
      />
    </div>
  );
};
export default DefaultLocation;
