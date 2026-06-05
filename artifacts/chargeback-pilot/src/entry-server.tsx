import { renderToString } from "react-dom/server";
import App from "./App";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";

export function render(url: string) {
  return renderToString(
    <AppErrorBoundary>
      <App ssrPath={url} />
    </AppErrorBoundary>,
  );
}