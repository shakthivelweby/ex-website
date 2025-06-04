"use client";

import { createContext, useContext, useState, useCallback } from "react";

const LoadingContext = createContext({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = useCallback(() => {
    setLoadingCount((prev) => prev + 1);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingCount((prev) => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        setIsLoading(false);
        return 0;
      }
      return newCount;
    });
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => useContext(LoadingContext); 