import logs from '@openagenda/logs';
import { byEmail as getByEmail } from './get.js';
import patch from './patch.js';
import create from './create.js';
import { isSuperiorTo } from './iso/compareRoles.js';

const log = logs('setByEmail');

async function setByEmail(config, data, options = {}) {
  if (!data?.agendaUid) {
    throw new Error('Bad payload: agendaUid is missing');
  }

  const member = await getByEmail(config, {
    agendaUid: data.agendaUid,
    email: data.email,
  });

  const userUid = member?.userUid
    || (config.interfaces
      && config.interfaces.getUserByEmail
      && await config.interfaces
        .getUserByEmail(data.email)
        .then((u) => (u ? u.uid : null)));

  const clean = {};

  if (!member?.userUid && userUid) {
    clean.userUid = userUid;
  }

  if (!member || isSuperiorTo(data?.role, member.role)) {
    clean.role = data.role;
  }

  if (member && Object.keys(clean).length) {
    return {
      ...await patch(config, member.id, clean, options),
      operation: 'patch',
    };
  }

  if (member) {
    log('info', 'nothing done for member %s', member.id);

    return {
      operation: null,
    };
  }

  return {
    ...await create(
      config,
      {
        agendaUid: data.agendaUid,
        ...clean,
        custom: { email: data.email },
      },
      options,
    ),
    operation: 'create',
  };
}

function task(service, config) {
  const worker = config.createWorker((job) => {
    switch (job.name) {
      case 'setByEmail': {
        return setByEmail(config, job.data.data, job.data.options);
      }
      default: {
        throw new Error(`Unknown job ${job.name}`);
      }
    }
  });

  worker.on('error', (failedReason) => log.error('error', failedReason));

  worker.run();

  service.worker = worker;
}

async function bulk(config, base, emails = [], options = {}) {
  log('bulk');

  const { bulkThreshold, queue } = {
    bulkThreshold: 10,
    ...config,
  };

  const queueJobs = emails.length > bulkThreshold;

  const result = {
    queued: queueJobs ? emails.length : 0,
    processed: [],
  };

  log(queueJobs ? 'queueing' : 'processing without queueing');

  for (const email of emails) {
    const data = { ...base, email };

    if (queueJobs) {
      await queue.add('setByEmail', { data, options });
    } else {
      result.processed.push(await setByEmail(config, data, options));
    }
  }

  return result;
}

export default Object.assign(setByEmail, {
  task,
  bulk,
});
