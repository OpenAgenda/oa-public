import { notFound } from 'next/navigation';
import kyErrorToVError from '@/src/utils/kyErrorToVError';
import { logError } from '@/src/utils/sentry';

// 404 is short-circuited via notFound() before reaching the logger.
const SILENT_STATUSES = new Set([401, 403]);

export type ApiError = { statusCode: number; error: any };

export async function parseApiError(err: unknown): Promise<ApiError> {
  const error = await kyErrorToVError(err);
  let statusCode: number = error?.statusCode ?? error?.info?.statusCode ?? 500;
  if (statusCode === 404 && error?.info?.gone) {
    statusCode = 410;
  }
  return { statusCode, error };
}

export async function handleApiError(err: unknown): Promise<never> {
  const { statusCode, error } = await parseApiError(err);

  if (statusCode === 404) {
    notFound();
  }

  if (!SILENT_STATUSES.has(statusCode)) {
    logError(error);
  }

  throw error;
}
