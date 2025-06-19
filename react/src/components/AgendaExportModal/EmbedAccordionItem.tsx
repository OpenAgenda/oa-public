import { useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useTimeoutFn } from 'react-use';
import {
  createListCollection,
  Box,
  Button,
  Flex,
  Textarea,
  Input,
  Link,
} from '@openagenda/uikit';
import {
  Tooltip,
  Checkbox,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectItem,
  SelectContent,
} from '@openagenda/uikit/snippets';
import { FilterSelect } from '@openagenda/react-shared';
import { getFilterSelectOptions } from '@openagenda/react-filters';
import copyText from 'utils/copyText';
import AccordionItem from 'components/AccordionItem';
import messages from './messages';

function escapeHTML(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const SCRIPT_URL = 'https://cdn.openagenda.com/js/widgets.js';

const DEFAULT_COLOR = '#41acdd';

function getEmbedCode({
  intl,
  href,
  agenda,
  withFilters,
  selectedFilters,
  openEventsOnOA,
  primaryColor,
  lang,
}) {
  const attributes: string[] = [];

  if (withFilters && selectedFilters.length) {
    attributes.push(`data-filters="${selectedFilters.join(',')}"`);
  }

  if (openEventsOnOA) {
    attributes.push('data-base-url="oa"');
  }

  if (primaryColor && primaryColor !== DEFAULT_COLOR) {
    attributes.push(`data-primary-color="${primaryColor}"`);
  }

  const attributesStr = attributes.length ? ` ${attributes.join(' ')}` : '';

  const url = new URL(href);

  if (lang) {
    url.searchParams.set('lang', lang);
  }

  const title = `<a href="${url.toString()}"><b>${escapeHTML(agenda.title)}</b></a>`;
  const text = intl.formatMessage(messages.embedSeeEvents, { title });
  const blockquote = `<blockquote class="oa-agenda" align="center"${attributesStr}><p lang="${intl.locale}">${text}</p></blockquote>`;
  const script = `<script async src="${SCRIPT_URL}" charset="utf-8"></script>`;
  return `${blockquote}${script}`;
}

function loadPublicFilters(settings) {
  return settings.public?.filters?.displayed ?? ['search', 'geo', 'timings'];
}

export default function EmbedAccordionItem({ dialogRef, res, agenda }) {
  const intl = useIntl();

  const [copied, setCopied] = useState(false);

  const [withFilters, setWithFilters] = useState(true);
  const [openEventsOnOA, setOpenEventsOnOA] = useState(true);
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLOR);
  const [lang, setLang] = useState('');

  const [selectedFilters, setSelectedFilters] = useState(() =>
    loadPublicFilters(agenda.settings));

  useTimeoutFn(
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
    selectedFilters,
    openEventsOnOA,
    primaryColor,
    lang,
  });

  const langsCollection = useMemo(
    () =>
      createListCollection({
        items: Object.keys(agenda.summary.languages).map((language) => ({
          label: language,
          value: language,
        })),
      }),
    [agenda.summary.languages],
  );

  return (
    <AccordionItem value="embed" title={intl.formatMessage(messages.embed)}>
      <Flex gap="4" direction="column">
        <Checkbox
          checked={withFilters}
          onCheckedChange={(e) => setWithFilters(!!e.checked)}
          w="fit-content"
        >
          {intl.formatMessage(messages.showFilters)}
        </Checkbox>

        {withFilters ? (
          <Box pl="6">
            <FilterSelect
              value={selectedFilters}
              schema={agenda.schema}
              exclude={['viewport', 'memberUid']}
              placeholder={intl.formatMessage(messages.filterSelectPlaceholder)}
              onChange={(update) => {
                setSelectedFilters(update);
              }}
              menuPosition="fixed"
              getFilterOptions={getFilterSelectOptions}
            />
            <div>{intl.formatMessage(messages.filterSelectSub)}</div>
          </Box>
        ) : null}

        <Checkbox
          checked={!openEventsOnOA}
          onCheckedChange={() => setOpenEventsOnOA(!openEventsOnOA)}
          w="fit-content"
        >
          {intl.formatMessage(messages.openInSamePage)}
        </Checkbox>

        <Flex
          as="label"
          align="center"
          w="fit-content"
          cursor="pointer"
          // sx={{
          //   'input[type="color" i]::-webkit-color-swatch-wrapper': {
          //     p: '0',
          //   },
          // }}
        >
          <Input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            w="5"
            h="5"
            p="0"
            minW="0"
            mr="2"
            borderRadius="xs"
            cursor="pointer"
            css={{
              '&::-webkit-color-swatch-wrapper': {
                p: '0',
              },
              '&::-webkit-color-swatch': {
                border: '0',
              },
              '&::-moz-color-swatch': {
                border: '0',
              },
            }}
          />
          {intl.formatMessage(messages.color)}
        </Flex>

        <SelectRoot
          collection={langsCollection}
          value={[lang]}
          onValueChange={({ value: [pick] }) => setLang(pick)}
          w="fit-content"
        >
          <SelectTrigger>
            <SelectValueText
              placeholder={intl.formatMessage(messages.detectLang)}
            />
          </SelectTrigger>
          <SelectContent portalRef={dialogRef}>
            {langsCollection.items.map((item) => (
              <SelectItem key={item.value} item={item}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>

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

        <Link
          target="_blank"
          rel="noopener"
          href="https://developers.openagenda.com/codes-embed/"
        >
          {intl.formatMessage(messages.viewEmbedDoc)}
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
