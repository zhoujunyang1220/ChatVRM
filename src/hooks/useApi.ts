import { useState, useCallback } from 'react';
import { showToast } from '@/components/toast';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  retries?: number;
  retryDelay?: number;
  showErrorToast?: boolean;
}

const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY = 1000;

export const useApi = <T>(
  fetchFn: () => Promise<T>,
  options: UseApiOptions = {}
) => {
  const {
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    showErrorToast = true,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (attempt = 0): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const data = await fetchFn();
        setState((prev) => ({ ...prev, data, loading: false, error: null }));
        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '请求失败';

        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
          return execute(attempt + 1);
        }

        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));

        if (showErrorToast) {
          showToast({
            type: 'error',
            message: errorMessage,
          });
        }

        return null;
      }
    },
    [fetchFn, retries, retryDelay, showErrorToast]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
};

export const handleApiError = (error: unknown, customMessage?: string) => {
  let message = customMessage || '操作失败';

  if (error instanceof Error) {
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      message = '网络连接失败，请检查网络';
    } else if (error.message.includes('timeout')) {
      message = '请求超时，请重试';
    } else {
      message = error.message;
    }
  }

  showToast({
    type: 'error',
    message,
  });

  throw error;
};

export const handleApiSuccess = (message: string) => {
  showToast({
    type: 'success',
    message,
    duration: 3000,
  });
};