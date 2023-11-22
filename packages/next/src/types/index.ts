export type AgendaSettingsTracking = {
  googleAnalytics?: string
  matomoUrl?: string
  matomoSiteId?: number
  matomoAskForConsent?: boolean
  matomoCustom?: string[][]
};

export type AgendaSettings = {
  tracking?: AgendaSettingsTracking
};

export type Agenda = {
  slug: string,
  uid: number,
  title: string,
  description: string,
  schema: Record<string, any>,
  settings?: AgendaSettings,
  summary: any,
  indexed: boolean | number,
  image?: string,
};
