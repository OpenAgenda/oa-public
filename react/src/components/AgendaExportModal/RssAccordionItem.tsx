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
import type { ChoiceField } from '../../types';
import AccordionItem from '../AccordionItem';
import messages from './messages';
import type { CompleteUrlsResult } from './types';

function pickLabel(label: Record<string, string>, lang: string): string {
  if (!label) return '';
  if (label[lang]) return label[lang];
  const first = Object.keys(label)[0];
  return first ? label[first] : '';
}

function getRssUrl(
  res: string,
  sort: string,
  categoryFields: string[],
): string {
  const url = new URL(res);
  url.searchParams.set('sort', sort);
  url.searchParams.delete('category');
  categoryFields.forEach((f) => url.searchParams.append('category', f));
  return url.toString();
}

export default function RssAccordionItem({
  dialogRef,
  res,
  choiceFields,
}: {
  dialogRef: React.RefObject<HTMLDivElement>;
  res: CompleteUrlsResult;
  choiceFields?: ChoiceField[];
}): React.JSX.Element {
  const intl = useIntl();

  const [copied, setCopied] = useState(false);
  useTimeoutFn(
    () => {
      setCopied(false);
    },
    copied ? 1000 : null,
  );

  const [sort, setSort] = useState('updatedAt.desc');
  const [categoryFields, setCategoryFields] = useState<string[]>([]);

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
    [intl],
  );

  const categoryFieldCollection = useMemo(
    () =>
      createListCollection({
        items: (choiceFields ?? []).map((f) => ({
          label: pickLabel(f.label, intl.locale) || f.field,
          value: f.field,
        })),
      }),
    [intl, choiceFields],
  );

  const rssUrl = getRssUrl(res.export.rss, sort, categoryFields);

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

        {choiceFields && choiceFields.length > 0 ? (
          <Field label={intl.formatMessage(messages.rssCategoryField)}>
            <SelectRoot
              multiple
              collection={categoryFieldCollection}
              value={categoryFields}
              onValueChange={({ value }) => setCategoryFields(value)}
              w="max-content"
            >
              <SelectTrigger>
                <SelectValueText
                  placeholder={intl.formatMessage(
                    messages.rssCategoryFieldNone,
                  )}
                >
                  {(items) => items.map((i) => i.label).join(', ')}
                </SelectValueText>
              </SelectTrigger>
              <SelectContent portalRef={dialogRef} w="max-content">
                {categoryFieldCollection.items.map((item) => (
                  <SelectItem key={item.value} item={item}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Field>
        ) : null}

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
