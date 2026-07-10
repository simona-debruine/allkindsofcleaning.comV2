import { Suspense, useEffect } from "react";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import routes from "./config";

let navigateResolver: (navigate: ReturnType<typeof useNavigate>) => void;

declare global {
  interface Window {
    REACT_APP_NAVIGATE: ReturnType<typeof useNavigate>;
  }
}

export const navigatePromise = new Promise<NavigateFunction>((resolve) => {
  navigateResolver = resolve;
});

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-background-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-500" />
    </div>
  );
}

export function AppRoutes() {
  const element = useRoutes(routes);
  const navigate = useNavigate();
  useEffect(() => {
    window.REACT_APP_NAVIGATE = navigate;
    navigateResolver(window.REACT_APP_NAVIGATE);
  });
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}
