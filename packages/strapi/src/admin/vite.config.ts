import { mergeConfig } from 'vite';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (config: any) =>
  mergeConfig(config, {
    server: {
      allowedHosts: true,
    },
  });
