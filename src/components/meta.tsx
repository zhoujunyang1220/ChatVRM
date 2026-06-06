import { buildUrl } from "@/utils/buildUrl";
import Head from "next/head";
export const Meta = () => {
  const title = "ChatVRM";
  const description =
    "You can enjoy conversations with 3D characters using only a web browser using a microphone, text input, and speech synthesis. You can also change the character (VRM), set the personality, and adjust the voice.";
  const imageUrl = "https://chat-vrm-window.vercel.app/ogp-en.png";
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="ChatVRM" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#7C5CBF" />
    </Head>
  );
};
