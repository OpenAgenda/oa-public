export type CompleteUrlsResult = {
  agendaExportSettings: string;
  count: string;
  me: string;
  export: {
    jsonV2: string;
    pdf: string;
    docx: string;
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

export type DocumentFormat = 'pdf' | 'docx';

export type DocumentSubmitOptions = {
  format: DocumentFormat;
  // PDF only: the location in the page header rather than in each item.
  locationInHeader: boolean;
  sort: string[];
  // null: everything, the export's default. A list names every line to keep.
  includeFields: string[] | null;
};

export type SpreadsheetSubmitHandler = (
  options: SpreadsheetSubmitOptions,
) => (e: React.SyntheticEvent) => void;

export type DocumentSubmitHandler = (
  options: DocumentSubmitOptions,
) => (e: React.SyntheticEvent) => void;

export type IcsSubmitHandler = (e: React.SyntheticEvent) => void;
