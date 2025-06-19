import { useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Button,
  CheckboxGroup,
  Flex,
  SimpleGrid,
  Stack,
  Wrap,
} from '@openagenda/uikit';
import { RadioGroup, Radio, Checkbox } from '@openagenda/uikit/snippets';
import AccordionItem from 'components/AccordionItem';
import messages from './messages';

function formatTarget(target: string[] | string) {
  if (Array.isArray(target)) {
    const cleanedArray = [
      ...new Set(target.map((el) => el.replace(/ - [A-Z]{2}$/, ''))),
    ];
    return cleanedArray.join(', ');
  }
  return target;
}

export default function SpreadsheetAccordionItem({
  handleSubmit,
  languages,
  fields = [],
}) {
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

  const handleAllFields = (e) => {
    setSelectedFields(e.checked ? fields.map((v) => v.source) : []);
  };

  return (
    <AccordionItem
      value="sheet"
      title={intl.formatMessage(messages.spreadsheetTitle)}
    >
      <Flex gap="4" direction="column">
        <RadioGroup value={format} onValueChange={(e) => setFormat(e.value)}>
          <Stack gap="2">
            <Radio value="xlsx" w="fit-content">
              XLSX (MS Excel)
            </Radio>
            <Radio value="csv" w="fit-content">
              CSV
            </Radio>
          </Stack>
        </RadioGroup>

        <Stack gap="2">
          <Checkbox
            checked={allLanguages}
            onCheckedChange={(e) => setAllLanguages(!!e.checked)}
            w="fit-content"
          >
            {intl.formatMessage(messages.allLanguages)}
          </Checkbox>

          {!allLanguages ? (
            <CheckboxGroup
              value={selectedLanguages}
              onValueChange={setSelectedLanguages}
            >
              <Wrap pl="6" gap="4">
                {languages.map((lang) => (
                  <Checkbox key={lang} value={lang} w="fit-content">
                    {lang.toUpperCase()}
                  </Checkbox>
                ))}
              </Wrap>
            </CheckboxGroup>
          ) : null}
        </Stack>

        <Stack gap={2}>
          <Checkbox
            checked={allFields}
            onCheckedChange={(e) => setAllFields(!!e.checked)}
          >
            {intl.formatMessage(messages.allFields)}
          </Checkbox>
          {!allFields ? (
            <CheckboxGroup
              value={selectedFields}
              onValueChange={setSelectedFields}
            >
              <SimpleGrid pl="6" columns={2} gap="2">
                <Checkbox
                  checked={
                    isFieldsIndeterminate ? 'indeterminate' : allFieldsChecked
                  }
                  onCheckedChange={handleAllFields}
                  w="fit-content"
                >
                  <b>{intl.formatMessage(messages.selectAll)}</b>
                </Checkbox>
                {fields.map((field) => (
                  <Checkbox
                    key={field.source}
                    value={field.source}
                    w="fit-content"
                  >
                    {formatTarget(field.target)}
                  </Checkbox>
                ))}
              </SimpleGrid>
            </CheckboxGroup>
          ) : null}
        </Stack>

        <Stack gap={2}>
          <Checkbox
            checked={distributedOptions}
            onCheckedChange={(e) => setDistributedOptions(!!e.checked)}
            w="fit-content"
          >
            {intl.formatMessage(messages.distributeOptions)}
          </Checkbox>
          {distributedOptions ? (
            <CheckboxGroup
              value={distributedFields}
              onValueChange={setDistributedFields}
            >
              <SimpleGrid pl="6" columns={2} gap="2">
                {fields.map((field) => {
                  if (!field.hasOptions) return null;
                  return (
                    <Checkbox
                      key={field.source}
                      value={field.source}
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
