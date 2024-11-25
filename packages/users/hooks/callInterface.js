import logs from '@openagenda/logs';

const log = logs('users/hooks/callInterface');

export default function callInterface(name, options) {
  return (context) => {
    const { config } = context.self;

    if (!config.interfaces || typeof config.interfaces[name] !== 'function') {
      log.info(`callInterface: interface '${name}' does not exist`);

      return context;
    }

    return config.interfaces[name](options)(context);
  };
}
