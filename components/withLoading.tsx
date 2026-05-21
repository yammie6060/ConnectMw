"use client";

import { useState, useEffect, ComponentType } from "react";
import { LoadingScreen } from "./LoadingScreen";

interface WithLoadingProps {
  minLoadTime?: number;
}

export function withLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
  minLoadTime: number = 5000
) {
  return function WithLoadingComponent(props: P & WithLoadingProps) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, minLoadTime);

      return () => clearTimeout(timer);
    }, [minLoadTime]);

    if (isLoading) {
      return <LoadingScreen minDisplayTime={minLoadTime} />;
    }

    return <WrappedComponent {...props} />;
  };
}