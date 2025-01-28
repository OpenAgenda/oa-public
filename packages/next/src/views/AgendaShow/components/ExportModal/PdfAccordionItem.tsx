import { useState } from 'react';
import { useIntl } from 'react-intl';
import geoMessages from '@openagenda/common-labels/geo';
import { Button, Checkbox, Flex, Box } from '@openagenda/uikit';
import { SortableSelect } from '@openagenda/react-shared';
import AccordionItem from './AccordionItem';
import messages from './messages';

export default function PdfAccordionItem({
  handleSubmit,
  hasMultipleLocations = true,
}) {
  const intl = useIntl();
  const [locationInHeader, setLocationInHeader] =
    useState(!hasMultipleLocations);
  const [useSections, setUseSections] = useState(false);
  const [sort, setSort] = useState([]);

  return (
    <AccordionItem title="PDF">
      <Flex gap="4" direction="column">
        {hasMultipleLocations ? (
          <>
            <Checkbox
              isChecked={useSections}
              onChange={() => setUseSections(!useSections)}
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
            isChecked={locationInHeader}
            onChange={() => setLocationInHeader(!locationInHeader)}
          >
            {intl.formatMessage(messages.PDFHighlightLocationName)}
          </Checkbox>
        )}
        <Button
          type="submit"
          colorScheme="primary"
          alignSelf="center"
          onClick={handleSubmit('pdf', { locationInHeader, sort })}
        >
          {intl.formatMessage(messages.PDFDownload)}
        </Button>
      </Flex>
    </AccordionItem>
  );
}
