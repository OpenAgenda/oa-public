export type AgendaSettingsTracking = {
  googleAnalytics?: string;
  matomoUrl?: string;
  matomoSiteId?: number;
  matomoAskForConsent?: boolean;
  matomoCustom?: string[][];
};

export type AgendaSettingsLab = {
  status?: boolean;
};

export type AgendaSettingsInbox = {
  mailto?: {
    enabled: boolean;
    email: string;
    subject: string;
  };
};

export type AgendaSettingsPublic = {
  filters: {
    displayed: string[];
  };
};

export type AgendaSettingsContribution = {
  type?: 0 | 1 | 2;
};

export type AgendaSettings = {
  tracking?: AgendaSettingsTracking;
  lab?: AgendaSettingsLab;
  inbox?: AgendaSettingsInbox;
  public?: AgendaSettingsPublic;
  contribution?: AgendaSettingsContribution;
};

export type Agenda = {
  slug: string;
  uid: number;
  title: string;
  description: string;
  schema: Record<string, any>;
  memberSchema?: Record<string, any>;
  settings?: AgendaSettings;
  summary: any;
  network: any;
  indexed: boolean | number;
  image?: string;
  official: 0 | 1;
  private: 0 | 1;
  updatedAt: string;
  locationSetUid?: number;
};

export type EventTiming = {
  begin: string;
  end: string;
};

export type EventLocation = {
  name?: string;
  address?: string;
};

export type Event = {
  uid: string | number;
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
  timings: EventTiming[];
  timezone: string;
  attendanceMode?: 1 | 2 | 3;
  location?: EventLocation | null;
};

export type User = {
  uid: string | number;
};

export type EventQuery = {
  timings?: unknown;
  passed?: string | number;
  relative?: string[];
};

export type ExportField = {
  source: string;
  target: string | string[];
  hasOptions?: boolean;
};

export type ExportSettings = {
  languages?: string[];
  hasMultipleLocations?: boolean;
  spreadsheetColumns?: ExportField[];
};
