import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Checkbox, CheckboxGroup, Flex, Radio, RadioGroup, SimpleGrid, Stack, Wrap } from '@openagenda/uikit';
import AccordionItem from './AccordionItem';
import messages from './messages';

function formatTarget(target: string[] | string) {
  if (Array.isArray(target)) {
    const cleanedArray = [...new Set(target.map(el => el.replace(/ - [A-Z]{2}$/, '')))];
    return cleanedArray.join(', ');
  }
  return target;
}

export default function SpreadsheetAccordionItem({ handleSubmit, languages, fields }) {
  const intl = useIntl();

  const [format, setFormat] = useState('xlsx');
  const [allLanguages, setAllLanguages] = useState(true);
  const [allFields, setAllFields] = useState(true);
  const [distributedOptions, setDistributedOptions] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [distributedFields, setDistributedFields] = useState([]);

  const allFieldsChecked = selectedFields.length === fields.length;
  const isFieldsIndeterminate = selectedFields.length > 0 && !allFieldsChecked;

  const handleAllFields = e => {
    setSelectedFields(e.target.checked ? fields.map(v => v.source) : []);
  };

  const handleToggleItem = setFunction => e => {
    const { value } = e.target;
    setFunction(prev => (prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]));
  };
  return (
    <AccordionItem title={intl.formatMessage(messages.spreadsheetTitle)}>
      <Flex gap="4" direction="column">
        <RadioGroup value={format} onChange={setFormat}>
          <Stack spacing="2">
            <Radio value="xlsx" w="fit-content">
              XLSX (MS Excel)
            </Radio>
            <Radio value="csv" w="fit-content">
              CSV
            </Radio>
          </Stack>
        </RadioGroup>

        <Stack spacing="2">
          <Checkbox isChecked={allLanguages} onChange={e => setAllLanguages(e.target.checked)} w="fit-content">
            {intl.formatMessage(messages.allLanguages)}
          </Checkbox>

          {!allLanguages ? (
            <CheckboxGroup value={selectedLanguages}>
              <Wrap shouldWrapChildren pl="6" spacing="4">
                {languages.map(lang => (
                  <Checkbox key={lang} value={lang} onChange={handleToggleItem(setSelectedLanguages)} w="fit-content">
                    {lang.toUpperCase()}
                  </Checkbox>
                ))}
              </Wrap>
            </CheckboxGroup>
          ) : null}
        </Stack>

        <Stack spacing={2}>
          <Checkbox isChecked={allFields} onChange={e => setAllFields(e.target.checked)}>
            {intl.formatMessage(messages.allFields)}
          </Checkbox>
          {!allFields ? (
            <CheckboxGroup value={selectedFields}>
              <SimpleGrid pl="6" columns={2} spacing="2">
                <Checkbox
                  isChecked={allFieldsChecked}
                  isIndeterminate={isFieldsIndeterminate}
                  onChange={handleAllFields}
                  w="fit-content"
                >
                  <b>{intl.formatMessage(messages.selectAll)}</b>
                </Checkbox>
                {fields.map(field => (
                  <Checkbox
                    key={field.source}
                    value={field.source}
                    onChange={handleToggleItem(setSelectedFields)}
                    w="fit-content"
                  >
                    {formatTarget(field.target)}
                  </Checkbox>
                ))}
              </SimpleGrid>
            </CheckboxGroup>
          ) : null}
        </Stack>

        <Stack spacing={2}>
          <Checkbox
            isChecked={distributedOptions}
            onChange={e => setDistributedOptions(e.target.checked)}
            w="fit-content"
          >
            {intl.formatMessage(messages.distributeOptions)}
          </Checkbox>
          {distributedOptions ? (
            <CheckboxGroup value={distributedFields}>
              <SimpleGrid pl="6" columns={2} spacing="2">
                {fields.map(field => {
                  if (!field.hasOptions) return null;
                  return (
                    <Checkbox
                      key={field.source}
                      value={field.source}
                      onChange={handleToggleItem(setDistributedFields)}
                      w="fit-content"
                    >
                      {formatTarget(field.target)}
                    </Checkbox>
                  );
                })}
              </SimpleGrid>
            </CheckboxGroup>
          ) : null}
        </Stack>
        <Button
          type="submit"
          colorScheme="primary"
          alignSelf="center"
          onClick={handleSubmit('spreadsheet', {
            format,
            allLanguages,
            allFields,
            distributedOptions,
            selectedLanguages,
            selectedFields,
            distributedFields,
          })}
        >
          {intl.formatMessage(messages.modalTitle)}
        </Button>
      </Flex>
    </AccordionItem>
  );
}
