// Tipos globales para reCAPTCHA v3
interface Window {
  grecaptcha: {
    ready: (cb: () => void) => void;
    execute: (siteKey: string, options: { action: string }) => Promise<string>;
  };
}
