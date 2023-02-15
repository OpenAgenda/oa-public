import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { useApiClient } from '@openagenda/react-shared';

export type GetRequest = AxiosRequestConfig | string | null

interface Return<Data, Error>
  extends Pick<SWRResponse<AxiosResponse<Data>, AxiosError<Error>>,
    'isValidating' | 'status' | 'error' | 'mutate'> {
  data: Data | undefined;
  response: AxiosResponse<Data> | undefined;
}

export interface Config<Data = unknown, Error = unknown>
  extends Omit<SWRConfiguration<AxiosResponse<Data>, AxiosError<Error>>,
    'key' | 'fallbackData'> {
  fallbackData?: Data;
  key?: string;
}

export default function useRequest<Data = unknown, Error = unknown>(
  request: GetRequest,
  { key, fallbackData, ...config }: Config<Data, Error> = {},
): Return<Data, Error> {
  const apiClient: AxiosInstance = useApiClient();

  const requestConfig = typeof request === 'string' ? {
    url: request,
  } : request;

  const {
    data: response,
    ...rest
  } = useSWR<AxiosResponse<Data>, AxiosError<Error>>(
    key || requestConfig,
    () => apiClient.request<Data>(requestConfig),
    {
      ...config,
      fallbackData: fallbackData && {
        status: 200,
        statusText: 'InitialData',
        config: requestConfig,
        headers: {},
        data: fallbackData,
      },
    },
  );

  return {
    data: response?.data,
    response,
    ...rest,
  };
}
