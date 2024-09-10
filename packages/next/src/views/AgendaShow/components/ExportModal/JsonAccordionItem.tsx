import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Checkbox, Flex, Link, Text } from '@openagenda/uikit';
import useUser from 'hooks/useUser';
import AccordionItem from './AccordionItem';
import messages from './messages';

export default function JsonAccordionItem({ handleSubmit, res }) {
  const intl = useIntl();
  const { user } = useUser();

  const [detailed, setDetailed] = useState(false);

  return (
    <AccordionItem title="JSON / API">
      <Flex gap="4" direction="column">
        {!user ? <Text>{intl.formatMessage(messages.logIn)}</Text> : null}
        <Flex gap="4">
          <Button
            type="submit"
            colorScheme="primary"
            alignSelf="center"
            onClick={handleSubmit('jsonV2', { detailed })}
            isDisabled={!user}
          >
            {intl.formatMessage(messages.modalTitle)}
          </Button>
          <Flex direction="column">
            <Checkbox
              isChecked={detailed}
              onChange={(e) => setDetailed(e.target.checked)}
              isDisabled={!user}
            >
              {intl.formatMessage(messages.detailedFormat)}
            </Checkbox>
            <Link
              href="https://developers.openagenda.com/10-lecture/"
              isExternal
              colorScheme="primary"
              w="fit-content"
            >
              {intl.formatMessage(messages.documentation)}
            </Link>
          </Flex>
        </Flex>
        <div>
          {intl.formatMessage(messages.exportJson, {
            link1: (chunks: React.ReactNode) => (
              <Link href={res.export.jsonV1} isExternal colorScheme="primary">
                {chunks}
              </Link>
            ),
            link2: (chunks: React.ReactNode) => (
              <Link
                href="https://developers.openagenda.com/export-json-dun-agenda/"
                isExternal
                colorScheme="primary"
              >
                {chunks}
              </Link>
            ),
          })}
        </div>
      </Flex>
    </AccordionItem>
  );
}
