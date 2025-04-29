import logs from '@openagenda/logs';

const log = logs('agendaEvents/beforeRemove');

export default async (_, ae, context) => {
  log('will remove agenda-event %j', ae, { context });
};
