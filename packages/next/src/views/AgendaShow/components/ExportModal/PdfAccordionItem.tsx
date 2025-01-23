import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Flex, Radio, RadioGroup, Stack, Box } from '@openagenda/uikit';
import { SortableSelect } from '@openagenda/react-shared';
import AccordionItem from './AccordionItem';
import messages from './messages';

export default function PdfAccordionItem({ handleSubmit }) {
  const intl = useIntl();
  const [mode, setMode] = useState('default');
  const [selectedOptions, setSelectedOptions] = useState([]);

  const options = [
    { value: 'location.region.asc', label: intl.formatMessage(messages.region) },
    { value: 'location.department.asc', label: intl.formatMessage(messages.department) },
    { value: 'location.city.asc', label: intl.formatMessage(messages.city) },
    { value: 'location.name.asc', label: intl.formatMessage(messages.location) },
  ];

  const schema = {};
  const exclude = [];
  const getFilterOptions = () => [];

  return (
    <AccordionItem title="PDF">
      <Flex gap="4" direction="column">
        <RadioGroup value={mode} onChange={setMode}>
          <Stack spacing="2">
            <div>{intl.formatMessage(messages.multipleLocations)}</div>
            <Radio value="default" w="fit-content"> 
              {intl.formatMessage(messages.default)}
            </Radio>
            <Radio value="sectioning" w="fit-content">
              {intl.formatMessage(messages.sectioning)}
            </Radio>
          </Stack>
          {mode === 'sectioning' && (
            <Box pl="6">
              <SortableSelect
                options={options}
                value={selectedOptions}
                placeholder={intl.formatMessage(messages.sortableSelectPlaceholder)}
                onChange={(update) => {
                  setSelectedOptions(update);
                }}
                menuPosition="fixed"
                schema={schema}
                exclude={exclude}
                getFilterOptions={getFilterOptions}
              />
              <div>{intl.formatMessage(messages.optionSelectSub)}</div>
            </Box>
          )}
          <Stack spacing="2" mt="4">
            <div>{intl.formatMessage(messages.singleLocation)}</div>
            <Radio value="locationName" w="fit-content">
              {intl.formatMessage(messages.highlightLocationName)}
            </Radio>
          </Stack>
        </RadioGroup>
        <Button
          type="submit"
          colorScheme="primary"
          alignSelf="center"
          onClick={handleSubmit('pdf', { mode, selectedOptions })}
        >
          {intl.formatMessage(messages.modalTitle)}
        </Button>
      </Flex>
    </AccordionItem>
  );
}
