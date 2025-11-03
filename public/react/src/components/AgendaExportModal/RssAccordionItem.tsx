import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useTimeoutFn } from 'react-use';
import {
  Button,
  createListCollection,
  Textarea,
  Flex,
} from '@openagenda/uikit';
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  Field,
  Tooltip,
} from '@openagenda/uikit/snippets';
import copyText from '../../utils/copyText';
import AccordionItem from '../AccordionItem';
import messages from './messages';

function getRssUrl(res, sort) {
  const url = new URL(res);
  url.searchParams.set('sort', sort);
  return url.toString();
}

export default function RssAccordionItem({ dialogRef, res }) {
  const intl = useIntl();

  const [copied, setCopied] = useState(false);
  useTimeoutFn(
    () => {
      setCopied(false);
    },
    copied ? 1000 : null,
  );

  const [sort, setSort] = useState('updatedAt.desc');

  const sortCollection = useMemo(
    () =>
      createListCollection({
        items: [
          {
            label: intl.formatMessage(messages.updatedDate),
            value: 'updatedAt.desc',
          },
          {
            label: intl.formatMessage(messages.chronological),
            value: 'lastTimingWithFeatured.asc',
          },
        ],
      }),
    [],
  );

  const rssUrl = getRssUrl(res.export.rss, sort);

  return (
    <AccordionItem value="rss" title="RSS">
      <Flex gap="4" direction="column">
        <Field label={intl.formatMessage(messages.sort)}>
          <SelectRoot
            collection={sortCollection}
            value={[sort]}
            onValueChange={({ value: [pick] }) => setSort(pick)}
            w="max-content"
          >
            <SelectTrigger>
              <SelectValueText />
            </SelectTrigger>
            <SelectContent portalRef={dialogRef} w="max-content">
              {sortCollection.items.map((item) => (
                <SelectItem key={item.value} item={item}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </Field>

        <Textarea
          value={rssUrl}
          readOnly
          rows={3}
          onClick={(e) => {
            const input = e.target as HTMLInputElement;
            if (input.selectionStart === input.selectionEnd) {
              input.select();
            }
          }}
        />

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
              const success = await copyText(rssUrl);
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
