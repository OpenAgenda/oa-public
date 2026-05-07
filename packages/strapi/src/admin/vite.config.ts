import { mergeConfig } from 'vite';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (config: any) =>
  mergeConfig(config, {
    server: {
      port: Number(process.env.STRAPI_ADMIN_API_PORT) || 5173,
      allowedHosts: true,
    },
  });
