import "@app/globals.css";
import Header from "@components/Header";
import Footer from "@components/Footer";
import { createGlobalStyle } from "styled-components";
import ClientsInit from "@components/ClientsInit";
import ContextProvider from "@providers/ContextProvider";
import { Metadata } from "next";

const Global = createGlobalStyle`
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
`;

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "Sidekick media",
  description: "Social network from Sidekick",
  keywords: ["social", "network", "posts", "community"],
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <meta name="author" content="Sidekick" />
        <title>social_media</title>
      </head>
      <body>
        <ClientsInit>
          <ContextProvider>
            <div id="root">
              <Global />
              <Header />
              <div className="wrapper">{children}</div>
              <Footer />
            </div>
          </ContextProvider>
        </ClientsInit>
        <div id="modal"></div>
      </body>
    </html>
  );
}
