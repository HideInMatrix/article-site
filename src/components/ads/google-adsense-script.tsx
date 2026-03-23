import Script from "next/script";

const client = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;

export function GoogleAdSenseScript() {
  if (!client) {
    return null;
  }

  return (
    <Script
      id="google-adsense"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
    />
  );
}
