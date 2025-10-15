import { sdk as otelSdk } from './tracing.js';

let isShuttingDown = false;

const gracefulShutdown = async (servers, services, signal) => {
  if (isShuttingDown) {
    console.log('Shutdown already in progress. Ignoring signal.');
    return;
  }
  isShuttingDown = true;
  console.log(`Received ${signal}. Gracefully shutting down...`);
  const shutdownTimeout = setTimeout(() => {
    console.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000);

  try {
    if (servers?.web) {
      await new Promise((resolve) => servers.web.close(resolve));
    }
    if (servers?.api) {
      await new Promise((resolve) => servers.api.close(resolve));
    }
    await services.shutdown();
    await otelSdk.shutdown();

    console.log('Graceful shutdown completed successfully.');
    clearTimeout(shutdownTimeout);
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
};

export default function handleGracefulShutdown(servers, services) {
  ['SIGTERM', 'SIGINT'].forEach((signal) => {
    process.on(signal, () => gracefulShutdown(servers, services, signal));
  });
}
