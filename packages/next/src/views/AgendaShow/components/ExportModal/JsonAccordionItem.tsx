import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Flex, Link, Text } from '@openagenda/uikit';
import { Checkbox } from '@openagenda/uikit/snippets';
import useUser from 'hooks/useUser';
import AccordionItem from './AccordionItem';
import messages from './messages';

export default function JsonAccordionItem({ handleSubmit, res }) {
  const intl = useIntl();
  const { user } = useUser();

  const [detailed, setDetailed] = useState(false);

  return (
    <AccordionItem value="json" title="JSON / API">
      <Flex gap="4" direction="column">
        {!user ? <Text>{intl.formatMessage(messages.logIn)}</Text> : null}
        <Flex gap="4">
          <Button
            type="submit"
            alignSelf="center"
            onClick={handleSubmit('jsonV2', { detailed })}
            disabled={!user}
          >
            {intl.formatMessage(messages.modalTitle)}
          </Button>
          <Flex direction="column" gap="1">
            <Checkbox
              checked={detailed}
              onCheckedChange={(e) => setDetailed(!!e.checked)}
              disabled={!user}
            >
              {intl.formatMessage(messages.detailedFormat)}
            </Checkbox>
            <Link
              href="https://developers.openagenda.com/10-lecture/"
              target="_blank"
              rel="noopener noreferrer"
              w="fit-content"
            >
              {intl.formatMessage(messages.documentation)}
            </Link>
          </Flex>
        </Flex>
        <div>
          {intl.formatMessage(messages.exportJson, {
            link1: (chunks) => (
              <Link
                href={res.export.jsonV1}
                target="_blank"
                rel="noopener noreferrer"
              >
                {chunks}
              </Link>
            ),
            link2: (chunks) => (
              <Link
                href="https://developers.openagenda.com/export-json-dun-agenda/"
                target="_blank"
                rel="noopener noreferrer"
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
