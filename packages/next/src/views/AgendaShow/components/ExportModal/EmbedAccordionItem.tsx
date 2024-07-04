import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Flex, Textarea, Tooltip, useTimeout } from '@openagenda/uikit';
import copyText from 'utils/copyText';
import AccordionItem from './AccordionItem';
import messages from './messages';

function escapeHTML(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const SCRIPT_URL = 'https://cdn.openagenda.com/js/widgets.js';

function getEmbedCode({ intl, agendaSlug, agendaTitle }) {
  const title = `<a href="${process.env.NEXT_PUBLIC_ROOT}/${agendaSlug}"><b>${escapeHTML(agendaTitle)}</b></a>`;
  const text = intl.formatMessage(messages.embedSeeEvents, { title });
  const blockquote = `<blockquote class="oa-agenda" align="center"><p lang="${intl.locale}">${text}</p></blockquote>`;
  const script = `<script async src="${SCRIPT_URL}" charset="utf-8"></script>`;
  return `${blockquote}${script}`;
}

export default function EmbedAccordionItem({ agendaSlug, agendaTitle }) {
  const intl = useIntl();

  const [copied, setCopied] = useState(false);

  useTimeout(
    () => {
      setCopied(false);
    },
    copied ? 1000 : null,
  );

  const embedCode = getEmbedCode({ intl, agendaSlug, agendaTitle });

  return (
    <AccordionItem title={intl.formatMessage(messages.embed)}>
      <Flex gap="4" direction="column">
        <Textarea value={embedCode} readOnly rows={5} onClick={e => (e.target as HTMLInputElement).select()} />
        <Tooltip
          label={intl.formatMessage(messages.copied)}
          hasArrow
          placement="top"
          isOpen={copied}
          arrowSize={8}
          arrowPadding={6}
        >
          <Button
            type="submit"
            colorScheme="primary"
            alignSelf="center"
            onClick={async e => {
              e.preventDefault();
              const success = await copyText(embedCode);
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
