import { useId, useState } from 'react';
import { useIntl } from 'react-intl';
import geoMessages from '@openagenda/common-labels/geo';
import { Button, Fieldset, Flex, Box, Text } from '@openagenda/uikit';
import { Checkbox } from '@openagenda/uikit/snippets';
import { SortableSelect } from '@openagenda/react-shared';
import AccordionItem from '../AccordionItem';
import messages from './messages';
import type { PdfSubmitHandler } from './types';

// Every optional line ships by default, so a list only travels in the URL
// when the user left something out. That list also names the lines that are
// always there, so it reads as the whole item rather than as a delta.
const alwaysIncludedFields = ['title', 'dateRange'];

export default function PdfAccordionItem({
  onSubmit,
  hasMultipleLocations = true,
  total,
  pdfImageLimit,
}: {
  onSubmit: PdfSubmitHandler;
  hasMultipleLocations?: boolean;
  total?: number;
  pdfImageLimit?: number;
}): React.JSX.Element {
  const intl = useIntl();
  // Names the note under the image box, so the box can point at it.
  const imagesNoteId = useId();
  const [locationInHeader, setLocationInHeader] = useState(!hasMultipleLocations);
  const [useSections, setUseSections] = useState(false);
  const [sort, setSort] = useState<string[]>([]);
  const [includeImage, setIncludeImage] = useState(true);
  const [includeDescription, setIncludeDescription] = useState(true);
  const [includeAccessibility, setIncludeAccessibility] = useState(true);
  const [includeLocation, setIncludeLocation] = useState(true);
  const [includeRegistration, setIncludeRegistration] = useState(true);
  const [includeEventLink, setIncludeEventLink] = useState(true);

  // Past the server threshold the export drops images whatever is asked, so
  // the box shows that: unchecked and out of reach. Unknown counts keep it on.
  const imagesAvailable = total === undefined || pdfImageLimit === undefined || total < pdfImageLimit;

  const optionalFields: Record<string, boolean> = {
    image: imagesAvailable && includeImage,
    description: includeDescription,
    accessibility: includeAccessibility,
    location: includeLocation,
    registration: includeRegistration,
    permalink: includeEventLink,
  };
  // An image box greyed by the threshold is not a choice the user made.
  const everythingIn = Object.entries(optionalFields).every(
    ([field, included]) => included || (field === 'image' && !imagesAvailable),
  );
  const includeFields = everythingIn
    ? null
    : alwaysIncludedFields.concat(
      Object.keys(optionalFields).filter((field) => optionalFields[field]),
    );

  return (
    <AccordionItem value="pdf" title="PDF">
      <Flex gap="4" direction="column">
        {hasMultipleLocations ? (
          <>
            <Checkbox
              checked={useSections}
              onCheckedChange={(e) => setUseSections(!!e.checked)}
            >
              {intl.formatMessage(messages.PDFGeoSections)}
            </Checkbox>
            {useSections ? (
              <Box pl="6">
                <SortableSelect
                  options={[
                    {
                      value: 'location.region.asc',
                      label: intl.formatMessage(geoMessages.region),
                    },
                    {
                      value: 'location.department.asc',
                      label: intl.formatMessage(geoMessages.department),
                    },
                    {
                      value: 'location.adminLevel3.asc',
                      label: intl.formatMessage(geoMessages.adminLevel3),
                    },
                    {
                      value: 'location.city.asc',
                      label: intl.formatMessage(geoMessages.city),
                    },
                    {
                      value: 'location.name.asc',
                      label: intl.formatMessage(geoMessages.location),
                    },
                  ]}
                  value={sort}
                  placeholder={intl.formatMessage(
                    messages.PDFSelectPlaceholder,
                  )}
                  onChange={(update) => setSort(update)}
                  menuPosition="fixed"
                />
                <div>{intl.formatMessage(messages.PDFSelectSub)}</div>
              </Box>
            ) : null}
          </>
        ) : (
          <Checkbox
            checked={locationInHeader}
            onCheckedChange={(e) => setLocationInHeader(!!e.checked)}
          >
            {intl.formatMessage(messages.PDFHighlightLocationName)}
          </Checkbox>
        )}
        <Fieldset.Root>
          <Fieldset.Legend fontWeight="semibold" color="fg">
            {intl.formatMessage(messages.PDFContentTitle)}
          </Fieldset.Legend>
          <Fieldset.Content gap="2">
            <Checkbox checked disabled w="fit-content">
              {intl.formatMessage(messages.PDFAlwaysIncluded)}
            </Checkbox>
            <Checkbox
              checked={imagesAvailable && includeImage}
              disabled={!imagesAvailable}
              onCheckedChange={(e) => setIncludeImage(!!e.checked)}
              inputProps={{
                'aria-describedby': imagesAvailable ? undefined : imagesNoteId,
              }}
              w="fit-content"
            >
              {intl.formatMessage(messages.PDFIncludeImage)}
            </Checkbox>
            {imagesAvailable ? null : (
              <Text id={imagesNoteId} fontSize="sm" color="fg.muted" pl="6">
                {intl.formatMessage(messages.PDFImagesUnavailable, {
                  limit: pdfImageLimit,
                })}
              </Text>
            )}
            <Checkbox
              checked={includeDescription}
              onCheckedChange={(e) => setIncludeDescription(!!e.checked)}
              w="fit-content"
            >
              {intl.formatMessage(messages.PDFIncludeDescription)}
            </Checkbox>
            <Checkbox
              checked={includeAccessibility}
              onCheckedChange={(e) => setIncludeAccessibility(!!e.checked)}
              w="fit-content"
            >
              {intl.formatMessage(messages.PDFIncludeAccessibility)}
            </Checkbox>
            <Checkbox
              checked={includeLocation}
              onCheckedChange={(e) => setIncludeLocation(!!e.checked)}
              w="fit-content"
            >
              {intl.formatMessage(messages.PDFIncludeLocation)}
            </Checkbox>
            <Checkbox
              checked={includeRegistration}
              onCheckedChange={(e) => setIncludeRegistration(!!e.checked)}
              w="fit-content"
            >
              {intl.formatMessage(messages.PDFIncludeRegistration)}
            </Checkbox>
            <Checkbox
              checked={includeEventLink}
              onCheckedChange={(e) => setIncludeEventLink(!!e.checked)}
              w="fit-content"
            >
              {intl.formatMessage(messages.PDFIncludeEventLink)}
            </Checkbox>
          </Fieldset.Content>
        </Fieldset.Root>
        <Button
          type="submit"
          alignSelf="center"
          onClick={onSubmit({
            locationInHeader,
            sort: sort.concat('lastTimingWithFeatured.asc'),
            includeFields,
          })}
        >
          {intl.formatMessage(messages.PDFDownload)}
        </Button>
      </Flex>
    </AccordionItem>
  );
}
