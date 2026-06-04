// Types for the house logger (@openagenda/logs) — a raw-JS workspace package
// with no shipped declarations. mcp is the only tsc-checked consumer; a tsconfig
// `paths` entry maps the import to THIS file, so `checkJs` never follows into the
// library's JS source and reports its internal type errors. Declaring the (small)
// surface we use keeps the dependency opaque to the checker and documents it.

/**
 * A namespaced logger. Per-level methods take a message + printf-style
 * placeholders and an optional trailing metadata object. Rest-typed so a
 * forwarding wrapper (`(...args) => logger.info(...args)`) type-checks.
 */
interface NamespacedLogger {
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
  verbose(...args: unknown[]): void;
  debug(...args: unknown[]): void;
}

interface Logs {
  (namespace: string): NamespacedLogger;
  init(config: {
    namespace?: string;
    token?: string | null;
    enableDebug?: boolean;
    otel?: boolean;
    prefix?: string;
  }): void;
}

declare const logs: Logs;
export default logs;
