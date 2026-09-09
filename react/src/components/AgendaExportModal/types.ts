export type CompleteUrlsResult = {
  agendaExportSettings: string;
  count: string;
  me: string;
  export: {
    jsonV2: string;
    pdf: string;
    xlsx: string;
    ics: string;
    csv: string;
    rss: string;
    embed: string;
  };
};

export type SpreadsheetFormat = 'xlsx' | 'csv';

export type SpreadsheetSubmitOptions = {
  format: SpreadsheetFormat;
  allLanguages: boolean;
  allFields: boolean;
  distributedOptions: boolean;
  selectedLanguages: string[];
  selectedFields: string[];
  distributedFields: string[];
};

export type PdfSubmitOptions = {
  locationInHeader: boolean;
  sort: string[];
  // null: everything, the export's default. A list names every line to keep.
  includeFields: string[] | null;
};

export type SpreadsheetSubmitHandler = (
  options: SpreadsheetSubmitOptions,
) => (e: React.SyntheticEvent) => void;

export type PdfSubmitHandler = (
  options: PdfSubmitOptions,
) => (e: React.SyntheticEvent) => void;

export type IcsSubmitHandler = (e: React.SyntheticEvent) => void;
