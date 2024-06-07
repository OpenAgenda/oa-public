import logs from '@openagenda/logs';

const log = logs('agendaEvents/onRemove');

export default async (_, ae, context) => {
  log('removed agenda-event %j', ae, { context });
};
