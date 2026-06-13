import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Wizard from "./Wizard";

function createWizardQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export default function WizardRoute() {
  const [queryClient] = useState(createWizardQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <Wizard />
    </QueryClientProvider>
  );
}
