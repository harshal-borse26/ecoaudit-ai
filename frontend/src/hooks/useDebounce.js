import { useState, useEffect, useRef } from "react";

/**
 * useDebounce — delays updating the returned value until after the
 * specified delay has elapsed since the last change.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(search, 300);
 *   // use debouncedSearch for filtering/API calls
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, delay]);

  return debouncedValue;
}
