import { createRoot, hydrateRoot } from "react-dom/client";
import App, { preloadRouteForPath } from "./App";
import "./index.css";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { applyStandardSeoHead } from "@/components/SeoHead";
import { getRouteMeta } from "@/seo-routes";

const root = document.getElementById("root")!;
const initialRouteMeta = getRouteMeta(window.location.pathname);

if (initialRouteMeta) {
  applyStandardSeoHead({
    title: initialRouteMeta.title,
    description: initialRouteMeta.description,
    canonical: initialRouteMeta.canonical ?? initialRouteMeta.path,
    noindex: initialRouteMeta.noindex,
  });
}

async function boot() {
  if (root.hasChildNodes()) {
    await preloadRouteForPath(window.location.pathname);
  }

  const app = (
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  );

  if (root.hasChildNodes()) {
    hydrateRoot(root, app);
  } else {
    createRoot(root).render(app);
  }
}

void boot();
