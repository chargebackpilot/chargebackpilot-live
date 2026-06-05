import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";

const root = document.getElementById("root")!;
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
