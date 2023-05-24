import { useState, useMemo, Fragment } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import qs from 'qs';
import useSWR from 'swr';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  VStack,
  RadioGroup,
  Radio,
  Button,
  Checkbox,
  Text,
  Box,
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionIcon,
  AccordionPanel,
  Flex,
  Link,
} from '@openagenda/uikit';
import useUser from 'hooks/useUser';
import useLocationQuery from 'hooks/useLocationQuery';
import ExternalCalendarOptions from './ExternalCalendarOptions';
import SpreadsheetOptions from './SpreadsheetOptions';

const messages = defineMessages({
  modalTitle: {
    id: 'next.views.AgendaShow.ExportModal.title',
    defaultMessage: 'Export',
  },
  inputFormat: {
    id: 'next.views.AgendaShow.ExportModal.inputFormat',
    defaultMessage: 'Choose a format',
  },
  close: {
    id: 'next.views.AgendaShow.ExportModal.close',
    defaultMessage: 'Close',
  },
  cancel: {
    id: 'next.views.AgendaShow.ExportModal.cancel',
    defaultMessage: 'Cancel',
  },
  logIn: {
    id: 'next.views.AgendaShow.ExportModal.login',
    defaultMessage: 'Please log in to access the export link directly from this menu',
  },
  exportAll: {
    id: 'next.views.AgendaShow.ExportModal.exportAll',
    defaultMessage: 'Export all events',
  },
  exportSelection: {
    id: 'next.views.AgendaShow.ExportModal.exportSelection',
    defaultMessage: 'Export current event selection',
  },
  documentation: {
    id: 'next.views.AgendaShow.ExportModal.documentation',
    defaultMessage: 'See the documentation',
  },
  detailedFormat: {
    id: 'next.views.AgendaShow.ExportModal.detailedFormat',
    defaultMessage: 'Use the detailed format',
  },
  exportJson: {
    id: 'next.views.AgendaShow.ExportModal.exportJson',
    defaultMessage: '<link1>Use the previous JSON export version</link1> (Documentation <link2>here</link2>)',
  },
});

function completeUrls(agendaUid, query) {
  const upcomingOnly = !query.timings && query.passed !== '1';

  const apiQuery = {
    ...upcomingOnly ? {
      relative: ['current', 'upcoming'],
    } : null,
    ...query,
    passed: undefined, // omit passed
  };
  const jsonLegacyQuery = {
    ...query.passed === '1' ? {
      relative: ['passed', 'current', 'upcoming'],
    } : null,
    ...query,
    passed: undefined, // omit passed
  }; // JSONv1

  const apiQueryString = qs.stringify(apiQuery, { addQueryPrefix: true });
  const jsonLegacyQueryString = qs.stringify(jsonLegacyQuery, { addQueryPrefix: true });

  return {
    agendaExportSettings: `/agendas/${agendaUid}/settings/exports`,
    me: '/api/me',
    export: {
      jsonV1: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.json${jsonLegacyQueryString}`,
      jsonV2: `${process.env.NEXT_PUBLIC_API_ROOT}/v2/agendas/${agendaUid}/events${apiQueryString}`,
      pdf: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.pdf${apiQueryString}`,
      xlsx: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.v2.xlsx${apiQueryString}`,
      gcal: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.v2.ics${apiQueryString}`,
      ical: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.v2.ics${apiQueryString}`,
      csv: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.v2.csv${apiQueryString}`,
      ics: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.v2.ics${apiQueryString}`,
      rss: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.v2.rss${apiQueryString}`,
    },
  };
}

const fetcher = url => fetch(url)
  .then(
    r => {
      if (r.ok) return r.json();
      if (r.status === 401) return null;
      // TODO should recreate an error with data in `await r.json()`
      // console.log('ERROR response', await r.json());
      throw new Error('Error');
    },
  );

interface ExportModalProps {
  agendaUid: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({
  isOpen,
  onClose,
  agendaUid,
}: ExportModalProps) {
  const intl = useIntl();
  const query = useLocationQuery();

  const [formatChoice, setFormatChoice] = useState({ value: '', id: '' });
  const [spreadsheetForm, setSpreadsheetForm] = useState(false);
  const [jsonOptions, setJsonOptions] = useState(false);
  const [jsonDetailed, setJsonDetailed] = useState(false);
  const [gCal, setGCal] = useState(false);
  const [outlook, setOutlook] = useState(false);
  const [newTab, setNewTab] = useState(false);
  const [displayButton, setDisplayButton] = useState(false);

  const [mode, setMode] = useState('selection');
  const res = useMemo(() => {
    if (mode === 'selection') return completeUrls(agendaUid, query);
    if (mode === 'all') return completeUrls(agendaUid, { relative: ['passed', 'current', 'upcoming'] });
  }, [mode, agendaUid, query]);

  const [spreadsheetOptions, setSpreadsheetOptions] = useState({
    format: 'xlsx',
    fields: [],
    languages: [],
    distributeFields: null,
  });

  const formats = [
    { type: 'Tableur (Excel / CSV)', id: 'spreadsheet' },
    { type: 'PDF', id: 'pdf' },
    { type: 'JSON / API', id: 'jsonV2' },
    { type: 'Google Agenda', id: 'gcal' },
    { type: 'Outlook', id: 'outlook' },
    { type: 'iCal', id: 'ical' },
    { type: 'ICS', id: 'ics' },
    { type: 'RSS', id: 'rss' },
  ];

  const { user } = useUser();
  const { data: meData } = useSWR(res.me, fetcher);
  const { data: exportSettingsData } = useSWR(res.agendaExportSettings, fetcher);

  const userLogged = !!user;
  const publicKey = meData?.apiKey;
  const fields = exportSettingsData?.spreadsheetColumns;
  const languages = exportSettingsData?.languages;

  const setChoice = (value, id) => {
    setDisplayButton(false);
    setGCal(false);
    setOutlook(false);
    setSpreadsheetForm(false);
    setJsonOptions(false);
    setFormatChoice({ value, id });
    if (id === 'spreadsheet') setSpreadsheetForm(true);
    if (id === 'jsonV2' || id === 'rss') setNewTab(true);
    if (id === 'jsonV2') return setJsonOptions(true);
    if (id === 'gcal') return setGCal(true);
    if (id === 'outlook') return setOutlook(true);
    setDisplayButton(true);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (userLogged && formatChoice.id === 'jsonV2') {
      const jsonUrl = new URL(res.export.jsonV2);
      if (jsonDetailed) {
        jsonUrl.searchParams.append('detailed', '1');
      } else {
        jsonUrl.searchParams.delete('detailed');
      }
      jsonUrl.searchParams.append('key', publicKey);
      window.open(jsonUrl);
      return onClose();
    }

    if (newTab) {
      window.open(res.export[formatChoice.id]);
      return onClose();
    }

    if (formatChoice.id === 'spreadsheet') {
      const formatUrl = spreadsheetOptions.format === 'xlsx' ? new URL(res.export.xlsx) : new URL(res.export.csv);

      if (spreadsheetOptions.languages.length) {
        spreadsheetOptions.languages.map(l => formatUrl.searchParams.append('includeLanguages[]', l));
      }

      if (spreadsheetOptions.fields.length) {
        spreadsheetOptions.fields.map(f => formatUrl.searchParams.append('includeFields[]', f));
      }

      if (spreadsheetOptions.distributeFields) {
        spreadsheetOptions.distributeFields.map(f => formatUrl.searchParams.append('distributeOptionalFields[]', f));
      }

      window.open(formatUrl, '_self');
      return onClose();
    }

    window.open(res.export[formatChoice.id], '_self');
    return onClose();
  };

  return (
    <Modal
      size="xl"
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          sx={{
            ':has(> .chakra-modal__close-btn)': {
              pr: 12, // https://github.com/chakra-ui/chakra-ui/issues/7256
            },
          }}
        >
          {intl.formatMessage(messages.modalTitle)}

          <ModalCloseButton />
        </ModalHeader>
        <Box alignItems="start" pb="4">
          <form className="export export-form" onSubmit={handleSubmit}>
            <RadioGroup defaultValue="export-selection">
              <VStack spacing="2" ml="4" alignItems="start">
                <Radio value="export-all" onChange={() => setMode('all')}>{intl.formatMessage(messages.exportAll)}</Radio>
                <Radio value="export-selection" onChange={() => setMode('selection')}>{intl.formatMessage(messages.exportSelection)}</Radio>
              </VStack>
            </RadioGroup>
            <Accordion
              allowToggle
              mt="4"
              onChange={(index: number) => setChoice(formats[index]?.type, formats[index]?.id)}
            >
              {formats.map(({ type, id }) => (
                <Fragment key={id}>
                  <AccordionItem>
                    <AccordionButton>
                      <Box as="span" flex="1" textAlign="left">
                        {type}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel>
                      {spreadsheetForm && id === formatChoice.id && (
                        <SpreadsheetOptions
                          languages={languages}
                          setChoice={setSpreadsheetOptions}
                          fields={fields}
                          options={spreadsheetOptions}
                        />
                      )}
                      {gCal && id === 'gcal' && (
                        <ExternalCalendarOptions type={id} exportUrl={res.export.gcal} />
                      )}
                      {outlook && id === 'outlook' && (
                        <ExternalCalendarOptions type={id} exportUrl={res.export.gcal} />
                      )}
                      {jsonOptions && id === formatChoice.id && (
                        <>
                          {!userLogged && <Text>{intl.formatMessage(messages.logIn)}</Text>}
                          <Flex ml="5" mb="2" alignItems="center">
                            <Button disabled={!userLogged} colorScheme="primary" onClick={handleSubmit}>{intl.formatMessage(messages.modalTitle)}</Button>
                            <Box ml="4">
                              <Checkbox disabled={!userLogged} onChange={() => setJsonDetailed(!jsonDetailed)}>{intl.formatMessage(messages.detailedFormat)}</Checkbox>
                              <br />
                              <Link href="https://developers.openagenda.com/10-lecture/" isExternal color="primary.500">
                                {intl.formatMessage(messages.documentation)}
                              </Link>
                            </Box>
                          </Flex>
                          {intl.formatMessage(messages.exportJson, {
                            link1: (chunks: React.ReactNode) => <Link href={res.export.jsonV1} isExternal color="primary.500">{chunks}</Link>,
                            link2: (chunks: React.ReactNode) => <Link href="https://developers.openagenda.com/export-json-dun-agenda/" isExternal color="primary.500">{chunks}</Link>,
                          })}
                        </>
                      )}
                      {displayButton && id === formatChoice.id && (
                        <Box ml="5" textAlign="center">
                          <Button colorScheme="primary" onClick={handleSubmit}>{intl.formatMessage(messages.modalTitle)}</Button>
                        </Box>
                      )}
                    </AccordionPanel>
                  </AccordionItem>
                </Fragment>
              ))}
            </Accordion>
          </form>
        </Box>
      </ModalContent>
    </Modal>
  );
}
