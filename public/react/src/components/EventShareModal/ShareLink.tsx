import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useTimeoutFn } from 'react-use';
import { Box, Button } from '@openagenda/uikit';
import { Tooltip } from '@openagenda/uikit/snippets';
import copyText from '../../utils/copyText';
import AccordionItem from '../AccordionItem';
import messages from './messages';

export default function ShareLink({ absUrl }) {
  const intl = useIntl();
  const [copied, setCopied] = useState(false);

  useTimeoutFn(
    () => {
      setCopied(false);
    },
    copied ? 1000 : null,
  );

  return (
    <AccordionItem value="link" title={intl.formatMessage(messages.shareLink)}>
      <Box
        py="1"
        ps="4"
        border="1px solid"
        borderColor="gray.300"
        borderRadius="md"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        {absUrl.toString()}
        <Tooltip
          content={intl.formatMessage(messages.copied)}
          showArrow
          open={copied}
          openDelay={0}
          closeDelay={0}
        >
          <Button
            variant="outline"
            size="sm"
            mx="1"
            onClick={async () => {
              const success = await copyText(absUrl.toString());
              if (success) setCopied(true);
            }}
          >
            {intl.formatMessage(messages.copy)}
          </Button>
        </Tooltip>
      </Box>
    </AccordionItem>
  );
}
