import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Flex, Link, Text } from '@openagenda/uikit';
import { Checkbox } from '@openagenda/uikit/snippets';
import AccordionItem from 'components/AccordionItem';
import messages from './messages';

export default function JsonAccordionItem({ user, handleSubmit }) {
  const intl = useIntl();

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
      </Flex>
    </AccordionItem>
  );
}
