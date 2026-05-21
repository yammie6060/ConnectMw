"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";

interface LoadingContextType {
  startLoading: (duration?: number) => void;
  stopLoading: () => void;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [minTime, setMinTime] = useState(5000);

  const startLoading = (duration: number = 5000) => {
    setMinTime(duration);
    setIsLoading(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider value={{ startLoading, stopLoading, isLoading }}>
      {isLoading && <LoadingScreen minDisplayTime={minTime} onLoadingComplete={stopLoading} />}
      {children}
    </LoadingContext.Provider>
  );
}

