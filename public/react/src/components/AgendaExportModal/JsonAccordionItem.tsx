import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Flex, Link, Text, Input } from '@openagenda/uikit';
import { Checkbox, Tooltip } from '@openagenda/uikit/snippets';
import { useTimeoutFn } from 'react-use';
import AccordionItem from 'components/AccordionItem';
import copyText from 'utils/copyText';
import messages from './messages';

export default function JsonAccordionItem({ res }) {
  const intl = useIntl();

  const [copied, setCopied] = useState(false);

  const [detailed, setDetailed] = useState(false);

  useTimeoutFn(
    () => {
      setCopied(false);
    },
    copied ? 1000 : null,
  );

  const exportUrl = new URL(res.export.jsonV2);
  if (detailed) {
    exportUrl.searchParams.append('detailed', '1');
  } else {
    exportUrl.searchParams.delete('detailed');
  }

  return (
    <AccordionItem value="json" title="JSON / API">
      <Flex gap="4" direction="column">
        <Text>{intl.formatMessage(messages.needAuthentication)}</Text>
        <Checkbox
          checked={detailed}
          onCheckedChange={(e) => setDetailed(!!e.checked)}
        >
          {intl.formatMessage(messages.detailedFormat)}
        </Checkbox>

        <Input
          value={exportUrl.toString()}
          readOnly
          onClick={(e) => {
            const input = e.target as HTMLInputElement;
            if (input.selectionStart === input.selectionEnd) {
              input.select();
            }
          }}
        />

        <Link
          href="https://developers.openagenda.com/10-lecture/"
          target="_blank"
          rel="noopener noreferrer"
          w="fit-content"
        >
          {intl.formatMessage(messages.documentation)}
        </Link>

        <Tooltip
          content={intl.formatMessage(messages.copied)}
          showArrow
          positioning={{ placement: 'top' }}
          open={copied}
          openDelay={0}
          closeDelay={0}
        >
          <Button
            type="submit"
            alignSelf="center"
            onClick={async (e) => {
              e.preventDefault();
              const success = await copyText(exportUrl.toString());
              if (success) setCopied(true);
            }}
          >
            {intl.formatMessage(messages.copy)}
          </Button>
        </Tooltip>
      </Flex>
    </AccordionItem>
  );
}
