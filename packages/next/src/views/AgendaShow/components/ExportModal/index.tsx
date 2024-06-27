import { useState, useEffect, useMemo, Fragment, useCallback } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import qs from 'qs';
import useSWR from 'swr';
import ky from 'ky';
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
import PdfOptions from './PdfOptions';

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
  openDataInfo: {
    id: 'next.views.AgendaShow.ExportModal.openData',
    defaultMessage: 'The content of this agenda can be used following the <link>Open Data principle</link>',
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
      pdf: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.v2.pdf${apiQueryString}`,
      xlsx: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.v2.xlsx${apiQueryString}`,
      gcal: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.v2.ics${apiQueryString}`,
      ical: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.v2.ics${apiQueryString}`,
      csv: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.v2.csv${apiQueryString}`,
      ics: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.v2.ics${apiQueryString}`,
      rss: `${process.env.NEXT_PUBLIC_ROOT}/agendas/${agendaUid}/events.v2.rss${apiQueryString}`,
    },
  };
}

const fetcher = url => ky(url, {
  hooks: {
    afterResponse: [
      (_request, _options, response) => {
        if (response.status === 401) return new Response();
      },
    ],
  },
}).json();

interface ExportModalProps {
  agendaUid: string;
  isOpen: boolean;
  onClose: () => void;
  defaultFormatChoiceId?: string;
}

const formats = [
  { type: 'Tableur (Excel / CSV)', id: 'spreadsheet', defaultButton: true },
  { type: 'PDF', id: 'pdf', defaultButton: true },
  { type: 'JSON / API', id: 'jsonV2', defaultButton: true },
  { type: 'Google Agenda', id: 'gcal' },
  { type: 'Outlook', id: 'outlook' },
  { type: 'iCal', id: 'ical', defaultButton: true },
  { type: 'ICS', id: 'ics', defaultButton: true },
  { type: 'RSS', id: 'rss', defaultButton: true },
];

export default function ExportModal({
  isOpen,
  onClose,
  agendaUid,
  defaultFormatChoiceId,
}: ExportModalProps) {
  const intl = useIntl();
  const query = useLocationQuery();

  const [formatChoice, setFormatChoice] = useState(defaultFormatChoiceId ? {
    value: formats.find(({ id }) => defaultFormatChoiceId === id).type,
    defaultButton: !!formats.find(({ id }) => defaultFormatChoiceId === id).defaultButton,
    id: defaultFormatChoiceId,
  } : {
    value: '',
    id: '',
    defaultButton: false,
  });

  const [spreadsheetForm, setSpreadsheetForm] = useState(false);
  const [jsonOptions, setJsonOptions] = useState(false);
  const [jsonDetailed, setJsonDetailed] = useState(false);
  const [gCal, setGCal] = useState(false);
  const [outlook, setOutlook] = useState(false);
  const [pdf, setPdf] = useState(false);

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

  const [pdfOptions, setPdfOptions] = useState({
    format: 'pdf',
    mode: null,
  });

  const { user } = useUser();
  const { data: meData, mutate: meMutate } = useSWR<any>(res.me, fetcher);
  const { data: exportSettingsData } = useSWR<any>(res.agendaExportSettings, fetcher);

  const userLogged = !!user;
  const publicKey = meData?.apiKey;
  const fields = exportSettingsData?.spreadsheetColumns;
  const languages = exportSettingsData?.languages;

  const displayDetailedForm = useCallback(id => {
    if (id === 'spreadsheet') setSpreadsheetForm(true);
    if (id === 'jsonV2') return setJsonOptions(true);
    if (id === 'gcal') return setGCal(true);
    if (id === 'outlook') return setOutlook(true);
    if (id === 'pdf') return setPdf(true);
  },[]);

  const setChoice = (value, id) => {
    setGCal(false);
    setOutlook(false);
    setSpreadsheetForm(false);
    setJsonOptions(false);
    setPdf(false);
    setFormatChoice({ value, id, defaultButton: formats.find(({ id: formatId }) => id === formatId)?.defaultButton });
    displayDetailedForm(id);
  };

  useEffect(() => {
    if (!defaultFormatChoiceId) {
      return;
    }
    displayDetailedForm(defaultFormatChoiceId);
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();

    let exportUrl = res.export[formatChoice.id];

    const newTab = ['jsonV2', 'rss'].includes(formatChoice.id);

    if (userLogged && formatChoice.id === 'jsonV2') {
      const jsonUrl = new URL(res.export.jsonV2);

      let key = publicKey;
      
      if (!key) {
        try {
          await fetch('/users/me/generateApiKey?$client[publicKey]=true');
          const data = await meMutate();
          key = data.apiKey;
        } catch (error) {
          console.log('Can\'t generate api key', error);
        }
      }

      if (jsonDetailed) {
        jsonUrl.searchParams.append('detailed', '1');
      } else {
        jsonUrl.searchParams.delete('detailed');
      }
      jsonUrl.searchParams.append('key', key);
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
      exportUrl = formatUrl;
    }

    if (formatChoice.id === 'pdf') {
      const formatUrl = new URL(res.export.pdf);      
      if (pdfOptions.mode) {
        formatUrl.searchParams.append('mode', pdfOptions.mode);
      }
      exportUrl = formatUrl;
    }
    window.open(exportUrl, newTab ? undefined : '_self');
    onClose();
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
        <Box alignItems="start" pb="4" ml="6" mr="6">
          {intl.formatMessage(messages.openDataInfo, {
            link: (chunks: React.ReactNode) => <Link href="https://doc.openagenda.com/des-agendas-en-donnees-ouvertes-opendata" isExternal color="primary.500">{chunks}</Link>,
          })}
        </Box>
        <Box alignItems="start" pb="4">
          <form className="export export-form" onSubmit={handleSubmit}>
            <RadioGroup defaultValue="export-selection">
              <VStack spacing="2" ml="6" alignItems="start">
                <Radio value="export-all" onChange={() => setMode('all')}>{intl.formatMessage(messages.exportAll)}</Radio>
                <Radio value="export-selection" onChange={() => setMode('selection')}>{intl.formatMessage(messages.exportSelection)}</Radio>
              </VStack>
            </RadioGroup>
            <Accordion
              defaultIndex={formatChoice.id.length ? [formats.findIndex(({ id }) => id === formatChoice.id)] : undefined}
              allowToggle
              mt="4"
              onChange={(index: number) => setChoice(formats[index]?.type, formats[index]?.id)}
            >
              {formats.map(({ type, id }) => (
                <Fragment key={id}>
                  <AccordionItem>
                    <AccordionButton>
                      <Box as="span" flex="1" textAlign="left" ml="2">
                        {type}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel>
                      {exportSettingsData && spreadsheetForm && id === formatChoice.id && (
                        <SpreadsheetOptions
                          languages={languages}
                          setChoice={setSpreadsheetOptions}
                          fields={fields}
                          options={spreadsheetOptions}
                        />
                      )}
                      {pdf && id === 'pdf' && (
                        <PdfOptions
                          setChoice={setPdfOptions}
                          options={pdfOptions}
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
                            <Button isDisabled={!userLogged} colorScheme="primary" onClick={handleSubmit}>{intl.formatMessage(messages.modalTitle)}</Button>
                            <Box ml="4">
                              <Checkbox isDisabled={!userLogged} onChange={() => setJsonDetailed(!jsonDetailed)}>{intl.formatMessage(messages.detailedFormat)}</Checkbox>
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
                      {formatChoice.defaultButton && (
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
