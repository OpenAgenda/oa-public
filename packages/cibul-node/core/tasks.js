import logs from '@openagenda/logs';

const log = logs('core/tasks');

export default function tasks(services) {
  const { queues } = services;

  const queue = queues('core');

  return Object.assign(
    (ons = {}) => {
      queue.on('execute', ons.execute || log.bind(null, 'info'));
      queue.on('error', ons.error || log.bind(null, 'error'));
      queue.on('success', ons.success || log.bind(null, 'success'));

      queue.run();
    },
    {
      register: (fns) => queue.register(fns),
      enqueue: (...args) => queue(...args),
      stop: async (options = {}) => {
        if (options.reset) {
          await queue.clear();
        }
        return queue.stop();
      },
    },
  );
}
