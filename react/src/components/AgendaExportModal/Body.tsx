import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import useSWR from 'swr';
import ky from 'ky';
import qs from 'qs';
import { Bleed, VStack } from '@openagenda/uikit';
import {
  AccordionRoot,
  DialogBody,
  RadioGroup,
  Radio,
} from '@openagenda/uikit/snippets';
import isUpcomingOnlyQuery from '../../utils/isUpcomingOnlyQuery';
import ModalLoadingBody from '../ModalLoadingBody';
import type { Agenda, EventQuery, ExportSettings } from '../../types';
import SpreadsheetAccordionItem from './SpreadsheetAccordionItem';
import DocumentAccordionItem from './DocumentAccordionItem';
import JsonAccordionItem from './JsonAccordionItem';
import GcalAccordionItem from './GcalAccordionItem';
import OutlookAccordionItem from './OutlookAccordionItem';
import IcsAccordionItem from './IcsAccordionItem';
import RssAccordionItem from './RssAccordionItem';
import AboutAccordionItem from './AboutAccordionItem';
import EmbedAccordionItem from './EmbedAccordionItem';
import messages from './messages';
import type {
  CompleteUrlsResult,
  IcsSubmitHandler,
  DocumentSubmitHandler,
  SpreadsheetSubmitHandler,
} from './types';

function fetcher<T>(url: string): Promise<T> {
  return ky(url, {
    hooks: {
      afterResponse: [
        (_request, _options, response) => {
          if (response.status === 401) return new Response();
        },
      ],
    },
  }).json<T>();
}

function completeUrls(
  agenda: Agenda,
  query: EventQuery,
  rootUrl = 'https://openagenda.com',
  apiRootUrl = 'https://api.openagenda.com',
): CompleteUrlsResult {
  const apiQuery = {
    ...isUpcomingOnlyQuery(query, agenda)
      ? {
        relative: ['current', 'upcoming'],
      }
      : null,
    ...query,
    passed: undefined, // omit passed
  };

  const apiQueryString = qs.stringify(apiQuery, { addQueryPrefix: true });
  const embedQueryString = qs.stringify(query, { addQueryPrefix: true });
  const countQueryString = qs.stringify(
    { ...apiQuery, size: 0 },
    { addQueryPrefix: true },
  );

  return {
    agendaExportSettings: `/agendas/${agenda.uid}/settings/exports`,
    // How many events the export covers: the PDF and Word exports grey their
    // image option past the server threshold. Through the UI API, not the
    // `.v2.json` export, which `trackFormat` would log as a JSON export of the
    // agenda.
    count: `${rootUrl}/api/agendas/${agenda.uid}/events${countQueryString}`,
    me: '/api/me',
    export: {
      jsonV2: `${apiRootUrl}/v2/agendas/${agenda.uid}/events${apiQueryString}`,
      pdf: `${rootUrl}/agendas/${agenda.uid}/events.v2.pdf${apiQueryString}`,
      docx: `${rootUrl}/agendas/${agenda.uid}/events.v2.docx${apiQueryString}`,
      xlsx: `${rootUrl}/agendas/${agenda.uid}/events.v2.xlsx${apiQueryString}`,
      ics: `${rootUrl}/agendas/${agenda.uid}/events.v2.ics${apiQueryString}`,
      csv: `${rootUrl}/agendas/${agenda.uid}/events.v2.csv${apiQueryString}`,
      rss: `${rootUrl}/agendas/${agenda.uid}/events.v2.rss${apiQueryString}`,
      embed: `${rootUrl}/agendas/${agenda.uid}${embedQueryString}`,
    },
  };
}

export default function Body({
  dialogRef,
  agenda,
  query,
  onClose,
  defaultValue,
  rootUrl = 'https://openagenda.com',
  apiRootUrl = 'https://api.openagenda.com',
  renderHost = 'local',
  fetchAgendaExportSettings = null,
}: {
  dialogRef: React.RefObject<HTMLDivElement>;
  agenda: Agenda;
  query: EventQuery;
  onClose: () => void;
  defaultValue?: string | string[];
  rootUrl?: string;
  apiRootUrl?: string;
  renderHost?: 'local' | 'parent';
  fetchAgendaExportSettings?:
    | ((agendaUid: string | number) => Promise<ExportSettings>)
    | null;
}): React.JSX.Element {
  const intl = useIntl();

  const [mode, setMode] = useState<'all' | 'selection'>('selection');
  const res = useMemo(() => {
    // "All" is every event of the corpus on screen: from the archives view,
    // every archived event.
    const usedQuery: EventQuery = mode === 'all'
      ? {
        relative: ['passed', 'current', 'upcoming'],
        ...query.archived ? { archived: query.archived } : {},
      }
      : query;
    return completeUrls(agenda, usedQuery, rootUrl, apiRootUrl);
  }, [mode, agenda, query, rootUrl, apiRootUrl]);

  const { data: exportSettingsData, isLoading: exportSettingsLoading } = useSWR<ExportSettings>(res.agendaExportSettings, (url: string) =>
    (fetchAgendaExportSettings
      ? fetchAgendaExportSettings(agenda.uid)
      : fetcher<ExportSettings>(url)));

  const { data: countData } = useSWR<{ total?: number }>(res.count, fetcher);

  const languages = exportSettingsData?.languages;
  const hasMultipleLocations = exportSettingsData?.hasMultipleLocations ?? true;
  const pdfImageLimit = exportSettingsData?.pdfImageLimit;
  const wordImageLimit = exportSettingsData?.wordImageLimit;
  const fields = exportSettingsData?.spreadsheetColumns;
  const choiceFields = exportSettingsData?.choiceFields;

  const handleSpreadsheetSubmit: SpreadsheetSubmitHandler = (options) => (e) => {
    e.preventDefault();
    const url = new URL(
      options.format === 'xlsx' ? res.export.xlsx : res.export.csv,
    );
    if (!options.allLanguages) {
      options.selectedLanguages.forEach((l) =>
        url.searchParams.append('includeLanguages[]', l));
    }
    if (!options.allFields) {
      options.selectedFields.forEach((f) =>
        url.searchParams.append('includeFields[]', f));
    }
    if (options.distributedOptions) {
      options.distributedFields.forEach((f) =>
        url.searchParams.append('distributeOptionalFields[]', f));
    }
    window.open(url, '_blank');
    onClose();
  };

  const handleDocumentSubmit: DocumentSubmitHandler = (options) => (e) => {
    e.preventDefault();
    const url = new URL(res.export[options.format]);
    url.searchParams.append('lang', intl.locale);
    if (options.format === 'pdf' && options.locationInHeader) {
      url.searchParams.append('locationInHeader', 'true');
    }
    options.sort.forEach((s) => url.searchParams.append('sort[]', s));
    // Every line is in by default: a list only travels when something is out.
    options.includeFields?.forEach((f) =>
      url.searchParams.append('includeFields[]', f));
    window.open(url, '_blank');
    onClose();
  };

  const handleIcsSubmit: IcsSubmitHandler = (e) => {
    e.preventDefault();
    window.open(new URL(res.export.ics), '_blank');
    onClose();
  };

  if (exportSettingsLoading) {
    return <ModalLoadingBody />;
  }

  return (
    <DialogBody>
      <RadioGroup
        value={mode}
        onValueChange={(e) => setMode(e.value as 'all' | 'selection')}
      >
        <VStack gap="2" alignItems="start">
          <Radio value="all">{intl.formatMessage(messages.exportAll)}</Radio>
          <Radio value="selection">
            {intl.formatMessage(messages.exportSelection)}
          </Radio>
        </VStack>
      </RadioGroup>

      <Bleed inline="6">
        <AccordionRoot
          as="form"
          collapsible
          defaultValue={
            Array.isArray(defaultValue) ? defaultValue : [defaultValue]
          }
          mt="4"
        >
          <SpreadsheetAccordionItem
            onSubmit={handleSpreadsheetSubmit}
            languages={languages}
            fields={fields}
          />
          <DocumentAccordionItem
            format="pdf"
            onSubmit={handleDocumentSubmit}
            hasMultipleLocations={hasMultipleLocations}
            total={countData?.total}
            imageLimit={pdfImageLimit}
          />
          <DocumentAccordionItem
            format="docx"
            onSubmit={handleDocumentSubmit}
            hasMultipleLocations={hasMultipleLocations}
            total={countData?.total}
            imageLimit={wordImageLimit}
          />
          <JsonAccordionItem res={res} />
          <GcalAccordionItem res={res} />
          <OutlookAccordionItem res={res} />
          <IcsAccordionItem onSubmit={handleIcsSubmit} />
          <RssAccordionItem
            dialogRef={dialogRef}
            res={res}
            choiceFields={choiceFields}
          />
          <EmbedAccordionItem dialogRef={dialogRef} res={res} agenda={agenda} />
          <AboutAccordionItem
            agenda={agenda}
            rootUrl={rootUrl}
            renderHost={renderHost}
          />
        </AccordionRoot>
      </Bleed>
    </DialogBody>
  );
}
