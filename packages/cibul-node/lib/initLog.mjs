import logs from '@openagenda/logs';
import config from '../config/index.mjs';

logs.init(config.logger || config.getLogConfig('oa', 'oa', false));
