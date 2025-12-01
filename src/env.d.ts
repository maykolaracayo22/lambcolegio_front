/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHATSAPP_API_URL: string
  readonly VITE_WHATSAPP_API_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}