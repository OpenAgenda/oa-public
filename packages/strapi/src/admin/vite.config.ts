import { mergeConfig } from 'vite';

export default (config) =>
  mergeConfig(config, {
    server: {
      allowedHosts: true,
    },
  });
