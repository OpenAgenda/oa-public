import Newsletter from '@openagenda/newsletter';

export function init(config) {
  return Newsletter({
    mailjet: config.mailjet,
    logger: config.getLogConfig('oa', 'newsletter', false),
  });
}
