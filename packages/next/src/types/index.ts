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

export type AgendaSettings = {
  tracking?: AgendaSettingsTracking;
  lab?: AgendaSettingsLab;
  inbox?: AgendaSettingsInbox;
  public?: AgendaSettingsPublic;
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
