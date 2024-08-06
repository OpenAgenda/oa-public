import logs from '@openagenda/logs';

const log = logs('tasks/interfaces');

export default (service, options) => {
  const {
    queue,
    config: { interfaces },
  } = service;

  queue.setConsumer((data, cb) => {
    const name = data.shift();

    if (!interfaces[name]) {
      log('interface %s is not defined', interfaces[name]);
    } else {
      interfaces[name].apply(null, data);
    }

    cb();
  });

  queue.launch(options || { interval: 10 });
};
