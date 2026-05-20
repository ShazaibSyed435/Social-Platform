import { useCallback, useEffect, useState } from 'react';

export default function useAsync(fn, deps = [], immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState('');

  const run = useCallback(async (...args) => {
    setLoading(true);
    setError('');
    try {
      const result = await fn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (immediate) {
      run().catch(() => {});
    }
  }, [run, immediate]);

  return { data, setData, loading, error, run };
}
