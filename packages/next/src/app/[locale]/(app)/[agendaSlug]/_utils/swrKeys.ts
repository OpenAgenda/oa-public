export function filtersBaseKey(
  agendaSlug: string,
  variant: { upcomingOnly: boolean; [k: string]: any },
) {
  return ['AgendaShow', 'filtersBase', agendaSlug, variant] as const;
}

export function eventsKey(agendaSlug: string, query: Record<string, any>) {
  return (pageIndex: number) =>
    ['AgendaShow', 'events', agendaSlug, query, pageIndex] as const;
}
