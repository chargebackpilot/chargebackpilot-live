import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
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
