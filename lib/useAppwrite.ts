import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

interface UseAppwriteOptions<T, P extends object> {
  fn: (params: P) => Promise<T>;
  params?: P;
  skip?: boolean;
}

interface UseAppwriteReturn<T, P> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: (newParams?: P) => Promise<void>;
}

const EMPTY_PARAMS: Record<string, never> = {};

const useAppwrite = <T, P extends object>({
  fn,
  params = EMPTY_PARAMS as P,
  skip = false,
}: UseAppwriteOptions<T, P>): UseAppwriteReturn<T, P> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (fetchParams: P) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fn({ ...fetchParams });
        setData(result);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        Alert.alert("Error", errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fn],
  );

  useEffect(() => {
    if (!skip) {
      void fetchData(params);
    } else {
      setLoading(false);
    }
  }, [fetchData, params, skip]);

  const refetch = useCallback(
    async (newParams?: P) => {
      await fetchData(newParams ?? params);
    },
    [fetchData, params],
  );

  return { data, loading, error, refetch };
};

export default useAppwrite;
