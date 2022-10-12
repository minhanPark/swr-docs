import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SWRConfig } from "swr";

function MyApp({ Component, pageProps }: AppProps) {
  const fetcher = () => {};
  return <Component {...pageProps} />;
}

export default MyApp;
