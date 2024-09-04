import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Flex, Radio, RadioGroup, Stack } from '@openagenda/uikit';
import AccordionItem from './AccordionItem';
import messages from './messages';

export default function PdfAccordionItem({ handleSubmit }) {
  const intl = useIntl();
  const [mode, setMode] = useState('default');

  return (
    <AccordionItem title="PDF">
      <Flex gap="4" direction="column">
        <RadioGroup value={mode} onChange={setMode}>
          <Stack spacing="2">
            <Radio value="default" w="fit-content">
              {intl.formatMessage(messages.default)}
            </Radio>
            <Radio value="city" w="fit-content">
              {intl.formatMessage(messages.city)}
            </Radio>
            <Radio value="locationName" w="fit-content">
              {intl.formatMessage(messages.locationName)}
            </Radio>
          </Stack>
        </RadioGroup>
        <Button
          type="submit"
          colorScheme="primary"
          alignSelf="center"
          onClick={handleSubmit('pdf', { mode })}
        >
          {intl.formatMessage(messages.modalTitle)}
        </Button>
      </Flex>
    </AccordionItem>
  );
}
