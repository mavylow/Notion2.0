"use client";

import { ReactNode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/store";
import { Provider } from "react-redux";
import "@/i18n";
import { poppins, rubik } from "@/ui/fonts";
import { useTranslation } from "react-i18next";

interface ClientsInitProps {
  children: ReactNode;
}

const queryClient = new QueryClient();

function ClientsInit({ children }: ClientsInitProps) {
  const [ready, setReady] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
    if (ready) {
      if (i18n.language === "ru") {
        document.body.className = rubik.className;
      } else {
        document.body.className = poppins.className;
      }
    }
  }, [i18n.language, ready]);

  // useEffect(() => {
  //   async function enableMocking() {
  //     const { startMockingSocial } = await import(
  //       "@sidekick-monorepo/internship-backend"
  //     );
  //     await startMockingSocial();
  //     setReady(true);
  //   }
  //   enableMocking();
  // }, []);

  if (!ready) {
    return null;
  }

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
}

export default ClientsInit;
