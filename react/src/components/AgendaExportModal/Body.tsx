import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import useSWR from 'swr';
import ky from 'ky';
import qs from 'qs';
import { Box, Bleed, Link, VStack } from '@openagenda/uikit';
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
import PdfAccordionItem from './PdfAccordionItem';
import JsonAccordionItem from './JsonAccordionItem';
import GcalAccordionItem from './GcalAccordionItem';
import OutlookAccordionItem from './OutlookAccordionItem';
import IcsAccordionItem from './IcsAccordionItem';
import RssAccordionItem from './RssAccordionItem';
import EmbedAccordionItem from './EmbedAccordionItem';
import messages from './messages';
import type {
  CompleteUrlsResult,
  IcsSubmitHandler,
  PdfSubmitHandler,
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
  agendaUid: string | number,
  query: EventQuery,
  rootUrl = 'https://openagenda.com',
  apiRootUrl = 'https://api.openagenda.com',
): CompleteUrlsResult {
  const apiQuery = {
    ...isUpcomingOnlyQuery(query)
      ? {
        relative: ['current', 'upcoming'],
      }
      : null,
    ...query,
    passed: undefined, // omit passed
  };

  const apiQueryString = qs.stringify(apiQuery, { addQueryPrefix: true });
  const embedQueryString = qs.stringify(query, { addQueryPrefix: true });

  return {
    agendaExportSettings: `/agendas/${agendaUid}/settings/exports`,
    me: '/api/me',
    export: {
      jsonV2: `${apiRootUrl}/v2/agendas/${agendaUid}/events${apiQueryString}`,
      pdf: `${rootUrl}/agendas/${agendaUid}/events.v2.pdf${apiQueryString}`,
      xlsx: `${rootUrl}/agendas/${agendaUid}/events.v2.xlsx${apiQueryString}`,
      ics: `${rootUrl}/agendas/${agendaUid}/events.v2.ics${apiQueryString}`,
      csv: `${rootUrl}/agendas/${agendaUid}/events.v2.csv${apiQueryString}`,
      rss: `${rootUrl}/agendas/${agendaUid}/events.v2.rss${apiQueryString}`,
      embed: `${rootUrl}/agendas/${agendaUid}${embedQueryString}`,
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
    const usedQuery: EventQuery = mode === 'all' ? { relative: ['passed', 'current', 'upcoming'] } : query;
    return completeUrls(agenda.uid, usedQuery, rootUrl, apiRootUrl);
  }, [mode, agenda.uid, query, rootUrl, apiRootUrl]);

  const { data: exportSettingsData, isLoading: exportSettingsLoading } = useSWR<ExportSettings>(res.agendaExportSettings, (url: string) =>
    (fetchAgendaExportSettings
      ? fetchAgendaExportSettings(agenda.uid)
      : fetcher<ExportSettings>(url)));

  const languages = exportSettingsData?.languages;
  const hasMultipleLocations = exportSettingsData?.hasMultipleLocations ?? true;
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

  const handlePdfSubmit: PdfSubmitHandler = (options) => (e) => {
    e.preventDefault();
    const url = new URL(res.export.pdf);
    url.searchParams.append('lang', intl.locale);
    if (options.locationInHeader) {
      url.searchParams.append('locationInHeader', 'true');
    }
    options.sort.forEach((s) => url.searchParams.append('sort[]', s));
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
      <Box alignItems="start" mb="4">
        {renderHost === 'parent'
          ? intl.formatMessage(messages.openDataInfoEmbed, {
            agenda: (
              <Link
                href={`https://openagenda.com/${agenda.slug}`}
                target="_blank"
                rel="noopener"
              >
                {agenda.title}
              </Link>
            ),
            linkOpendata: (chunks) => (
              <Link
                href="https://doc.openagenda.com/des-agendas-en-donnees-ouvertes-opendata"
                target="_blank"
                rel="noopener"
              >
                {chunks}
              </Link>
            ),
          })
          : intl.formatMessage(messages.openDataInfo, {
            link: (chunks) => (
              <Link
                href="https://doc.openagenda.com/des-agendas-en-donnees-ouvertes-opendata"
                target="_blank"
                rel="noopener noreferrer"
              >
                {chunks}
              </Link>
            ),
          })}
      </Box>
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
          <PdfAccordionItem
            onSubmit={handlePdfSubmit}
            hasMultipleLocations={hasMultipleLocations}
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
        </AccordionRoot>
      </Bleed>
    </DialogBody>
  );
}
