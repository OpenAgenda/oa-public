import * as Sentry from '@sentry/nextjs';
import { captureReactException } from '@sentry/react';
import type { ErrorInfo } from 'react';

type LogLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

type LogBaseOptions = {
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
  fingerprint?: string[];
  errorInfo?: ErrorInfo;
  console?: boolean;
  skipOriginal?: boolean;
};

type LogOptions = LogBaseOptions & {
  level?: LogLevel;
};

const safeStringify = (value: unknown) => {
  try {
    const seen = new WeakSet();
    return JSON.stringify(
      value,
      (_k, v) => {
        if (typeof v === 'object' && v !== null) {
          if (seen.has(v)) return '[Circular]';
          seen.add(v);
        }
        return v;
      },
      2,
    );
  } catch {
    return String(value);
  }
};

const toError = (maybeError: unknown): Error => {
  if (maybeError instanceof Error) return maybeError;

  if (typeof maybeError === 'string') return new Error(maybeError);

  if (maybeError && typeof maybeError === 'object') {
    const anyErr = maybeError as any;

    const message =
      typeof anyErr.message === 'string'
        ? anyErr.message
        : safeStringify(anyErr);

    const err =
      'cause' in (anyErr ?? {})
        ? new Error(message, { cause: anyErr.cause })
        : new Error(message);

    if (typeof anyErr.stack === 'string') err.stack = anyErr.stack;

    if (typeof anyErr.code === 'string' && anyErr.code.trim())
      err.name = anyErr.code;
    else if (typeof anyErr.name === 'string' && anyErr.name.trim())
      err.name = anyErr.name;

    return err;
  }

  return new Error(String(maybeError));
};

export const logException = (error: unknown, opts?: LogOptions) => {
  const {
    level = 'error',
    extra,
    tags,
    fingerprint,
    errorInfo,
    console: consoleLog = true,
    skipOriginal = false,
  } = opts ?? {};

  Sentry.withScope((scope) => {
    scope.setLevel(level);

    if (tags) scope.setTags(tags);
    if (extra) scope.setExtras(extra);
    if (fingerprint) scope.setFingerprint(fingerprint);

    if (!skipOriginal && !(error instanceof Error)) {
      scope.setExtra('original', error);
    }

    if (errorInfo) {
      captureReactException(error, errorInfo);
    } else {
      Sentry.captureException(toError(error));
    }
  });

  if (consoleLog) {
    const fn =
      level === 'warning'
        ? console.warn
        : level === 'info' || level === 'debug'
          ? console.log
          : console.error;
    fn(error);
  }
};

export const logError = (error: unknown, opts?: LogBaseOptions) =>
  logException(error, { ...opts, level: 'error' });

export const logWarning = (error: unknown, opts?: LogBaseOptions) =>
  logException(error, { ...opts, level: 'warning' });
