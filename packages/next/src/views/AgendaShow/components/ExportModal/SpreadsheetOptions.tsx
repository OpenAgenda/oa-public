import { useState, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  Box,
  Flex,
  Checkbox,
  Radio,
  HStack,
} from '@openagenda/uikit';

const messages = defineMessages({
  inputField: {
    id: 'next.views.AgendaShow.SpreadsheetOptions.input-field',
    defaultMessage: 'Select the fields to export',
  },
  allLanguages: {
    id: 'next.views.AgendaShow.SpreadsheetOptions.all-languages',
    defaultMessage: 'Export in all languages',
  },
  allFields: {
    id: 'next.views.AgendaShow.SpreadsheetOptions.all-fields',
    defaultMessage: 'Export every field',
  },
  selectAll: {
    id: 'next.views.AgendaShow.SpreadsheetOptions.select-all',
    defaultMessage: 'Select all',
  },
  distributeOptions: {
    id: 'next.views.AgendaShow.SpreadsheetOptions.distribute-fields',
    defaultMessage: 'Fields with options: display one value per column',
  },
});

interface SpreadsheetOptionsProps {
  options: Record<string, any>;
  languages: string[];
  setChoice: (options: any) => void;
  fields: any[];
}

export default function SpreadsheetOptions({
  options,
  languages,
  setChoice,
  fields,
}: SpreadsheetOptionsProps) {
  const intl = useIntl();

  const [displayLanguages, setDisplayLanguages] = useState(false);
  const [displayFields, setDisplayFields] = useState(!!options.fields.length);
  const [checkedState, setCheckedState] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [distributeOptions, setDistributeOptions] = useState(false);
  const [distributedFields, setDistributedFields] = useState([]);

  useEffect(() => {
    if (fields.length > 0) {
      setCheckedState(Array.from(fields, f => {
        if (options.fields.includes(f.source)) {
          return true;
        }
        return false;
      }));
    }
  }, [fields, options.fields]);

  const handleLanguage = e => {
    if (e.target.checked) {
      return setChoice({ ...options, languages: [...options.languages, e.target.value] });
    }
    const index = options.languages.indexOf(e.target.value);

    if (index >= 0) {
      options.languages.splice(index, 1);
      setChoice({ ...options, languages: options.languages });
    }
  };

  const handleCheckAll = e => {
    if (e.target.checked) {
      const updatedCheckedState = checkedState.map(() => true);
      setCheckAll(true);
      setCheckedState(updatedCheckedState);

      const allFields = fields.reduce((acc, field) => {
        acc.push(field.source);
        return acc;
      }, []);
      return setChoice({ ...options, fields: allFields });
    }
    const updatedCheckedState = checkedState.map(() => false);
    setCheckedState(updatedCheckedState);
    setChoice({ ...options, fields: [] });
  };

  const handleFields = (event, index = null) => {
    const updatedCheckedState = checkedState.map((item, i) => (index === i ? !item : item));
    setCheckedState(updatedCheckedState);

    if (event.target.checked) {
      return setChoice({ ...options, fields: [...options.fields, event.target.value] });
    }
    setCheckAll(false);

    const updatedOptions = options.fields.filter(field => field !== event.target.value);
    return setChoice({ ...options, fields: updatedOptions });
  };

  const handleDistributedFields = event => {
    if (event.target.checked) {
      const selectedFields = [...distributedFields, event.target.value];
      setDistributedFields(selectedFields);
      return setChoice({ ...options, distributeFields: selectedFields });
    }

    const selectedFields = distributedFields.filter(f => f !== event.target.value);
    setDistributedFields(selectedFields);
    return setChoice({ ...options, distributeFields: selectedFields });
  };

  const handleFormat = id => {
    setChoice({ ...options, format: id });
  };

  const formatTarget = target => {
    if (Array.isArray(target)) {
      const removeLang = target.map(el => {
        if (el.indexOf('-') >= 0) return el.substring(0, el.indexOf('-') - 1);
        return el;
      });
      const cleanArray = [...new Set(removeLang)];
      return cleanArray.join(', ');
    }
    return target;
  };

  return (
    <Flex ml="2" gap="2" direction="column">
      <Radio defaultChecked isChecked={options.format === 'xlsx'} onClick={() => handleFormat('xlsx')}>XLSX (MS Excel)</Radio>
      <Radio isChecked={options.format === 'csv'} onClick={() => handleFormat('csv')}>CSV</Radio>
      <Box>
        <Checkbox defaultChecked={!displayLanguages} onChange={() => setDisplayLanguages(!displayLanguages)}>
          {intl.formatMessage(messages.allLanguages)}
        </Checkbox>
        {displayLanguages && (
          <HStack ml="4" mt="2" gap="2">
            {languages.map(lang => (
              <Box key={lang}>
                <Checkbox key={lang} onChange={handleLanguage}>{lang.toUpperCase()}</Checkbox>
              </Box>
            ))}
          </HStack>
        )}
      </Box>
      <Checkbox defaultChecked={!displayFields} onChange={() => setDisplayFields(!displayFields)}>
        {intl.formatMessage(messages.allFields)}
      </Checkbox>
      {displayFields && (
        <Box ml="4" sx={{ columnCount: 2 }}>
          <Checkbox fontWeight="bold" isChecked={checkAll} onChange={handleCheckAll}>{intl.formatMessage(messages.selectAll)}</Checkbox>
          {fields.map((field, index) => (
            <Checkbox w="full" key={field.source} value={field.source} isChecked={checkedState[index]} onChange={event => handleFields(event, index)}>
              {formatTarget(field.target)}
            </Checkbox>
          ))}
        </Box>
      )}
      <Box mb="4">
        <Checkbox defaultChecked={distributeOptions} onChange={() => setDistributeOptions(!distributeOptions)}>
          {intl.formatMessage(messages.distributeOptions)}
        </Checkbox>
        {distributeOptions && (
          <Box ml="4" sx={{ columnCount: 2 }}>
            {fields.map(field => {
              if (field.hasOptions) {
                const key = `${field.source}Distributed`;
                return (
                  <Checkbox mb="2" w="full" key={key} onChange={event => handleDistributedFields(event)} value={field.source}>
                    {formatTarget(field.target)}
                  </Checkbox>
                );
              }
              return null;
            })}
          </Box>
        )}
      </Box>
    </Flex>
  );
}
