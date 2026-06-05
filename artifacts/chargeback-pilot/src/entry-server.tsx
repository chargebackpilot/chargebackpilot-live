import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import App from "./App";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";

export function render(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let html = "";
    const stream = new PassThrough();

    stream.setEncoding("utf8");
    stream.on("data", (chunk) => {
      html += chunk;
    });
    stream.on("end", () => resolve(html));
    stream.on("error", reject);

    const { pipe, abort } = renderToPipeableStream(
      <AppErrorBoundary>
        <App ssrPath={url} />
      </AppErrorBoundary>,
      {
        onAllReady() {
          pipe(stream);
        },
        onError(error) {
          reject(error);
        },
      },
    );

    setTimeout(() => abort(), 10000).unref?.();
  });
}