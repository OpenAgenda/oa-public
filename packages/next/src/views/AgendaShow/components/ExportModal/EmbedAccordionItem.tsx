import { useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Button,
  Flex,
  Textarea,
  Tooltip,
  useTimeout,
  Checkbox,
} from '@openagenda/uikit';
import copyText from 'utils/copyText';
import listFiltersToInclude from 'utils/listFiltersToInclude';
import AccordionItem from './AccordionItem';
import messages from './messages';

function escapeHTML(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const SCRIPT_URL = 'https://cdn.openagenda.com/js/widgets.js';

function getEmbedCode({ intl, href, agenda, withFilters, openEventsOnOA }) {
  const attributes = [];

  if (withFilters) {
    attributes.push(`data-filters="${listFiltersToInclude(agenda).join(',')}"`);
  }

  if (openEventsOnOA) {
    attributes.push('data-base-url="oa"');
  }

  const attributesStr = attributes.length ? ` ${attributes.join(' ')}` : '';

  const title = `<a href="${href}"><b>${escapeHTML(agenda.title)}</b></a>`;
  const text = intl.formatMessage(messages.embedSeeEvents, { title });
  const blockquote = `<blockquote class="oa-agenda" align="center"${attributesStr}><p lang="${intl.locale}">${text}</p></blockquote>`;
  const script = `<script async src="${SCRIPT_URL}" charset="utf-8"></script>`;
  return `${blockquote}${script}`;
}

export default function EmbedAccordionItem({ res, agenda }) {
  const intl = useIntl();

  const [copied, setCopied] = useState(false);

  const [withFilters, setWithFilters] = useState(true);
  const [openEventsOnOA, setOpenEventsOnOA] = useState(false);

  useTimeout(
    () => {
      setCopied(false);
    },
    copied ? 1000 : null,
  );

  const embedCode = getEmbedCode({
    intl,
    href: res.export.embed,
    agenda,
    withFilters,
    openEventsOnOA,
  });

  return (
    <AccordionItem title={intl.formatMessage(messages.embed)}>
      <Flex gap="4" direction="column">
        <Checkbox
          isChecked={withFilters}
          onChange={(e) => setWithFilters(e.target.checked)}
          w="fit-content"
        >
          {intl.formatMessage(messages.showFilters)}
        </Checkbox>

        <Checkbox
          isChecked={openEventsOnOA}
          onChange={(e) => setOpenEventsOnOA(e.target.checked)}
          w="fit-content"
        >
          {intl.formatMessage(messages.openInSamePage)}
        </Checkbox>

        <Textarea
          value={embedCode}
          readOnly
          rows={5}
          onClick={(e) => {
            const input = e.target as HTMLInputElement;
            if (input.selectionStart === input.selectionEnd) {
              input.select();
            }
          }}
        />
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
            onClick={async (e) => {
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
