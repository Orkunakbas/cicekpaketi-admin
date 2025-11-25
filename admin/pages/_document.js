import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="tr" className="dark">
      <Head>
        {/* Google indexlenmesini engelle */}
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="googlebot" content="noindex, nofollow" />
        <meta name="bingbot" content="noindex, nofollow" />
        
        {/* Admin panel güvenlik */}
        <meta name="description" content="Admin Panel - Yetkisiz Erişim Yasaktır" />
        <meta name="author" content="ORWYS" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="dark">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
