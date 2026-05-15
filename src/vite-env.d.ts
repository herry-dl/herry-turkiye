/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** İsteğe bağlı; https://www.mapillary.com/dashboard/developers ücretsiz client token */
  readonly VITE_MAPILLARY_ACCESS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
